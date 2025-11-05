import puppeteer from 'puppeteer';
import { ScraperModel, ReviewModel } from '../models';
import { S3Service } from './s3-service';
import { Scraper, Review } from '../models/postgres-models';

export interface ScrapingResult {
  success: boolean;
  reviews: any[];
  error?: string;
}

export interface PlatformScraper {
  scrape(url: string, settings: any): Promise<ScrapingResult>;
}

export interface ScrapingResult {
  success: boolean;
  reviews: Review[];
  error?: string;
  stats: {
    totalReviews: number;
    newReviews: number;
    updatedReviews: number;
  };
}

export interface PlatformScraper {
  scrape(url: string, selectors: any, settings: any): Promise<Review[]>;
}

export class AmazonScraper implements PlatformScraper {
  async scrape(url: string, selectors: any, settings: any): Promise<Review[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setUserAgent(settings.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const reviews: Review[] = [];
      let currentPage = 1;
      const maxPages = settings.maxPages || 10;
      
      while (currentPage <= maxPages) {
        const pageUrl = currentPage === 1 ? url : `${url}&pageNumber=${currentPage}`;
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
        
        // Wait for reviews to load
        await page.waitForSelector(selectors.reviewContainer || '[data-hook="review"]');
        
        const pageReviews = await page.evaluate((selectors) => {
          const reviewElements = document.querySelectorAll(selectors.reviewContainer || '[data-hook="review"]');
          
          return Array.from(reviewElements).map(element => {
            const getText = (selector: string) => {
              const el = element.querySelector(selector);
              return el ? el.textContent?.trim() : '';
            };
            
            const getAttribute = (selector: string, attr: string) => {
              const el = element.querySelector(selector);
              return el ? el.getAttribute(attr) : '';
            };
            
            const ratingText = getText(selectors.rating || '[data-hook="review-star-rating"] .a-icon-alt') || '';
            const rating = parseFloat(ratingText.match(/(\d+\.?\d*)/)?.[1] || '0');
            
            return {
              author_name: getText(selectors.author || '[data-hook="review-author"] .a-profile-name') || 'Anonymous',
              author_location: getText(selectors.location || '[data-hook="review-author"] .a-size-base') || '',
              rating: rating,
              title: getText(selectors.title || '[data-hook="review-title"]') || '',
              content: getText(selectors.content || '[data-hook="review-body"]') || '',
              review_date: getText(selectors.date || '[data-hook="review-date"]') || '',
              verified_purchase: getText(selectors.verified || '[data-hook="avp-badge"]') !== '',
              helpful_votes: parseInt(getText(selectors.helpful || '[data-hook="helpful-vote-statement"]')?.match(/\d+/)?.[0] || '0'),
              source_url: window.location.href,
              platform: 'amazon'
            };
          });
        }, selectors);
        
        reviews.push(...pageReviews);
        
        // Check if there's a next page
        const nextButton = await page.$(selectors.nextPage || '[data-hook="pagination-bar"] .a-last a');
        if (!nextButton || currentPage >= maxPages) {
          break;
        }
        
        currentPage++;
        
        // Add delay between requests
        if (settings.delay) {
          await new Promise(resolve => setTimeout(resolve, settings.delay));
        }
      }
      
      return reviews;
    } finally {
      await browser.close();
    }
  }
}

