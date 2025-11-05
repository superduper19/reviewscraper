import { Pool, PoolClient } from 'pg';
import { getConnectionString } from '../utils/aws-rds';

// PostgreSQL connection pool
let pool: Pool | null = null;

// Initialize PostgreSQL connection
export async function initializePostgreSQL(): Promise<void> {
  try {
    const connectionString = await getConnectionString();
    if (!connectionString) {
      throw new Error('Unable to get PostgreSQL connection string');
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    const client = await pool.connect();
    console.log('✅ PostgreSQL connection established');
    client.release();
  } catch (error) {
    console.error('❌ Failed to initialize PostgreSQL:', error);
    throw error;
  }
}

// Get database connection
export async function getDbConnection(): Promise<PoolClient> {
  if (!pool) {
    await initializePostgreSQL();
  }
  
  if (!pool) {
    throw new Error('PostgreSQL pool not initialized');
  }
  
  return pool.connect();
}

// Close database connection
export async function closePostgreSQL(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('PostgreSQL connection closed');
  }
}

// Interfaces (same as SQLite)
export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  is_active: boolean;
}

export interface Scraper {
  id: number;
  user_id: number;
  name: string;
  platform: string;
  target_url: string;
  configuration: any;
  status: 'active' | 'paused' | 'error' | 'completed';
  last_run?: Date;
  next_run?: Date;
  schedule?: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  success_rate: number;
  total_reviews: number;
}

export interface Review {
  id: number;
  scraper_id: number;
  platform: string;
  author_name: string;
  author_location?: string;
  rating: number;
  title: string;
  content: string;
  review_date: Date;
  scraped_date: Date;
  verified_purchase?: boolean;
  helpful_votes?: number;
  source_url: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
}

export interface ScrapingJob {
  id: number;
  scraper_id: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: Date;
  completed_at?: Date;
  error_message?: string;
  reviews_scraped: number;
  execution_time?: number;
  created_at: Date;
}

// Base Database Model
export abstract class PostgreSQLModel {
  protected async query(text: string, params?: any[]): Promise<any> {
    const client = await getDbConnection();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  protected async queryOne(text: string, params?: any[]): Promise<any> {
    const result = await this.query(text, params);
    return result.rows[0] || null;
  }

  protected async queryAll(text: string, params?: any[]): Promise<any[]> {
    const result = await this.query(text, params);
    return result.rows;
  }
}

// User Model
export class PostgreSQLUserModel extends PostgreSQLModel {
  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await this.queryOne(query, [
      user.email,
      user.password_hash,
      user.first_name,
      user.last_name,
      user.role,
      user.is_active
    ]);
    
    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    return await this.queryOne(query, [email]);
  }

  async findById(id: number): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1 AND is_active = true';
    return await this.queryOne(query, [id]);
  }

  async updateLastLogin(id: number): Promise<void> {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
    await this.query(query, [id]);
  }

  async update(id: number, updates: Partial<User>): Promise<User | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.queryOne(query, [id, ...Object.values(updates)]);
    return result;
  }

  async getAll(): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE is_active = true ORDER BY created_at DESC';
    return await this.queryAll(query);
  }
}

// Scraper Model
export class PostgreSQLScraperModel extends PostgreSQLModel {
  async create(scraper: Omit<Scraper, 'id' | 'created_at' | 'updated_at'>): Promise<Scraper> {
    const query = `
      INSERT INTO scrapers (user_id, name, platform, target_url, configuration, status, schedule, is_active, success_rate, total_reviews)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const result = await this.queryOne(query, [
      scraper.user_id,
      scraper.name,
      scraper.platform,
      scraper.target_url,
      JSON.stringify(scraper.configuration),
      scraper.status,
      scraper.schedule || null,
      scraper.is_active,
      scraper.success_rate,
      scraper.total_reviews
    ]);
    
    return {
      ...result,
      configuration: JSON.parse(result.configuration || '{}')
    };
  }

  async findById(id: number): Promise<Scraper | null> {
    const query = `
      SELECT s.*, u.email as user_email 
      FROM scrapers s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.id = $1 AND s.is_active = true
    `;
    
    const result = await this.queryOne(query, [id]);
    if (result) {
      result.configuration = JSON.parse(result.configuration || '{}');
    }
    return result;
  }

  async findByUserId(userId: number): Promise<Scraper[]> {
    const query = `
      SELECT * FROM scrapers 
      WHERE user_id = $1 AND is_active = true 
      ORDER BY created_at DESC
    `;
    
    const results = await this.queryAll(query, [userId]);
    return results.map(result => ({
      ...result,
      configuration: JSON.parse(result.configuration || '{}')
    }));
  }

  async update(id: number, updates: Partial<Scraper>): Promise<Scraper | null> {
    if (updates.configuration) {
      updates.configuration = JSON.stringify(updates.configuration);
    }
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const query = `
      UPDATE scrapers 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.queryOne(query, [id, ...Object.values(updates)]);
    if (result) {
      result.configuration = JSON.parse(result.configuration || '{}');
    }
    return result;
  }

