# Balsamiq Files - Quick Reference

## 🟢 USE THESE FILES (WORKING)

| File | Purpose | Status |
|------|---------|--------|
| `dashboard-overview-corrected.bmml` | Main dashboard with stats | ✅ WORKS |
| `scraper-management-corrected.bmml` | Manage scrapers interface | ✅ WORKS |
| `review-data-viewer-corrected.bmml` | View review data | ✅ WORKS |
| `excel-export-modal-corrected.bmml` | Export configuration | ✅ WORKS |
| `scraper-configuration-modal-corrected.bmml` | New scraper setup | ✅ WORKS |
| `test-simple.bmml` | Quick test file | ✅ WORKS |

## 🔴 DON'T USE THESE (BLANK PROJECT)

| File | Problem |
|------|---------|
| `dashboard-overview.bmml` | ❌ Causes blank project |
| `scraper-management.bmml` | ❌ Causes blank project |
| `review-data-viewer.bmml` | ❌ Causes blank project |
| `excel-export-modal.bmml` | ❌ Causes blank project |
| `scraper-configuration-modal.bmml` | ❌ Causes blank project |

---

## ⚡ Quick Fix

**Problem**: "Project stays blank after import"

**Solution**: Use files with `-corrected` in the filename

**Test First**: Import `test-simple.bmml` to verify setup

---

## 🔧 What Was Fixed

| Original (Broken) | Corrected (Working) |
|-------------------|----------------------|
| `ID="0"` | `controlID="0"` |
| `typeID="Canvas"` | `controlTypeID="com.balsamiq.mockups::Canvas"` |
| Missing dimensions | `mockupW="1366" mockupH="768"` |
| Missing attributes | `locked="false" isInGroup="false"` |

---

## 📋 Import Steps

1. **Open Balsamiq 3**
2. **File → Import → Import BMML Files**
3. **Select CORRECTED file**
4. **Click "Open"**
5. **Content should appear immediately**

---

## 🆘 Still Not Working?

1. **Try test-simple.bmml first**
2. **Check Balsamiq version** (need 3.0+)
3. **Import one file at a time**
4. **Use Balsamiq Cloud** (more forgiving)
5. **See TROUBLESHOOTING_BLANK_PROJECT.md**

---

## 🎯 Start Here

**Recommended Order**:
1. `test-simple.bmml` (verify setup)
2. `dashboard-overview-corrected.bmml` (main interface)
3. Other corrected files as needed