export class GoogleScraper implements PlatformScraper {
  async scrape(url: string, selectors: any, settings: any): Promise<Review[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setUserAgent(settings.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const reviews: Review[] = [];
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      // Wait for reviews to load
      await page.waitForSelector(selectors.reviewContainer || '.gws-localreviews__review');
      
      const pageReviews = await page.evaluate((selectors) => {
        const reviewElements = document.querySelectorAll(selectors.reviewContainer || '.gws-localreviews__review');
        
        return Array.from(reviewElements).map(element => {
          const getText = (selector: string) => {
            const el = element.querySelector(selector);
            return el ? el.textContent?.trim() : '';
          };
          
          const ratingText = getText(selectors.rating || '.gws-localreviews__star-rating span') || '';
          const rating = parseFloat(ratingText.match(/(\d+\.?\d*)/)?.[1] || '0');
          
          return {
            author_name: getText(selectors.author || '.gws-localreviews__author-name') || 'Anonymous',
            author_location: getText(selectors.location || '.gws-localreviews__author-location') || '',
            rating: rating,
            title: getText(selectors.title || '.gws-localreviews__title') || '',
            content: getText(selectors.content || '.gws-localreviews__review-text') || '',
            review_date: getText(selectors.date || '.gws-localreviews__review-date') || '',
            verified_purchase: false, // Google doesn't have this
            helpful_votes: 0, // Google doesn't show this
            source_url: window.location.href,
            platform: 'google'
          };
        });
      }, selectors);
      
      reviews.push(...pageReviews);
      
      return reviews;
    } finally {
      await browser.close();
    }
  }
}

export class YelpScraper implements PlatformScraper {
  async scrape(url: string, selectors: any, settings: any): Promise<Review[]> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      await page.setUserAgent(settings.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const reviews: Review[] = [];
      let currentPage = 1;
      const maxPages = settings.maxPages || 10;
      
      while (currentPage <= maxPages) {
        const pageUrl = currentPage === 1 ? url : `${url}?start=${(currentPage - 1) * 20}`;
        await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
        
        // Wait for reviews to load
        await page.waitForSelector(selectors.reviewContainer || '.review__09f24__oHr9C');
        
        const pageReviews = await page.evaluate((selectors) => {
          const reviewElements = document.querySelectorAll(selectors.reviewContainer || '.review__09f24__oHr9C');
          
          return Array.from(reviewElements).map(element => {
            const getText = (selector: string) => {
              const el = element.querySelector(selector);
              return el ? el.textContent?.trim() : '';
            };
            
            const getAttribute = (selector: string, attr: string) => {
              const el = element.querySelector(selector);
              return el ? el.getAttribute(attr) : '';
            };
            
            const ratingDiv = element.querySelector(selectors.rating || '.i-stars__09f24__1T0Uu') || 
                             element.querySelector('[role="img"]');
            const ratingText = ratingDiv?.getAttribute('aria-label') || ratingDiv?.getAttribute('title') || '';
            const rating = parseFloat(ratingText.match(/(\d+\.?\d*)/)?.[1] || '0');
            
            return {
              author_name: getText(selectors.author || '.user-passport-info__09f24__yST7t a') || 'Anonymous',
              author_location: getText(selectors.location || '.user-passport-info__09f24__yST7t .text__09f24__f8Jnf') || '',
              rating: rating,
              title: getText(selectors.title || '.raw__09f24__T4Ezm') || '',
              content: getText(selectors.content || '.raw__09f24__T4Ezm') || '',
              review_date: getText(selectors.date || '.margin-t1__09f24__w96jn .text__09f24__f8Jnf') || '',
              verified_purchase: false, // Yelp doesn't have this
              helpful_votes: parseInt(getText(selectors.helpful || '.useful__09f24__oH5wP')?.match(/\d+/)?.[0] || '0'),
              source_url: window.location.href,
              platform: 'yelp'
            };
          });
        }, selectors);
        
        reviews.push(...pageReviews);
        
        // Check if there's a next page
        const nextButton = await page.$(selectors.nextPage || '.next-link');
        if (!nextButton || currentPage >= maxPages) {
          break;
        }
        
        currentPage++;
        
        // Add delay between requests
        if (settings.delay) {
          await new Promise(resolve => setTimeout(resolve, settings.delay));
        }
      }
      
      return reviews;
    } finally {
      await browser.close();
    }
  }
}

export class ScraperService {
  private scraperModel: ScraperModel;
  private reviewModel: ReviewModel;
  private s3Service: S3Service;
  private scrapers: { [key: string]: PlatformScraper };