  async delete(id: number): Promise<boolean> {
    const query = 'UPDATE scrapers SET is_active = false WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rowCount > 0;
  }

  async getAll(): Promise<Scraper[]> {
    const query = `
      SELECT s.*, u.email as user_email 
      FROM scrapers s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.is_active = true 
      ORDER BY s.created_at DESC
    `;
    
    const results = await this.queryAll(query);
    return results.map(result => ({
      ...result,
      configuration: JSON.parse(result.configuration || '{}')
    }));
  }

  async getStats(): Promise<any> {
    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        AVG(success_rate) as avg_success_rate
      FROM scrapers 
      WHERE is_active = true 
      GROUP BY status
    `;
    
    return await this.queryAll(query);
  }
}

// Review Model
export class PostgreSQLReviewModel extends PostgreSQLModel {
  async create(review: Omit<Review, 'id'>): Promise<Review> {
    const query = `
      INSERT INTO reviews (scraper_id, platform, author_name, author_location, rating, title, content, review_date, verified_purchase, helpful_votes, source_url, sentiment, keywords)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const result = await this.queryOne(query, [
      review.scraper_id,
      review.platform,
      review.author_name,
      review.author_location || null,
      review.rating,
      review.title,
      review.content,
      review.review_date,
      review.verified_purchase || false,
      review.helpful_votes || 0,
      review.source_url,
      review.sentiment || null,
      review.keywords ? JSON.stringify(review.keywords) : null
    ]);
    
    return {
      ...result,
      keywords: result.keywords ? JSON.parse(result.keywords) : []
    };
  }

  async findById(id: number): Promise<Review | null> {
    const query = 'SELECT * FROM reviews WHERE id = $1';
    const result = await this.queryOne(query, [id]);
    if (result) {
      result.keywords = result.keywords ? JSON.parse(result.keywords) : [];
    }
    return result;
  }

