# Visual Preview of Review Scraper Wireframes

This document provides a visual overview of the detailed wireframe layouts for the Review Scraper application.

## Dashboard Overview

**Layout Structure:**
- Header with "Review Scraper" title and user/settings buttons
- Left sidebar navigation (Dashboard, Scrapers, Reviews, Analytics, Settings)
- Main content area with:
  - Page title "Dashboard Overview"
  - Quick stats cards showing key metrics (Total Reviews, Active Scrapers, Export Ready, Storage Used)
  - Recent activity table with Platform, Status, Reviews, Last Updated, Actions columns
  - Action buttons for Export All Data, Add New Scraper, View Analytics

**Key Features:**
- Efficient data-heavy interface design
- Color-coded status indicators for quick scanning
- Progressive disclosure of information
- Action-oriented layout with prominent CTAs
- Consistent navigation and visual hierarchy

## Scraper Management Interface

**Layout Structure:**
- Consistent header and sidebar navigation
- Main content area with:
  - Page title "Scraper Management"
  - Filter bar with platform dropdown, status filter, and search functionality
  - Bulk operation controls (Select All, Start All, Pause All, Delete All, Export Selected, Add New Scraper)
  - Data table displaying Platform, Name, Status, Reviews, Last Run, Actions
  - Pagination controls for large datasets

**Key Features:**
- Advanced filtering and search capabilities
- Bulk operations for managing multiple scrapers efficiently
- Status-based visual indicators with color coding
- Action-oriented design with prominent CTAs
- Minimalistic approach reducing cognitive load

## Review Data Viewer

**Layout Structure:**
- Consistent header and sidebar navigation with "Reviews" highlighted
- Main content area with:
  - Page title "Review Data Viewer"
  - Filter bar with platform dropdown, rating filter, and search functionality
  - Export options section with Excel, CSV, and Print Preview buttons
  - Review cards displaying platform icons, star ratings, reviewer names, dates, and review text
  - Pagination showing total review count and navigation controls

**Key Features:**
- Star rating display with visual indicators
- Platform-specific color coding (Google Maps red, Yelp red, TripAdvisor green)
- Review preview with helpful/response indicators
- Efficient filtering by platform, rating, and search terms
- Export capabilities for data analysis

---

## Excel Export Modal

**Layout Structure:**
- Modal overlay with semi-transparent background
- Modal window containing:
  - Header with "Export to Excel" title and close button
  - Platform selection section with checkboxes for multiple platforms
  - Date range inputs with "From" and "To" fields
  - Column selection with checkboxes for review text, rating, author, date, platform, helpful count
  - Action buttons for Cancel and Export Excel File

**Key Features:**
- Multi-platform selection for comprehensive exports
- Date range filtering for targeted data extraction
- Customizable column selection for flexible exports
- Clear primary action button for export functionality
- Modal design maintaining context of underlying interface

---

## Scraper Configuration Modal

**Layout Structure:**
- Modal overlay with semi-transparent background
- Modal window containing:
  - Header with "Configure New Scraper" title and close button
  - Platform dropdown selection
  - Business name input field
  - Review URL input field
  - Scheduling options (Daily, Weekly, Monthly radio buttons)
  - Advanced settings section with auto-export, email notifications, duplicate detection checkboxes
  - Action buttons for Cancel, Test Connection, and Save Configuration

**Key Features:**
- Step-by-step configuration process
- Platform-specific URL format guidance
- Flexible scheduling options for automated scraping
- Advanced settings for power users
- Test connection functionality for validation
- Primary save action prominently displayed

## 3. Review Data Viewer (`review-data-viewer.bmpr`)

### Layout Description
A sophisticated data viewing interface featuring:
- **Search Bar**: Global search with platform-specific filters
- **Advanced Filters Panel** (collapsible):
  - Date range selection
  - Rating filters (1-5 stars)
  - Sentiment analysis filters (Positive, Neutral, Negative)
  - Platform-specific filters
  - Keyword search within reviews
- **Data Table**: Review listings with columns for:
  - Reviewer Name
  - Platform
  - Rating (star display)
  - Review Text (truncated preview)
  - Date
  - Sentiment (with color-coded badges)
  - Actions (View Full, Export)
