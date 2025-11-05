import React, { useState } from 'react';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'excel' | 'csv', filters: any) => void;
  totalReviews: number;
}

const ExcelExportModal: React.FC<ExcelExportModalProps> = ({ isOpen, onClose, onExport, totalReviews }) => {
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv'>('excel');
  const [includeFilters, setIncludeFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    platform: '',
    rating: '',
    dateRange: '',
    search: ''
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filters = includeFilters ? selectedFilters : {};
      await onExport(exportFormat, filters);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 doodle-overlay">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 doodle-modal">
        <div className="p-6 border-b border-gray-200 doodle-border">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold doodle-title">Export Reviews</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 doodle-button"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 doodle-label">
              Export Format
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={(e) => setExportFormat(e.target.value as 'excel' | 'csv')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Excel (.xlsx)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value as 'excel' | 'csv')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">CSV (.csv)</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 doodle-label">
                Apply Filters
              </label>
              <span className="text-sm text-gray-500">{totalReviews} total reviews</span>
            </div>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeFilters}
                onChange={(e) => setIncludeFilters(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Apply current filters to export</span>
            </label>
          </div>

          {includeFilters && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="text-sm font-medium text-gray-700 doodle-label">Filter Options</h3>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Platform</label>
                <select
                  value={selectedFilters.platform}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-select"
                >
                  <option value="">All Platforms</option>
                  <option value="amazon">Amazon</option>
                  <option value="google">Google Business</option>
                  <option value="yelp">Yelp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Rating</label>
                <select
                  value={selectedFilters.rating}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-select"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Date Range</label>
                <select
                  value={selectedFilters.dateRange}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-select"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Search</label>
                <input
                  type="text"
                  value={selectedFilters.search}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-input"
                  placeholder="Search in reviews..."
                />
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Export will include review data with statistics and formatting. Large exports may take a few moments to process.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 doodle-border">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 doodle-button"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center space-x-2 doodle-button"
          >
            {isExporting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isExporting ? 'Exporting...' : 'Export Reviews'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelExportModal;