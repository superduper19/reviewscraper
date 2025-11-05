# Review Scraper Wireframes

This folder contains detailed Balsamiq wireframe files for the Review Scraper application. These wireframes are specifically designed for data-heavy interfaces with a focus on efficiency, minimalism, and purposeful design for scraping and data gathering workflows.

## Wireframe Files

### Detailed BMML Files (Balsamiq Mockups 3 Compatible)
These wireframes follow modern UX principles and include proper text, purposeful layouts, and detailed functionality:

1. **`dashboard-overview.bmml`** - Main dashboard with quick stats cards, recent activity table, and key metrics
2. **`scraper-management.bmml`** - Comprehensive scraper management with filtering, bulk operations, and data tables
3. **`review-data-viewer.bmml`** - Review data viewer with star ratings, platform icons, and export capabilities
4. **`excel-export-modal.bmml`** - Excel export modal with platform selection, date ranges, and column customization
5. **`scraper-configuration-modal.bmml`** - Scraper configuration modal with platform selection, scheduling, and advanced settings

### Legacy Files (JSON Format)
These files are kept for reference but may have compatibility issues with Balsamiq 3:

- `dashboard-overview.bmpr` - Legacy dashboard overview
- `scraper-management.bmpr` - Legacy scraper management
- `review-data-viewer.bmpr` - Legacy review data viewer
- `excel-export-modal.bmpr` - Legacy Excel export modal
- `scraper-configuration-modal.bmpr` - Legacy scraper configuration modal

## Installation Instructions

### For Balsamiq Mockups 3 (Recommended)
1. Open Balsamiq Mockups 3
2. Go to **File > Import > Import BMML Files**
3. Select the `.bmml` files from this folder
4. Click "Open" to import

**Note:** The `.bmml` files are specifically designed for Balsamiq Mockups 3 and contain proper XML formatting.

### For Balsamiq Cloud
1. Log in to your Balsamiq Cloud account
2. Create a new project or open existing one
3. Click **Import** button
4. Select the `.bmml` files from this folder
5. Click "Import" to add to your project

### Troubleshooting
If you encounter issues importing `.bmml` files:
- Ensure you have Balsamiq Mockups 3 or later
- Try importing one file at a time
- Check that the file extension is `.bmml` (not `.bmpr`)
- For older versions, try the legacy `.bmpr` files (may have compatibility issues)

## Design Specifications

### Core Design Principles
- **Efficiency**: Optimized for data-heavy interfaces with minimal cognitive load
- **Minimalism**: Clean, uncluttered layouts that focus on essential functionality
- **Consistency**: Uniform navigation, spacing, and visual hierarchy across all screens
- **Purposeful**: Every element serves the specific goal of scraping and data gathering