- **Table Controls**: Items per page, column visibility toggles
- **Export Options**: Excel, CSV, PDF buttons

### Key Components
- Collapsible filter panel to maximize screen real estate
- Star rating display system
- Sentiment analysis integration
- Responsive text truncation
- Quick action buttons

---

## 4. Excel Export Modal (`excel-export-modal.bmpr`)

### Layout Description
A modal dialog for configuring Excel export options:
- **Modal Header**: "Export to Excel" title with close button
- **Export Options Section**:
  - File name input field
  - Date range selection (From/To date pickers)
  - Platform selection (multi-select checklist)
  - Data fields selection (checkboxes for: Review Text, Rating, Date, Reviewer, Platform, Sentiment)
- **Advanced Options** (collapsible):
  - Include summary statistics
  - Separate sheets by platform
  - Include raw data vs. processed data
  - Custom formatting options
- **Action Buttons**: "Export" (primary), "Cancel" (secondary)
- **Progress Indicator**: Shows export progress when initiated

### Key Components
- Modal overlay with backdrop
- Form validation indicators
- Multi-select interfaces
- Collapsible advanced options
- Progress feedback

---

## 5. Scraper Configuration Modal (`scraper-configuration-modal.bmpr`)

### Layout Description
A comprehensive modal for configuring scraper settings:
- **Modal Header**: "Configure Scraper" with platform icon
- **Basic Configuration Tab**:
  - Scraper Name input
  - Platform selection dropdown
  - Target URL input
  - Scraping frequency options
- **Advanced Settings Tab**:
  - AI-powered features toggles
  - Data extraction rules
  - Rate limiting settings
  - Proxy configuration
  - Custom headers and user agents
- **Testing Tab**:
  - Test URL input
  - "Test Connection" button
  - Test results display area
- **Action Buttons**: "Save Configuration", "Test Scraper", "Cancel"
- **Validation Messages**: Inline error/success notifications

### Key Components
- Tabbed interface for organized settings
- Real-time validation feedback
- Platform-specific configuration options
- Testing integration
- AI feature toggles

---

## Design System Components

All wireframes follow a consistent design system:

### Color Palette
- **Background**: #F5F5F5 (light gray)
- **Headers**: #E0E0E0 (medium gray)
- **Text**: #333333 (dark gray)
- **Interactive Elements**: Standard Balsamiq blue (#0066CC)
- **Success**: #28A745 (green)
- **Warning**: #FFC107 (yellow)
- **Error**: #DC3545 (red)

### Typography
- **Headers**: Bold, 16-18px
- **Body Text**: Regular, 14px
- **Small Text**: 12px for metadata
- **Button Text**: Medium weight, 14px

### Spacing
- **Component Spacing**: 16px between major sections
- **Element Spacing**: 8px between related elements
- **Padding**: 12px inside containers
- **Margins**: 20px page margins

### Interactive Elements
- **Buttons**: Rounded corners, hover states
- **Forms**: Clear labels, proper spacing
- **Tables**: Alternating row colors, hover effects
- **Modals**: Proper z-index, backdrop overlay

## Implementation Notes

These wireframes are designed to be implemented using:
- **React + TypeScript** for component structure
- **Tailwind CSS** for responsive styling
- **Modern UI libraries** (Material-UI, Ant Design, or Chakra UI)
- **Responsive design** patterns as shown in layouts
- **Accessibility** considerations built into component placement

## Customization Guidelines

When customizing these wireframes:

1. **Maintain Consistency**: Keep the established spacing and color patterns
2. **Platform Adaptation**: Adjust platform-specific elements as needed
3. **Responsive Considerations**: Design for mobile, tablet, and desktop views
4. **User Feedback**: Include loading states, error messages, and success notifications
5. **Accessibility**: Ensure proper contrast ratios and keyboard navigation

## Import Instructions

To use these wireframes in Balsamiq Mockups 3:

1. Download and install Balsamiq Mockups 3
2. Open the application
3. Go to **File > Import > Import from BMML/BMPR File**
4. Select the desired `.bmpr` file from this directory
5. The wireframe will be imported and ready for editing
6. Customize colors, text, and layout as needed
7. Export as images or share project files with your team

---

*These wireframes were created following modern UX best practices and can serve as a foundation for your Review Scraper application's user interface design.*