  async findByUserId(userId: number, limit = 50, offset = 0): Promise<Review[]> {
    const query = `
      SELECT r.*, s.name as scraper_name 
      FROM reviews r 
      JOIN scrapers s ON r.scraper_id = s.id 
      WHERE s.user_id = $1 
      ORDER BY r.scraped_date DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const results = await this.queryAll(query, [userId, limit, offset]);
    return results.map(result => ({
      ...result,
      keywords: result.keywords ? JSON.parse(result.keywords) : []
    }));
  }

  async findByScraperId(scraperId: number, limit = 50, offset = 0): Promise<Review[]> {
    const query = `
      SELECT * FROM reviews 
      WHERE scraper_id = $1 
      ORDER BY scraped_date DESC 
      LIMIT $2 OFFSET $3
    `;
    
    const results = await this.queryAll(query, [scraperId, limit, offset]);
    return results.map(result => ({
      ...result,
      keywords: result.keywords ? JSON.parse(result.keywords) : []
    }));
  }

  async searchReviews(userId: number, searchTerm: string, filters: any = {}): Promise<Review[]> {
    let whereClause = 'WHERE s.user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;
    
    if (searchTerm) {
      whereClause += ` AND (r.author_name ILIKE $${paramIndex} OR r.title ILIKE $${paramIndex + 1} OR r.content ILIKE $${paramIndex + 2})`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
      paramIndex += 3;
    }
    
    if (filters.platform) {
      whereClause += ` AND r.platform = $${paramIndex}`;
      params.push(filters.platform);
      paramIndex++;
    }
    
    if (filters.rating) {
      whereClause += ` AND r.rating = $${paramIndex}`;
      params.push(filters.rating);
      paramIndex++;
    }
    
    if (filters.dateFrom) {
      whereClause += ` AND r.review_date >= $${paramIndex}`;
      params.push(filters.dateFrom);
      paramIndex++;
    }
    
    if (filters.dateTo) {
      whereClause += ` AND r.review_date <= $${paramIndex}`;
      params.push(filters.dateTo);
      paramIndex++;
    }
    
    if (filters.sentiment) {
      whereClause += ` AND r.sentiment = $${paramIndex}`;
      params.push(filters.sentiment);
      paramIndex++;
    }
    
    const query = `
      SELECT r.*, s.name as scraper_name 
      FROM reviews r 
      JOIN scrapers s ON r.scraper_id = s.id 
      ${whereClause} 
      ORDER BY r.scraped_date DESC
    `;
    
    const results = await this.queryAll(query, params);
    return results.map(result => ({
      ...result,
      keywords: result.keywords ? JSON.parse(result.keywords) : []
    }));
  }

  async getStats(userId: number): Promise<any> {
    const totalQuery = `
      SELECT COUNT(*) as total 
      FROM reviews r 
      JOIN scrapers s ON r.scraper_id = s.id 
      WHERE s.user_id = $1
    `;
    
    const avgRatingQuery = `
      SELECT AVG(r.rating) as avg_rating 
      FROM reviews r 
      JOIN scrapers s ON r.scraper_id = s.id 
      WHERE s.user_id = $1
    `;
    
    const platformQuery = `
      SELECT r.platform, COUNT(*) as count 
      FROM reviews r 
      JOIN scrapers s ON r.scraper_id = s.id 
      WHERE s.user_id = $1 
      GROUP BY r.platform
    `;
    
    const sentimentQuery = `
      SELECT r.sentiment, COUNT(*) as count 
      FROM reviews r 
      JOIN scrapers s ON r.scraper_id = s.id 
      WHERE s.user_id = $1 AND r.sentiment IS NOT NULL 
      GROUP BY r.sentiment
    `;
    
    const [total, avgRating, platforms, sentiments] = await Promise.all([
      this.queryOne(totalQuery, [userId]),
      this.queryOne(avgRatingQuery, [userId]),
      this.queryAll(platformQuery, [userId]),
      this.queryAll(sentimentQuery, [userId])
    ]);
    
    return {
      total_reviews: total.total,
      avg_rating: avgRating.avg_rating,
      platforms: platforms.reduce((acc: any, p: any) => ({ ...acc, [p.platform]: p.count }), {}),
      sentiments: sentiments.reduce((acc: any, s: any) => ({ ...acc, [s.sentiment]: s.count }), {})
    };
  }
}

// ScrapingJob Model
export class PostgreSQLScrapingJobModel extends PostgreSQLModel {
  async create(job: Omit<ScrapingJob, 'id' | 'created_at'>): Promise<ScrapingJob> {
    const query = `
      INSERT INTO scraping_jobs (scraper_id, status, started_at, completed_at, error_message, reviews_scraped, execution_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await this.queryOne(query, [
      job.scraper_id,
      job.status,
      job.started_at || null,
      job.completed_at || null,
      job.error_message || null,
      job.reviews_scraped,
      job.execution_time || null
    ]);
    
    return result;
  }

  async findById(id: number): Promise<ScrapingJob | null> {
    const query = 'SELECT * FROM scraping_jobs WHERE id = $1';
    return await this.queryOne(query, [id]);
  }

  async findByScraperId(scraperId: number, limit = 10): Promise<ScrapingJob[]> {
    const query = `
      SELECT * FROM scraping_jobs 
      WHERE scraper_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    return await this.queryAll(query, [scraperId, limit]);
  }

  async update(id: number, updates: Partial<ScrapingJob>): Promise<ScrapingJob | null> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const query = `
      UPDATE scraping_jobs 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;
    
    return await this.queryOne(query, [id, ...Object.values(updates)]);
  }
}

// Database initialization for PostgreSQL
export async function initializePostgreSQLDatabase(): Promise<void> {
  try {
    console.log('🗄️ Initializing PostgreSQL database...');
    
    await initializePostgreSQL();
    
    // Create tables if they don't exist
    const client = await getDbConnection();
    
    try {
      // Users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP,
          is_active BOOLEAN DEFAULT true
        )
      `);
      
      // Scrapers table
      await client.query(`
        CREATE TABLE IF NOT EXISTS scrapers (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          platform VARCHAR(100) NOT NULL,
          target_url TEXT NOT NULL,
          configuration JSONB,
          status VARCHAR(20) DEFAULT 'paused' CHECK (status IN ('active', 'paused', 'error', 'completed')),
          last_run TIMESTAMP,
          next_run TIMESTAMP,
          schedule VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT true,
          success_rate DECIMAL(5,2) DEFAULT 0.00,
          total_reviews INTEGER DEFAULT 0
        )
      `);
      
      // Reviews table
      await client.query(`
        CREATE TABLE IF NOT EXISTS reviews (
          id SERIAL PRIMARY KEY,
          scraper_id INTEGER REFERENCES scrapers(id) ON DELETE CASCADE,
          platform VARCHAR(100) NOT NULL,
          author_name VARCHAR(255) NOT NULL,
          author_location VARCHAR(255),
          rating INTEGER NOT NULL,
          title VARCHAR(500),
          content TEXT NOT NULL,
          review_date TIMESTAMP NOT NULL,
          scraped_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          verified_purchase BOOLEAN,
          helpful_votes INTEGER DEFAULT 0,
          source_url TEXT NOT NULL,
          sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
          keywords TEXT[]
        )
      `);
      
      // Scraping jobs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS scraping_jobs (
          id SERIAL PRIMARY KEY,
          scraper_id INTEGER REFERENCES scrapers(id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
          started_at TIMESTAMP,
          completed_at TIMESTAMP,
          error_message TEXT,
          reviews_scraped INTEGER DEFAULT 0,
          execution_time INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create indexes for better performance
      await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_scrapers_user_id ON scrapers(user_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_scraper_id ON reviews(scraper_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_platform ON reviews(platform)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON reviews(sentiment)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_scraping_jobs_scraper_id ON scraping_jobs(scraper_id)');
      
      // Insert mock data if no users exist
      const userCount = await this.queryOne('SELECT COUNT(*) as count FROM users');
      if (userCount.count === 0) {
        await this.query(`
          INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
          VALUES 
            ('admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin', true),
            ('user@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'user', true)
        `);
        console.log('✅ Mock users inserted');
      }
      
      console.log('✅ PostgreSQL database initialized successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error initializing PostgreSQL database:', error);
    throw error;
  }
}