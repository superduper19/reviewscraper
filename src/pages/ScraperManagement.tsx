import { useState } from "react";
import { Plus, Search, Filter, Play, Pause, Settings, Download, Trash2, Edit } from "lucide-react";

// Scraper Table Row Component
function ScraperTableRow({ scraper, onEdit, onDelete, onToggle }: any) {
  const statusColors = {
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <tr className="doodle-border hover:bg-gray-50">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 doodle-border bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">{scraper.platform[0]}</span>
          </div>
          <div>
            <h4 className="doodle-subtitle !text-base !mb-0">{scraper.name}</h4>
            <p className="doodle-text text-sm text-gray-600">{scraper.platform}</p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[scraper.status as keyof typeof statusColors]}`}>
          {scraper.status}
        </span>
      </td>
      <td className="p-4 doodle-text">{scraper.lastRun}</td>
      <td className="p-4 doodle-text">{scraper.reviewsCount}</td>
      <td className="p-4 doodle-text">{scraper.successRate}</td>
      <td className="p-4">
        <div className="flex gap-2">
          <button 
            onClick={() => onToggle(scraper.id)}
            className={`doodle-btn ${scraper.status === 'active' ? 'doodle-btn-secondary' : 'doodle-btn-primary'} p-2`}
          >
            {scraper.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => onEdit(scraper)}
            className="doodle-btn doodle-btn-secondary p-2"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button className="doodle-btn doodle-btn-secondary p-2">
            <Settings className="w-4 h-4" />
          </button>
          <button className="doodle-btn doodle-btn-secondary p-2">
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(scraper.id)}
            className="doodle-btn doodle-btn-danger p-2"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Filter Modal Component
function FilterModal({ isOpen, onClose, filters, onApply }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="doodle-card bg-white max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="doodle-subtitle">Filter Scrapers</h3>
          <button onClick={onClose} className="doodle-btn doodle-btn-secondary p-2">
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="doodle-label">Platform</label>
            <select className="doodle-input w-full">
              <option value="">All Platforms</option>
              <option value="amazon">Amazon</option>
              <option value="yelp">Yelp</option>
              <option value="google">Google</option>
              <option value="tripadvisor">TripAdvisor</option>
            </select>
          </div>
          
          <div>
            <label className="doodle-label">Status</label>
            <select className="doodle-input w-full">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="error">Error</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="doodle-label">Reviews Count</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" className="doodle-input flex-1" />
              <input type="number" placeholder="Max" className="doodle-input flex-1" />
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="doodle-btn doodle-btn-secondary flex-1">
            Cancel
          </button>
          <button onClick={onApply} className="doodle-btn doodle-btn-primary flex-1">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ScraperManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedScrapers, setSelectedScrapers] = useState<number[]>([]);

  // Mock scrapers data
  const scrapers = [
    {
      id: 1,
      name: "Amazon Product Reviews",
      platform: "Amazon",
      status: "active",
      lastRun: "2 minutes ago",
      reviewsCount: "1,234",
      successRate: "98%"
    },
    {
      id: 2,
      name: "Yelp Business Reviews",
      platform: "Yelp",
      status: "paused",
      lastRun: "1 hour ago",
      reviewsCount: "567",
      successRate: "95%"
    },
    {
      id: 3,
      name: "Google My Business",
      platform: "Google",
      status: "active",
      lastRun: "5 minutes ago",
      reviewsCount: "890",
      successRate: "99%"
    },
    {
      id: 4,
      name: "TripAdvisor Reviews",
      platform: "TripAdvisor",
      status: "error",
      lastRun: "3 hours ago",
      reviewsCount: "234",
      successRate: "87%"
    },
    {
      id: 5,
      name: "Best Buy Reviews",
      platform: "Best Buy",
      status: "completed",
      lastRun: "1 day ago",
      reviewsCount: "456",
      successRate: "96%"
    }
  ];

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedScrapers(scrapers.map(s => s.id));
    } else {
      setSelectedScrapers([]);
    }
  };

  const handleSelectScraper = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedScrapers([...selectedScrapers, id]);
    } else {
      setSelectedScrapers(selectedScrapers.filter(sid => sid !== id));
    }
  };

  const handleToggleScraper = (id: number) => {
    console.log(`Toggle scraper ${id}`);
  };

  const handleEditScraper = (scraper: any) => {
    console.log(`Edit scraper ${scraper.name}`);
  };

  const handleDeleteScraper = (id: number) => {
    console.log(`Delete scraper ${id}`);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action ${action} on ${selectedScrapers.length} scrapers`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="doodle-title">Scraper Management</h1>
          <p className="doodle-text">Manage and monitor your review scrapers</p>
        </div>
        <button className="doodle-btn doodle-btn-primary">
          <Plus className="w-4 h-4" />
          New Scraper
        </button>
      </div>

      {/* Filters and Search */}
      <div className="doodle-card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search scrapers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="doodle-input pl-10 w-full"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilterModal(true)}
              className="doodle-btn doodle-btn-secondary"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="doodle-btn doodle-btn-secondary">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedScrapers.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="doodle-text">
                {selectedScrapers.length} scrapers selected
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleBulkAction('start')}
                  className="doodle-btn doodle-btn-primary text-sm"
                >
                  <Play className="w-4 h-4" />
                  Start
                </button>
                <button 
                  onClick={() => handleBulkAction('pause')}
                  className="doodle-btn doodle-btn-secondary text-sm"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
                <button 
                  onClick={() => handleBulkAction('delete')}
                  className="doodle-btn doodle-btn-danger text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrapers Table */}
      <div className="doodle-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedScrapers.length === scrapers.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="doodle-checkbox"
                  />
                </th>
                <th className="p-4 text-left doodle-subtitle !text-sm">Name</th>
                <th className="p-4 text-left doodle-subtitle !text-sm">Status</th>
                <th className="p-4 text-left doodle-subtitle !text-sm">Last Run</th>
                <th className="p-4 text-left doodle-subtitle !text-sm">Reviews</th>
                <th className="p-4 text-left doodle-subtitle !text-sm">Success Rate</th>
                <th className="p-4 text-left doodle-subtitle !text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scrapers.map((scraper) => (
                <ScraperTableRow
                  key={scraper.id}
                  scraper={{
                    ...scraper,
                    selected: selectedScrapers.includes(scraper.id)
                  }}
                  onToggle={handleToggleScraper}
                  onEdit={handleEditScraper}
                  onDelete={handleDeleteScraper}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="doodle-card">
        <div className="flex items-center justify-between">
          <p className="doodle-text text-sm">
            Showing {scrapers.length} of {scrapers.length} scrapers
          </p>
          <div className="flex gap-2">
            <button className="doodle-btn doodle-btn-secondary text-sm" disabled>
              Previous
            </button>
            <button className="doodle-btn doodle-btn-primary text-sm">
              1
            </button>
            <button className="doodle-btn doodle-btn-secondary text-sm" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={{}}
        onApply={() => {
          setShowFilterModal(false);
          console.log('Apply filters');
        }}
      />
    </div>
  );
}