### Color Palette
- **Primary Actions**: Blue (#2563EB) - Export buttons, primary CTAs
- **Secondary Elements**: Gray (#6B7280) - Secondary buttons, disabled states
- **Success States**: Green (#10B981) - Active scrapers, successful operations
- **Warning States**: Yellow (#F59E0B) - Pending operations, warnings
- **Error States**: Red (#EF4444) - Failed scrapers, errors

### Typography & Spacing
- **Font Sizes**: Consistent text sizing for headers, body text, and labels
- **Line Heights**: Optimized for readability in data tables
- **Spacing**: Systematic spacing between elements for visual clarity
- **Alignment**: Left-aligned text for data tables, centered for actions

## Wireframe Details

### Dashboard Overview (`dashboard-overview.bmml`)
- **Purpose**: Main landing page showing system status and recent activity
- **Key Elements**: Quick stats cards, recent activity table, action buttons
- **Functionality**: Displays total reviews, active scrapers, export status, storage usage
- **Design Focus**: At-a-glance metrics with immediate access to common actions

### Scraper Management (`scraper-management.bmml`)
- **Purpose**: Comprehensive management of all scraper configurations
- **Key Elements**: Filter bar, bulk operations, data table, pagination
- **Functionality**: Filter by platform/status, bulk operations, detailed scraper controls
- **Design Focus**: Efficient management of multiple scrapers with advanced filtering

### Review Data Viewer (`review-data-viewer.bmml`)
- **Purpose**: Browse and analyze collected review data
- **Key Elements**: Platform filters, rating filters, review cards, export options
- **Functionality**: Filter reviews by platform/rating, view detailed review content, export data
- **Design Focus**: Easy review browsing with visual indicators and export capabilities

### Excel Export Modal (`excel-export-modal.bmml`)
- **Purpose**: Configure and export review data to Excel format
- **Key Elements**: Platform selection, date range inputs, column selection
- **Functionality**: Multi-platform exports, date filtering, customizable columns
- **Design Focus**: Flexible export configuration with clear action hierarchy

### Scraper Configuration Modal (`scraper-configuration-modal.bmml`)
- **Purpose**: Create and configure new scraper instances
- **Key Elements**: Platform dropdown, business name/URL inputs, scheduling options
- **Functionality**: Platform-specific configuration, automated scheduling, advanced settings
- **Design Focus**: Step-by-step configuration with validation and testing

## Implementation Notes

### Technology Stack Compatibility
- **Frontend Framework**: React + TypeScript (recommended)
- **Styling**: Tailwind CSS for consistent design system
- **State Management**: Zustand for global state
- **Data Visualization**: Recharts for analytics components
- **UI Components**: Custom components based on wireframe specifications

### Responsive Design Considerations
- **Desktop First**: Wireframes optimized for desktop viewing
- **Mobile Adaptation**: Consider mobile-first approach for data tables
- **Touch Targets**: Ensure adequate sizing for mobile interactions
- **Data Density**: Balance information density with readability

### Accessibility Guidelines
- **Color Contrast**: Ensure WCAG 2.1 AA compliance
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order

## Customization Guidelines

### Brand Adaptation
- Replace "Review Scraper" with your application name
- Adjust color palette to match brand guidelines
- Modify platform icons to match your supported review sites
- Customize terminology based on your industry

### Feature Extensions
- Add new platforms to scraper configuration
- Include additional export formats beyond Excel
- Implement advanced analytics dashboards
- Add user management and permissions

### Data Visualization
- Enhance charts and graphs for analytics
- Add real-time data updates
- Implement custom filtering and sorting
- Create custom dashboard widgets

## Additional Resources

### Related Documentation
- `VISUAL_PREVIEW.md` - Detailed visual overview of each wireframe
- `QUICK_START.md` - Quick reference guide for getting started
- `review-scraper-wireframes-specification.md` - Original specification document

### Design System Components
- Consistent navigation patterns across all screens
- Standardized button styles and interactions
- Unified form controls and input fields
- Common modal patterns and behaviors

### Export Options
- **Balsamiq Mockups 3**: Import `.bmml` files directly
- **Balsamiq Cloud**: Use import functionality for `.bmml` files
- **PDF Export**: Use Balsamiq's built-in PDF export for documentation
- **PNG Export**: Export individual screens for presentations

---

**Note**: These wireframes are designed specifically for review scraping applications with a focus on data efficiency, minimalism, and purposeful design. Each element serves the core functionality of scraping, managing, and analyzing review data.
- Canvas background and layout
- UI components (buttons, tables, forms, etc.)
- Proper component naming and hierarchy
- Responsive design considerations
- Interactive elements as specified

## Design Specifications

The wireframes follow the specifications outlined in `.trae/documents/review-scraper-wireframes-specification.md` and use the component library defined in `.trae/documents/balsamiq-wireframes-library.bmpr`.

### Key Features

- **Dashboard Overview**: Statistics cards, scraper table, recent activity feed
- **Scraper Management**: Filter controls, action buttons, pagination
- **Review Data Viewer**: Advanced filtering, search, sentiment analysis
- **Excel Export Modal**: Export options, date range selection, file naming
- **Scraper Configuration Modal**: Form inputs, platform selection, AI features

### Color Palette

- Background: #F5F5F5 (light gray)
- Headers: #E0E0E0 (medium gray)
- Text: #333333 (dark gray)
- Interactive elements: Standard Balsamiq blue

## Integration Notes

These wireframes are designed to be implemented using:
- React + TypeScript
- Tailwind CSS for styling
- Modern UI components following the wireframe structure
- Responsive design patterns as shown in the layouts

## Customization

Feel free to modify these wireframes to match your specific requirements. The component structure allows for easy adjustments to:
- Layout dimensions
- Component positioning
- Text content and labels
- Additional UI elements

## Export Options

Once imported into Balsamiq, you can:

- **Export as Images**: PNG, PDF, or SVG formats for sharing
- **Generate Interactive Prototypes**: Create clickable mockups
- **Collaborate**: Add comments and annotations for team review
- **Version Control**: Track changes and iterations
- **Handoff to Developers**: Provide specifications and measurements

## 📋 Installation Instructions

### For Balsamiq Mockups 3 (Desktop)

1. **Download Balsamiq Mockups 3** from [balsamiq.com](https://balsamiq.com/wireframes/desktop/)
2. **Install the application** on your system (Windows/Mac/Linux)
3. **Launch Balsamiq** and create a new project
4. **Import wireframes**:
   - Go to **File > Import > Import BMML Files**
   - Browse to the wireframes folder and select all `.bmml` files
   - Each wireframe will become a separate mockup in your project

### Alternative Method for Balsamiq 3
1. Create a new project in Balsamiq Mockups 3
2. Use **File > Import > Import BMML Files**
3. Browse to the wireframes folder and select the `.bmml` files
4. Each wireframe will become a separate mockup in your project

### For Balsamiq Cloud (Web)

1. **Sign up** at [balsamiq.cloud](https://balsamiq.cloud)
2. **Create a new project** or space
3. **Upload files**:
   - Drag and drop `.bmpr` files into your project
   - Or use the import feature in the interface

## 🎨 Design System

### Color Palette
- **Background**: #F5F5F5 (light gray)
- **Headers**: #E0E0E0 (medium gray)
- **Text**: #333333 (dark gray)
- **Interactive Elements**: Standard Balsamiq blue
- **Success States**: Green indicators
- **Warning States**: Yellow indicators
- **Error States**: Red indicators

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

## 🔧 Customization Guidelines

When customizing these wireframes:

1. **Maintain Consistency**: Keep the established spacing and color patterns
2. **Platform Adaptation**: Adjust platform-specific elements as needed
3. **Responsive Considerations**: Design for mobile, tablet, and desktop views
4. **User Feedback**: Include loading states, error messages, and success notifications
5. **Accessibility**: Ensure proper contrast ratios and keyboard navigation

### Safe Modifications
- Text content and labels
- Layout dimensions and positioning
- Color schemes (while maintaining accessibility)
- Additional UI elements and components

## 🛠️ Implementation Notes

These wireframes are designed to be implemented using:
- **React + TypeScript** for component structure
- **Tailwind CSS** for responsive styling
- **Modern UI libraries** (Material-UI, Ant Design, or Chakra UI)
- **Responsive design** patterns as shown in layouts
- **Accessibility** considerations built into component placement

## 📚 Additional Resources

- **Specification Document**: `.trae/documents/review-scraper-wireframes-specification.md`
- **Component Library**: `.trae/documents/balsamiq-wireframes-library.bmpr`
- **Visual Preview**: `VISUAL_PREVIEW.md` (detailed layout descriptions)

## Troubleshooting

### "This Project File Cannot be Opened" Error
If you get this error, make sure you're using the correct import method:
- **For .bmml files**: Use File → Import → Import BMML Files
- **Do not double-click** the .bmml files directly
- Make sure you're using Balsamiq Mockups 3 or later

### Import Issues
- Ensure Balsamiq Mockups 3 is properly installed
- Try importing one file at a time if batch import fails
- Check that the .bmml files are not corrupted by opening them in a text editor

## Additional Resources

- [Balsamiq Documentation](https://docs.balsamiq.com/)
- [Wireframing Best Practices](https://balsamiq.com/learn/articles/)
- [Importing BMML Files](https://docs.balsamiq.com/desktop/importing/)

## 🤝 Contributing

To suggest improvements or report issues:

1. Review the existing wireframes and documentation
2. Check the specification documents for requirements
3. Create detailed descriptions of proposed changes
4. Consider accessibility and responsive design implications

---

*These wireframes follow modern UX best practices and serve as a comprehensive foundation for the Review Scraper application's user interface design.*