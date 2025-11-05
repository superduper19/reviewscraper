# Wireframes Change Log

## Version 1.0.0 - December 2024

### Changes Made
- **Fixed Balsamiq compatibility issue**: Converted from JSON format (.bmpr) to proper Balsamiq XML format (.bmml)
- **Created 5 wireframe files** with proper Balsamiq Mockup Language (BMML) structure:
  - `dashboard-overview.bmml` - Main dashboard with statistics and activity feed
  - `scraper-management.bmml` - Interface for managing scraper configurations  
  - `review-data-viewer.bmml` - Table view for browsing scraped reviews
  - `excel-export-modal.bmml` - Modal dialog for configuring Excel exports
  - `scraper-configuration-modal.bmml` - Modal for setting up new scrapers

### Technical Details
- All wireframes now use proper Balsamiq XML schema
- Components include correct positioning, sizing, and text encoding
- Files are importable via Balsamiq Mockups 3 File → Import → Import BMML Files
- Updated documentation to reflect proper import procedures

### Files Removed
- Deleted problematic JSON-based .bmpr files that were causing "This Project File Cannot be Opened" error

### Documentation Updates
- Updated README.md with correct file format information (.bmml instead of .bmpr)
- Added troubleshooting section for common import