  constructor() {
    this.scraperModel = new ScraperModel();
    this.reviewModel = new ReviewModel();
    this.s3Service = new S3Service();
    this.scrapers = {
      amazon: new AmazonScraper(),
      google: new GoogleScraper(),
      yelp: new YelpScraper()
    };
  }

  async scrapeReviews(scraperId: number): Promise<ScrapingResult> {
    try {
      const scraper = await this.scraperModel.findById(scraperId);
      if (!scraper) {
        throw new Error('Scraper not found');
      }

      const platformScraper = this.scrapers[scraper.platform];
      if (!platformScraper) {
        throw new Error(`Unsupported platform: ${scraper.platform}`);
      }

      // Update scraper status to active
      await this.scraperModel.updateStatus(scraperId, 'active');

      try {
        // Scrape reviews
        const scrapedReviews = await platformScraper.scrape(
          scraper.target_url,
          scraper.selectors,
          scraper.settings
        );

        // Process and save reviews
        let newReviews = 0;
        let updatedReviews = 0;
        const savedReviews: Review[] = [];

        for (const review of scrapedReviews) {
          // Check if review already exists
          const existingReview = await this.reviewModel.findBySource(
            review.source_url,
            review.author_name,
            review.review_date
          );

          if (existingReview) {
            // Update existing review
            await this.reviewModel.update(existingReview.id, {
              ...review,
              scraper_id: scraperId
            });
            updatedReviews++;
          } else {
            // Create new review
            const newReview = await this.reviewModel.create({
              ...review,
              scraper_id: scraperId,
              user_id: scraper.user_id
            });
            savedReviews.push(newReview);
            newReviews++;
          }
        }

        // Update scraper stats
        await this.scraperModel.updateStats(scraperId, {
          last_run: new Date(),
          total_reviews: scraper.total_reviews + newReviews,
          status: 'completed'
        });

        // Backup scraped data to S3
        try {
          await this.backupScrapedData(scraperId, savedReviews);
        } catch (backupError) {
          console.error('Backup failed, but scraping completed successfully:', backupError);
        }

        return {
          success: true,
          reviews: savedReviews,
          stats: {
            totalReviews: scrapedReviews.length,
            newReviews,
            updatedReviews
          }
        };
      } catch (error) {
        // Update scraper status to error
        await this.scraperModel.updateStatus(scraperId, 'error');
        throw error;
      }
    } catch (error) {
      return {
        success: false,
        reviews: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        stats: {
          totalReviews: 0,
          newReviews: 0,
          updatedReviews: 0
        }
      };
    }
  }

  async stopScraping(scraperId: number): Promise<void> {
    await this.scraperModel.updateStatus(scraperId, 'paused');
  }

  async backupScrapedData(scraperId: number, reviews: Review[]): Promise<void> {
    try {
      const scraper = await this.scraperModel.findById(scraperId);
      if (!scraper) return;

      const backupData = {
        scraperId,
        platform: scraper.platform,
        targetUrl: scraper.target_url,
        backupDate: new Date().toISOString(),
        reviews: reviews.map(review => ({
          id: review.id,
          author_name: review.author_name,
          author_location: review.author_location,
          rating: review.rating,
          title: review.title,
          content: review.content,
          review_date: review.review_date,
          source_url: review.source_url,
          platform: review.platform,
          sentiment: review.sentiment,
          keywords: review.keywords,
          helpful_votes: review.helpful_votes,
          verified_purchase: review.verified_purchase
        }))
      };

      const buffer = Buffer.from(JSON.stringify(backupData, null, 2), 'utf8');
      const fileName = `backups/scraper-${scraperId}-${Date.now()}.json`;
      
      await this.s3Service.uploadScraperBackup(scraperId, buffer, fileName);
      console.log(`Scraper data backed up to S3: ${fileName}`);
    } catch (error) {
      console.error('Failed to backup scraped data:', error);
      // Don't throw error - backup is not critical for scraping
    }
  }
}