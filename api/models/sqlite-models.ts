import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create SQLite database connection
const db = new Database(path.join(__dirname, '../../review-scraper.db'));

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

export class DatabaseModel {
  protected db: Database.Database;

  constructor() {
    this.db = db;
  }

  async initializeDatabase() {
    this.createUsersTable();
    this.createScrapersTable();
    this.createReviewsTable();
    this.createScrapingJobsTable();
    this.insertMockData();
  }

  private createUsersTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1
      )
    `;
    
    this.db.exec(query);
    console.log('Users table created successfully');
  }

  private createScrapersTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS scrapers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        target_url TEXT NOT NULL,
        configuration TEXT,
        status TEXT DEFAULT 'paused' CHECK (status IN ('active', 'paused', 'error', 'completed')),
        last_run DATETIME,
        next_run DATETIME,
        schedule TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        success_rate REAL DEFAULT 0.00,
        total_reviews INTEGER DEFAULT 0
      )
    `;
    
    this.db.exec(query);
    console.log('Scrapers table created successfully');
  }

  private createReviewsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scraper_id INTEGER REFERENCES scrapers(id) ON DELETE CASCADE,
        platform TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_location TEXT,
        rating INTEGER NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        review_date DATETIME NOT NULL,
        scraped_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        verified_purchase BOOLEAN,
        helpful_votes INTEGER DEFAULT 0,
        source_url TEXT NOT NULL,
        sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
        keywords TEXT
      )
    `;
    
    this.db.exec(query);
    console.log('Reviews table created successfully');
  }

  private createScrapingJobsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS scraping_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scraper_id INTEGER REFERENCES scrapers(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
        started_at DATETIME,
        completed_at DATETIME,
        error_message TEXT,
        reviews_scraped INTEGER DEFAULT 0,
        execution_time INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    this.db.exec(query);
    console.log('Scraping jobs table created successfully');
  }

  private insertMockData() {
    // Check if we already have data
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    
    if (userCount.count === 0) {
      // Insert mock user
      const insertUser = this.db.prepare(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertUser.run('admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin', 1);
      insertUser.run('user@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'user', 1);
      
      console.log('Mock users inserted');
    }
  }
}

export class UserModel extends DatabaseModel {
  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const stmt = this.db.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(user.email, user.password_hash, user.first_name, user.last_name, user.role, user.is_active);
    
    return this.findById(result.lastInsertRowid as number) as Promise<User>;
  }

  async findByEmail(email: string): Promise<User | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1');
    const result = stmt.get(email) as User | undefined;
    return result || null;
  }

  async findById(id: number): Promise<User | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ? AND is_active = 1');
    const result = stmt.get(id) as User | undefined;
    return result || null;
  }

  async updateLastLogin(id: number): Promise<void> {
    const stmt = this.db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  }

  async update(id: number, updates: Partial<User>): Promise<User | null> {
    const setClause = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const stmt = this.db.prepare(`
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? 
    `);
    
    const result = stmt.run(...Object.values(updates), id);
    return this.findById(id);
  }

  async getAll(): Promise<User[]> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE is_active = 1 ORDER BY created_at DESC');
    return stmt.all() as User[];
  }
}

export class ScraperModel extends DatabaseModel {
  async create(scraper: Omit<Scraper, 'id' | 'created_at' | 'updated_at'>): Promise<Scraper> {
    const stmt = this.db.prepare(`
      INSERT INTO scrapers (user_id, name, platform, target_url, configuration, status, schedule, is_active, success_rate, total_reviews)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
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
    );
    
    return this.findById(result.lastInsertRowid as number) as Promise<Scraper>;
  }

  async findById(id: number): Promise<Scraper | null> {
    const stmt = this.db.prepare(`
      SELECT s.*, u.email as user_email 
      FROM scrapers s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.id = ? AND s.is_active = 1
    `);
    const result = stmt.get(id) as any;
    
    if (result) {
      result.configuration = JSON.parse(result.configuration || '{}');
      return result as Scraper;
    }
    return null;
  }

  async findByUserId(userId: number): Promise<Scraper[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM scrapers WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC
    `);
    const results = stmt.all(userId) as any[];
    
    return results.map(result => ({
      ...result,
      configuration: JSON.parse(result.configuration || '{}')
    })) as Scraper[];
  }

  async update(id: number, updates: Partial<Scraper>): Promise<Scraper | null> {
    if (updates.configuration) {
      updates.configuration = JSON.stringify(updates.configuration);
    }
    
    const setClause = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const stmt = this.db.prepare(`
      UPDATE scrapers 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? 
    `);
    
    stmt.run(...Object.values(updates), id);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const stmt = this.db.prepare('UPDATE scrapers SET is_active = 0 WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  async getAll(): Promise<Scraper[]> {
    const stmt = this.db.prepare(`
      SELECT s.*, u.email as user_email 
      FROM scrapers s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.is_active = 1 
      ORDER BY s.created_at DESC
    `);
    const results = stmt.all() as any[];
    
    return results.map(result => ({
      ...result,
      configuration: JSON.parse(result.configuration || '{}')
    })) as Scraper[];
  }

  async getStats(): Promise<any> {
    const stmt = this.db.prepare(`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(success_rate) as avg_success_rate
      FROM scrapers 
      WHERE is_active = 1 
      GROUP BY status
    `);
    return stmt.all();
  }
}

export class ReviewModel extends DatabaseModel {
  async create(review: Omit<Review, 'id'>): Promise<Review> {
    const stmt = this.db.prepare(`
      INSERT INTO reviews (scraper_id, platform, author_name, author_location, rating, title, content, review_date, verified_purchase, helpful_votes, source_url, sentiment, keywords)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
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
    );
    
    return this.findById(result.lastInsertRowid as number) as Promise<Review>;
  }

  async findById(id: number): Promise<Review | null> {
    const stmt = this.db.prepare('SELECT * FROM reviews WHERE id = ?');
    const result = stmt.get(id) as any;
    
    if (result) {
      result.keywords = result.keywords ? JSON.parse(result.keywords) : [];
      return result as Review;
    }
    return null;
  }

  async findByUserId(userId: number, limit = 50, offset = 0): Promise<Review[]> {
    const stmt = this.db.prepare(`
      SELECT r.*, s.name as scraper_name 
      FROM reviews r 
      JOIN scrapers s ON r.scraper_id = s.id 
      WHERE s.user_id = ? 
      ORDER BY r.scraped_date DESC 
      LIMIT ? OFFSET ?
    `);
    
    const results = stmt.all(userId, limit, offset) as any[];
    
    return results.map(result => ({
      ...result,
      keywords: result.keywords ? JSON.parse(result.keywords) : []
    })) as Review[];
  }

  async findByScraperId(scraperId: number, limit = 50, offset = 0): Promise<Review[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM reviews 
      WHERE scraper_id = ? 
      ORDER BY scraped_date DESC 
      LIMIT ? OFFSET ?
    `);
    
    const results = stmt.all(scraperId, limit, offset) as any[];
    
    return results.map(result => ({
      ...result,
      keywords: result.keywords ? JSON.parse(result.keywords) : []
    })) as Review[];
  }

  async searchReviews(userId: number, searchTerm: string, filters: any = {}): Promise<Review[]> {
    let whereClause = 'WHERE s.user_id = ?';
    const params: any[] = [userId];
    
    if (searchTerm) {
      whereClause += ' AND (r.author_name LIKE ? OR r.title LIKE ? OR r.content LIKE ?)';
      params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
    }
    
    if (filters.platform) {
      whereClause += ' AND r.platform = ?';
      params.push(filters.platform);
    }
    
    if (filters.rating) {
      whereClause += ' AND r.rating = ?';
      params.push(filters.rating);
    }
    
    if (filters.dateFrom) {
      whereClause += ' AND r.review_date >= ?';
      params.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
      whereClause += ' AND r.review_date <= ?';
      params.push(filters.dateTo);
    }
    
    if (filters.sentiment) {
      whereClause += ' AND r.sentiment = ?';
      params.push(filters.sentiment);
    }
    
    const stmt = this.db.prepare(`
      SELECT r.*, s.name as scraper_name 
      FROM reviews r 
      JOIN scrapers s ON r.scraper_id = s.id 
      ${whereClause} 
      ORDER BY r.scraped_date DESC
    `);
    
    const results = stmt.all(...params) as any[];
    
    return results.map(result => ({
      ...result,
      keywords: result.keywords ? JSON.parse(result.keywords) : []
    })) as Review[];
  }

  async getStats(userId: number): Promise<any> {
    const totalStmt = this.db.prepare(`
      SELECT COUNT(*) as total 
      FROM reviews r 
      JOIN scrapers s ON r.scraper_id = s.id 
      WHERE s.user_id = ?
    `);
    
    const avgRatingStmt = this.db.prepare(`
      SELECT AVG(r.rating) as avg_rating 
      FROM reviews r 
      JOIN scrapers s ON r.scraper_id = s.id 
      WHERE s.user_id = ?
    `);
    
    const platformStmt = this.db.prepare(`
      SELECT r.platform, COUNT(*) as count 
      FROM reviews r 
      JOIN scrapers s ON r.scraper_id = s.id 
      WHERE s.user_id = ? 
      GROUP BY r.platform
    `);
    
    const sentimentStmt = this.db.prepare(`
      SELECT r.sentiment, COUNT(*) as count 
      FROM reviews r 
      JOIN scrapers s ON r.scraper_id = s.id 
      WHERE s.user_id = ? AND r.sentiment IS NOT NULL 
      GROUP BY r.sentiment
    `);
    
    const total = totalStmt.get(userId) as { total: number };
    const avgRating = avgRatingStmt.get(userId) as { avg_rating: number };
    const platforms = platformStmt.all(userId) as any[];
    const sentiments = sentimentStmt.all(userId) as any[];
    
    return {
      total_reviews: total.total,
      avg_rating: avgRating.avg_rating,
      platforms: platforms.reduce((acc, p) => ({ ...acc, [p.platform]: p.count }), {}),
      sentiments: sentiments.reduce((acc, s) => ({ ...acc, [s.sentiment]: s.count }), {})
    };
  }
}

export class ScrapingJobModel extends DatabaseModel {
  async create(job: Omit<ScrapingJob, 'id' | 'created_at'>): Promise<ScrapingJob> {
    const stmt = this.db.prepare(`
      INSERT INTO scraping_jobs (scraper_id, status, started_at, completed_at, error_message, reviews_scraped, execution_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      job.scraper_id,
      job.status,
      job.started_at || null,
      job.completed_at || null,
      job.error_message || null,
      job.reviews_scraped,
      job.execution_time || null
    );
    
    return this.findById(result.lastInsertRowid as number) as Promise<ScrapingJob>;
  }

  async findById(id: number): Promise<ScrapingJob | null> {
    const stmt = this.db.prepare('SELECT * FROM scraping_jobs WHERE id = ?');
    const result = stmt.get(id) as ScrapingJob | undefined;
    return result || null;
  }

  async findByScraperId(scraperId: number, limit = 10): Promise<ScrapingJob[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM scraping_jobs 
      WHERE scraper_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(scraperId, limit) as ScrapingJob[];
  }

  async update(id: number, updates: Partial<ScrapingJob>): Promise<ScrapingJob | null> {
    const setClause = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const stmt = this.db.prepare(`
      UPDATE scraping_jobs 
      SET ${setClause} 
      WHERE id = ? 
    `);
    
    stmt.run(...Object.values(updates), id);
    return this.findById(id);
  }
}

// Initialize all tables
export async function initializeDatabase(): Promise<void> {
  const dbModel = new DatabaseModel();
  
  try {
    console.log('Initializing database tables...');
    await dbModel.initializeDatabase();
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}