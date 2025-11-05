import express from 'express';
import { ReviewModel } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';
import { query, validationResult } from 'express-validator';

const router = express.Router();
const reviewModel = new ReviewModel();

// Get reviews for the authenticated user
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('platform').optional().isString(),
  query('minRating').optional().isInt({ min: 1, max: 5 }),
  query('maxRating').optional().isInt({ min: 1, max: 5 }),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('sentiment').optional().isIn(['positive', 'negative', 'neutral'])
], async (req: AuthRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const filters = {
      search: req.query.search as string,
      platform: req.query.platform as string,
      minRating: req.query.minRating ? parseInt(req.query.minRating as string) : undefined,
      maxRating: req.query.maxRating ? parseInt(req.query.maxRating as string) : undefined,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      sentiment: req.query.sentiment as string
    };

    // Get reviews with filters
    let reviews;
    if (filters.search || filters.platform || filters.minRating || filters.dateFrom || filters.sentiment) {
      reviews = await reviewModel.searchReviews(user.id, filters.search || '', filters);
    } else {
      reviews = await reviewModel.findByUserId(user.id, limit, offset);
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reviews r
      JOIN scrapers s ON r.scraper_id = s.id
      WHERE s.user_id = $1 AND s.is_active = true
    `;
    
    let countResult;
    if (filters.search || filters.platform || filters.minRating || filters.dateFrom || filters.sentiment) {
      let countParams = [user.id];
      let countQueryWithFilters = countQuery;
      let paramIndex = 2;

      if (filters.search) {
        countQueryWithFilters += ` AND (r.content ILIKE $${paramIndex} OR r.title ILIKE $${paramIndex} OR r.author_name ILIKE $${paramIndex})`;
        countParams.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters.platform) {
        countQueryWithFilters += ` AND r.platform = $${paramIndex}`;
        countParams.push(filters.platform);
        paramIndex++;
      }

      if (filters.minRating) {
        countQueryWithFilters += ` AND r.rating >= $${paramIndex}`;
        countParams.push(filters.minRating);
        paramIndex++;
      }

      if (filters.dateFrom) {
        countQueryWithFilters += ` AND r.review_date >= $${paramIndex}`;
        countParams.push(filters.dateFrom);
        paramIndex++;
      }

      if (filters.dateTo) {
        countQueryWithFilters += ` AND r.review_date <= $${paramIndex}`;
        countParams.push(filters.dateTo);
        paramIndex++;
      }

      countResult = await reviewModel.query(countQueryWithFilters, countParams);
    } else {
      countResult = await reviewModel.query(countQuery, [user.id]);
    }

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      reviews: reviews.map(review => ({
        id: review.id,
        scraperId: review.scraper_id,
        platform: review.platform,
        authorName: review.author_name,
        authorLocation: review.author_location,
        rating: review.rating,
        title: review.title,
        content: review.content,
        reviewDate: review.review_date,
        scrapedDate: review.scraped_date,
        verifiedPurchase: review.verified_purchase,
        helpfulVotes: review.helpful_votes,
        sourceUrl: review.source_url,
        sentiment: review.sentiment,
        keywords: review.keywords
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reviews for a specific scraper
router.get('/scraper/:scraperId', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: AuthRequest, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { scraperId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // Verify the scraper belongs to the user
    const { ScraperModel } = await import('../models');
    const scraperModel = new ScraperModel();
    const scraper = await scraperModel.findById(parseInt(scraperId));
    
    if (!scraper || scraper.user_id !== user.id) {
      return res.status(404).json({ error: 'Scraper not found' });
    }

    const reviews = await reviewModel.findByScraperId(parseInt(scraperId), limit, offset);

    // Get total count
    const countResult = await reviewModel.query(
      'SELECT COUNT(*) as total FROM reviews WHERE scraper_id = $1',
      [scraperId]
    );
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      reviews: reviews.map(review => ({
        id: review.id,
        scraperId: review.scraper_id,
        platform: review.platform,
        authorName: review.author_name,
        authorLocation: review.author_location,
        rating: review.rating,
        title: review.title,
        content: review.content,
        reviewDate: review.review_date,
        scrapedDate: review.scraped_date,
        verifiedPurchase: review.verified_purchase,
        helpfulVotes: review.helpful_votes,
        sourceUrl: review.source_url,
        sentiment: review.sentiment,
        keywords: review.keywords
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get scraper reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get review statistics
router.get('/stats', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const stats = await reviewModel.getStatsByUserId(user.id);
    const platformStats = await reviewModel.getStatsByPlatform(user.id);

    res.json({
      overall: {
        totalReviews: parseInt(stats.total_reviews) || 0,
        averageRating: parseFloat(stats.average_rating) || 0,
        positiveReviews: parseInt(stats.positive_reviews) || 0,
        negativeReviews: parseInt(stats.negative_reviews) || 0,
        neutralReviews: parseInt(stats.neutral_reviews) || 0,
        platformsCount: parseInt(stats.platforms_count) || 0,
        uniqueReviewers: parseInt(stats.unique_reviewers) || 0
      },
      byPlatform: platformStats.map(stat => ({
        platform: stat.platform,
        reviewCount: parseInt(stat.review_count) || 0,
        averageRating: parseFloat(stat.average_rating) || 0,
        positiveCount: parseInt(stat.positive_count) || 0,
        negativeCount: parseInt(stat.negative_count) || 0
      }))
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export reviews to Excel
router.post('/export', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { format = 'excel', filters = {} } = req.body;

    // Get all reviews for the user (with filters)
    const reviews = await reviewModel.searchReviews(user.id, '', filters);

    if (format === 'excel') {
      // For Excel export, we'll return the data in a format that can be easily converted
      const excelData = reviews.map(review => ({
        'Review ID': review.id,
        'Platform': review.platform,
        'Author': review.author_name,
        'Location': review.author_location || '',
        'Rating': review.rating,
        'Title': review.title || '',
        'Content': review.content || '',
        'Review Date': review.review_date,
        'Scraped Date': review.scraped_date,
        'Verified Purchase': review.verified_purchase ? 'Yes' : 'No',
        'Helpful Votes': review.helpful_votes || 0,
        'Source URL': review.source_url,
        'Sentiment': review.sentiment || 'Unknown',
        'Keywords': review.keywords ? review.keywords.join(', ') : ''
      }));

      res.json({
        data: excelData,
        total: reviews.length,
        message: 'Reviews ready for Excel export'
      });
    } else if (format === 'csv') {
      // For CSV export
      const headers = ['Review ID', 'Platform', 'Author', 'Location', 'Rating', 'Title', 'Content', 'Review Date', 'Scraped Date', 'Verified Purchase', 'Helpful Votes', 'Source URL', 'Sentiment', 'Keywords'];
      const csvData = reviews.map(review => [
        review.id,
        review.platform,
        review.author_name,
        review.author_location || '',
        review.rating,
        review.title || '',
        review.content || '',
        review.review_date,
        review.scraped_date,
        review.verified_purchase ? 'Yes' : 'No',
        review.helpful_votes || 0,
        review.source_url,
        review.sentiment || 'Unknown',
        review.keywords ? review.keywords.join(', ') : ''
      ]);

      res.json({
        headers,
        data: csvData,
        total: reviews.length,
        message: 'Reviews ready for CSV export'
      });
    } else {
      res.status(400).json({ error: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Export reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;