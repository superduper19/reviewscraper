import express from 'express';
import { ReviewModel, ScraperModel, UserModel } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const reviewModel = new ReviewModel();
const scraperModel = new ScraperModel();
const userModel = new UserModel();

// Get dashboard statistics
router.get('/stats', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get review statistics
    const reviewStats = await reviewModel.getStatsByUserId(user.id);
    const platformStats = await reviewModel.getStatsByPlatform(user.id);

    // Get scraper statistics
    const scrapers = await scraperModel.findByUserId(user.id);
    const activeScrapers = scrapers.filter(s => s.status === 'active').length;
    const pausedScrapers = scrapers.filter(s => s.status === 'paused').length;
    const errorScrapers = scrapers.filter(s => s.status === 'error').length;

    // Calculate success rate across all scrapers
    const totalSuccessRate = scrapers.length > 0 
      ? scrapers.reduce((sum, s) => sum + s.success_rate, 0) / scrapers.length 
      : 0;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await reviewModel.query(`
      SELECT 
        DATE_TRUNC('day', r.created_at) as date,
        COUNT(*) as review_count
      FROM reviews r
      JOIN scrapers s ON r.scraper_id = s.id
      WHERE s.user_id = $1 AND r.created_at >= $2
      GROUP BY DATE_TRUNC('day', r.created_at)
      ORDER BY date DESC
      LIMIT 30
    `, [user.id, thirtyDaysAgo]);

    // Get top platforms by review count
    const topPlatforms = await reviewModel.query(`
      SELECT 
        r.platform,
        COUNT(*) as review_count,
        AVG(r.rating) as avg_rating
      FROM reviews r
      JOIN scrapers s ON r.scraper_id = s.id
      WHERE s.user_id = $1
      GROUP BY r.platform
      ORDER BY review_count DESC
      LIMIT 5
    `, [user.id]);

    // Get recent reviews for activity feed
    const recentReviews = await reviewModel.query(`
      SELECT 
        r.id,
        r.platform,
        r.author_name,
        r.rating,
        r.title,
        r.content,
        r.review_date,
        r.created_at,
        s.name as scraper_name
      FROM reviews r
      JOIN scrapers s ON r.scraper_id = s.id
      WHERE s.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [user.id]);

    res.json({
      overview: {
        totalReviews: parseInt(reviewStats.total_reviews) || 0,
        totalScrapers: scrapers.length,
        activeScrapers,
        averageRating: parseFloat(reviewStats.average_rating) || 0,
        totalSuccessRate: Math.round(totalSuccessRate * 100) / 100
      },
      scrapers: {
        total: scrapers.length,
        active: activeScrapers,
        paused: pausedScrapers,
        error: errorScrapers,
        completed: scrapers.filter(s => s.status === 'completed').length
      },
      reviews: {
        total: parseInt(reviewStats.total_reviews) || 0,
        positive: parseInt(reviewStats.positive_reviews) || 0,
        negative: parseInt(reviewStats.negative_reviews) || 0,
        neutral: parseInt(reviewStats.neutral_reviews) || 0,
        platforms: parseInt(reviewStats.platforms_count) || 0,
        uniqueReviewers: parseInt(reviewStats.unique_reviewers) || 0
      },
      activity: recentActivity.rows.map(row => ({
        date: row.date,
        reviewCount: parseInt(row.review_count)
      })),
      topPlatforms: topPlatforms.rows.map(row => ({
        platform: row.platform,
        reviewCount: parseInt(row.review_count),
        averageRating: parseFloat(row.avg_rating) || 0
      })),
      recentReviews: recentReviews.rows.map(review => ({
        id: review.id,
        platform: review.platform,
        authorName: review.author_name,
        rating: review.rating,
        title: review.title,
        content: review.content,
        reviewDate: review.review_date,
        scrapedDate: review.created_at,
        scraperName: review.scraper_name
      }))
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get system health status
router.get('/health', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check database connection
    let databaseStatus = 'healthy';
    try {
      await userModel.query('SELECT 1');
    } catch (error) {
      databaseStatus = 'unhealthy';
    }

    // Get scraper health
    const scrapers = await scraperModel.findByUserId(user.id);
    const healthyScrapers = scrapers.filter(s => s.status === 'active').length;
    const unhealthyScrapers = scrapers.filter(s => s.status === 'error').length;

    // Calculate system metrics
    const totalReviews = await reviewModel.query(`
      SELECT COUNT(*) as total
      FROM reviews r
      JOIN scrapers s ON r.scraper_id = s.id
      WHERE s.user_id = $1
    `, [user.id]);

    const recentErrors = await scraperModel.query(`
      SELECT COUNT(*) as error_count
      FROM scrapers
      WHERE user_id = $1 AND status = 'error'
    `, [user.id]);

    res.json({
      status: databaseStatus === 'healthy' && unhealthyScrapers === 0 ? 'healthy' : 'degraded',
      components: {
        database: databaseStatus,
        scrapers: {
          healthy: healthyScrapers,
          unhealthy: unhealthyScrapers,
          total: scrapers.length
        }
      },
      metrics: {
        totalReviews: parseInt(totalReviews.rows[0].total) || 0,
        recentErrors: parseInt(recentErrors.rows[0].error_count) || 0,
        uptime: '99.9%' // This would typically be calculated
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get health status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quick stats for dashboard cards
router.get('/quick-stats', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayReviews = await reviewModel.query(`
      SELECT COUNT(*) as count, AVG(rating) as avg_rating
      FROM reviews r
      JOIN scrapers s ON r.scraper_id = s.id
      WHERE s.user_id = $1 AND r.created_at >= $2
    `, [user.id, today]);

    // Get this week's stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekReviews = await reviewModel.query(`
      SELECT COUNT(*) as count, AVG(rating) as avg_rating
      FROM reviews r
      JOIN scrapers s ON r.scraper_id = s.id
      WHERE s.user_id = $1 AND r.created_at >= $2
    `, [user.id, weekAgo]);

    // Get this month's stats
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const monthReviews = await reviewModel.query(`
      SELECT COUNT(*) as count, AVG(rating) as avg_rating
      FROM reviews r
      JOIN scrapers s ON r.scraper_id = s.id
      WHERE s.user_id = $1 AND r.created_at >= $2
    `, [user.id, monthAgo]);

    // Get scraper counts
    const scrapers = await scraperModel.findByUserId(user.id);
    const activeScrapers = scrapers.filter(s => s.status === 'active').length;

    res.json({
      today: {
        reviews: parseInt(todayReviews.rows[0].count) || 0,
        averageRating: parseFloat(todayReviews.rows[0].avg_rating) || 0
      },
      thisWeek: {
        reviews: parseInt(weekReviews.rows[0].count) || 0,
        averageRating: parseFloat(weekReviews.rows[0].avg_rating) || 0
      },
      thisMonth: {
        reviews: parseInt(monthReviews.rows[0].count) || 0,
        averageRating: parseFloat(monthReviews.rows[0].avg_rating) || 0
      },
      activeScrapers
    });
  } catch (error) {
    console.error('Get quick stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;