import { useState } from "react";
import { Plus, TrendingUp, Clock, Star, Download, Settings } from "lucide-react";

// Stats Card Component
function StatsCard({ title, value, change, icon: Icon, color = "blue" }: any) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <div className={`doodle-card ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="doodle-text text-sm opacity-75">{title}</p>
          <p className="doodle-title !text-2xl !mb-0">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="w-12 h-12 doodle-border bg-white flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ title, description, time, type = "info" }: any) {
  const typeColors = {
    info: "bg-blue-100 text-blue-600",
    success: "bg-green-100 text-green-600",
    warning: "bg-orange-100 text-orange-600",
    error: "bg-red-100 text-red-600",
  };

  return (
    <div className="doodle-border bg-white p-4 mb-3">
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 ${typeColors[type as keyof typeof typeColors]}`} />
        <div className="flex-1">
          <h4 className="doodle-subtitle !text-base !mb-1">{title}</h4>
          <p className="doodle-text text-sm">{description}</p>
          <p className="doodle-text text-xs opacity-75 mt-1">{time}</p>
        </div>
      </div>
    </div>
  );
}

// Scraper Card Component
function ScraperCard({ name, platform, status, lastRun, reviews }: any) {
  const statusColors = {
    active: "bg-green-100 text-green-700",
    paused: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <div className="doodle-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="doodle-subtitle !text-lg !mb-1">{name}</h3>
          <p className="doodle-text text-sm text-gray-600">{platform}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
          {status}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="doodle-text">Last run:</span>
          <span className="doodle-text">{lastRun}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="doodle-text">Reviews:</span>
          <span className="doodle-text font-medium">{reviews}</span>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button className="doodle-btn doodle-btn-primary flex-1">
          <Settings className="w-4 h-4" />
          Configure
        </button>
        <button className="doodle-btn doodle-btn-secondary">
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // Mock data for dashboard
  const stats = [
    { title: "Total Reviews", value: "2,847", change: "+12%", icon: Star, color: "blue" },
    { title: "Active Scrapers", value: "8", change: "+2", icon: Plus, color: "green" },
    { title: "Platforms", value: "5", change: "+1", icon: TrendingUp, color: "purple" },
    { title: "Avg. Daily Reviews", value: "407", change: "+8%", icon: Clock, color: "orange" },
  ];

  const recentActivity = [
    {
      title: "Amazon Scraper Completed",
      description: "Successfully scraped 234 new reviews from Amazon product pages",
      time: "2 minutes ago",
      type: "success"
    },
    {
      title: "Yelp Scraper Error",
      description: "Connection timeout while scraping Yelp business reviews",
      time: "15 minutes ago",
      type: "error"
    },
    {
      title: "Google Reviews Updated",
      description: "Added 89 new reviews from Google My Business listings",
      time: "1 hour ago",
      type: "info"
    },
    {
      title: "Export Job Started",
      description: "Exporting 1,200 reviews to Excel format",
      time: "2 hours ago",
      type: "info"
    },
  ];

  const activeScrapers = [
    {
      name: "Amazon Product Reviews",
      platform: "Amazon",
      status: "active",
      lastRun: "2 minutes ago",
      reviews: "1,234"
    },
    {
      name: "Yelp Business Reviews",
      platform: "Yelp",
      status: "paused",
      lastRun: "1 hour ago",
      reviews: "567"
    },
    {
      name: "Google My Business",
      platform: "Google",
      status: "active",
      lastRun: "5 minutes ago",
      reviews: "890"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="doodle-title">Dashboard Overview</h1>
          <p className="doodle-text">Monitor your review scraping activities</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="doodle-input"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="doodle-btn doodle-btn-primary">
            <Plus className="w-4 h-4" />
            New Scraper
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="doodle-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="doodle-subtitle">Recent Activity</h2>
              <button className="doodle-btn doodle-btn-secondary text-sm">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Active Scrapers */}
        <div>
          <div className="doodle-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="doodle-subtitle">Active Scrapers</h2>
              <button className="doodle-btn doodle-btn-secondary text-sm">
                Manage
              </button>
            </div>
            <div className="space-y-4">
              {activeScrapers.map((scraper, index) => (
                <ScraperCard key={index} {...scraper} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="doodle-card">
        <h2 className="doodle-subtitle mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="doodle-btn doodle-btn-primary">
            <Plus className="w-4 h-4" />
            Create New Scraper
          </button>
          <button className="doodle-btn doodle-btn-secondary">
            <Download className="w-4 h-4" />
            Export All Reviews
          </button>
          <button className="doodle-btn doodle-btn-secondary">
            <Settings className="w-4 h-4" />
            Configure Settings
          </button>
        </div>
      </div>
    </div>
  );
}