// Export both SQLite and PostgreSQL models
export * from './sqlite-models';
export * from './postgres-models';

// Environment-based model selection
export function getDatabaseType(): 'sqlite' | 'postgresql' {
  return (process.env.DATABASE_TYPE as 'sqlite' | 'postgresql') || 'sqlite';
}

export function getModels() {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    const { PostgreSQLUserModel, PostgreSQLScraperModel, PostgreSQLReviewModel, PostgreSQLScrapingJobModel } = require('./postgres-models');
    return {
      UserModel: PostgreSQLUserModel,
      ScraperModel: PostgreSQLScraperModel,
      ReviewModel: PostgreSQLReviewModel,
      ScrapingJobModel: PostgreSQLScrapingJobModel,
      initializeDatabase: require('./postgres-models').initializePostgreSQLDatabase,
      closeDatabase: require('./postgres-models').closePostgreSQL
    };
  } else {
    const { UserModel, ScraperModel, ReviewModel, ScrapingJobModel, initializeDatabase, closeDatabase } = require('./sqlite-models');
    return {
      UserModel,
      ScraperModel,
      ReviewModel,
      ScrapingJobModel,
      initializeDatabase,
      closeDatabase
    };
  }
}