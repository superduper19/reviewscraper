# BMML Import Troubleshooting Guide

## Issue: BMML Files Appear Blank After Import

### Problem Description
When importing `.bmml` files into Balsamiq Mockups 3, the import process appears successful but the project remains blank or empty.

### Root Cause
BMML files were replaced by BMPR files in Balsamiq Mockups 3. While import functionality exists, there are known compatibility issues that can cause files to appear empty.

### Solutions

#### Solution 1: Try the Corrected BMML Files
I've created corrected versions of your BMML files with proper XML structure:
- `dashboard-overview-corrected.bmml` - Enhanced with proper attributes
- `test-simple.bmml` - Minimal test file

Try importing these corrected files first.

#### Solution 2: Rename BMML to BMPR
Some users have reported success by simply renaming the file extension:
1. Copy your `.bmml` file
2. Rename the copy to `.bmpr`
3. Try opening the renamed file

#### Solution 3: Use Balsamiq Cloud Import
If desktop import fails, try:
1. Upload your BMML file to Balsamiq Cloud
2. Import through the web interface
3. Export as BMPR if successful

#### Solution 4: Manual XML Conversion
The corrected files include:
- Proper XML declaration
- Complete mockup structure
- Required control attributes (measuredW, measuredH, zOrder)
- Proper control type IDs

### Testing Steps
1. Start with `test-simple.bmml` to verify basic import works
2. Try `dashboard-overview-corrected.bmml` for the full dashboard
3. If both fail, try renaming to `.bmpr`
4. Consider using Balsamiq Cloud as alternative

### Alternative Approach
If BMML import continues to fail, consider:
1. Manually recreating wireframes in Balsamiq Mockups 3
2. Using the wireframe specifications in the documentation as reference
3. Creating new BMPR files from scratch

### File Structure
```
organized/
├── dashboard-overview.bmml (original)
├── dashboard-overview-corrected.bmml (fixed version)
├── test-simple.bmml (minimal test)
└── [other original files]
```

Try the corrected files