# Balsamiq Wireframe Import Guide

## 🎯 Quick Start - Use These Files

**IMPORTANT**: Use the **CORRECTED** files (ending in `-corrected.bmml`) for Balsamiq 3. The original `.bmml` files have XML formatting issues that cause blank projects.

### Files to Import:
1. `dashboard-overview-corrected.bmml` ✅ **RECOMMENDED**
2. `scraper-management-corrected.bmml` ✅ **RECOMMENDED** 
3. `review-data-viewer-corrected.bmml` ✅ **RECOMMENDED**
4. `excel-export-modal-corrected.bmml` ✅ **RECOMMENDED**
5. `scraper-configuration-modal-corrected.bmml` ✅ **RECOMMENDED**

### Test First:
- `test-simple.bmml` - Simple test file to verify import works

---

## 🔧 Step-by-Step Import Instructions

### For Balsamiq Mockups 3:
1. **Open Balsamiq Mockups 3**
2. **Go to File → Import → Import BMML Files**
3. **Select the CORRECTED files** (with `-corrected` in filename)
4. **Click "Open"**
5. **File should appear with all content visible**

### For Balsamiq Cloud:
1. **Log in to Balsamiq Cloud**
2. **Create/Open a project**
3. **Click "Import" button**
4. **Select CORRECTED BMML files**
5. **Click "Import"**

---

## ⚠️ Common Issues & Solutions

### Issue: "Project stays blank after import"
**Cause**: Using original `.bmml` files with incorrect XML format
**Solution**: Use files ending in `-corrected.bmml`

### Issue: "File won't import at all"
**Solutions**:
1. Try the `test-simple.bmml` file first
2. Check Balsamiq version (requires version 3.0+)
3. Import one file at a time
4. Restart Balsamiq and try again

### Issue: "Missing elements or broken layout"
**Solution**: Use the corrected files - they have proper Balsamiq control type IDs

---

## 📋 File Comparison

### Original Files (❌ DON'T USE):
- `dashboard-overview.bmml`
- `scraper-management.bmml` 
- `review-data-viewer.bmml`
- `excel-export-modal.bmml`
- `scraper-configuration-modal.bmml`

**Problems**: 
- Missing required XML attributes
- Incorrect control type format
- Missing Balsamiq-specific elements

### Corrected Files (✅ USE THESE):
- `dashboard-overview-corrected.bmml`
- `scraper-management-corrected.bmml`
- `review-data-viewer-corrected.bmml`
- `excel-export-modal-corrected.bmml`
- `scraper-configuration-modal-corrected.bmml`

**Fixes**:
- ✅ Added `mockupW` and `mockupH` attributes
- ✅ Full Balsamiq control type IDs (`com.balsamiq.mockups::Canvas`)
- ✅ Required `locked` and `isInGroup` attributes
- ✅ Proper XML structure for Balsamiq 3

---

## 🧪 Testing Your Import

1. **Start with**: `test-simple.bmml`
   - Contains just 3 basic elements
   - Should import quickly
   - Verifies your Balsamiq setup works

2. **If test works**: Try `dashboard-overview-corrected.bmml`
   - Full dashboard with all elements
   - Should show header, sidebar, stats cards, table

3. **If both work**: Import remaining corrected files

---

## 📁 Alternative Solutions

### Option 1: Rename to BMPR
If BMML import still fails:
1. Copy the corrected BMML file
2. Rename extension from `.bmml` to `.bmpr`
3. Try importing as BMPR file

### Option 2: Manual Recreation
1. Import the test-simple.bmml file
2. Manually add elements following the visual preview
3. Use the corrected files as reference

### Option 3: Balsamiq Cloud
1. Upload to Balsamiq Cloud (often more forgiving)
2. Export as BMPR
3. Import into desktop Balsamiq

---

## 📞 Still Having Issues?

1. **Check Balsamiq Version**: Requires 3.0 or higher
2. **Try Balsamiq Cloud**: Often works when desktop fails
3. **Manual Import**: Use visual preview as reference
4. **Contact Support**: Balsamiq support for version-specific help

---

## 🎨 What You Should See

When successfully imported, `dashboard-overview-corrected.bmml` should show:
- Header with "Review Scraper" title
- Left sidebar with navigation buttons
- 4 blue stats cards (Total Reviews, Active Scrapers, Export Ready, Storage Used)
- Recent Activity table with platform data
- Action buttons at bottom

If you see a blank canvas, the import failed - try the corrected files!