import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { BarChart3, Settings, User, FileText, Download, Plus, Menu, X } from "lucide-react";
import Home from "@/pages/Home.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import ScraperManagement from "@/pages/ScraperManagement.tsx";
import ReviewViewer from "@/pages/ReviewViewer.tsx";

// Main App Layout Component
function AppLayout({ children }: { children: React.ReactNode }) {
  const [activeNav, setActiveNav] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/' },
    { id: 'scrapers', label: 'Scrapers', icon: Plus, path: '/scrapers' },
    { id: 'reviews', label: 'Reviews', icon: FileText, path: '/reviews' },
    { id: 'export', label: 'Export', icon: Download, path: '/export' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="doodle-body min-h-screen">
      {/* Header */}
      <header className="doodle-border bg-white p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 doodle-border bg-blue-100 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">RS</span>
            </div>
            <h1 className="doodle-title !mb-0">Review Scraper</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="doodle-btn doodle-btn-secondary">
              <User className="w-4 h-4" />
              Profile
            </button>
          </div>
        </div>
      </header>

      <div className="flex gap-6 px-6">
        {/* Sidebar Navigation */}
        <nav className="doodle-nav w-64 h-fit">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveNav(item.id);
                    window.history.pushState({}, '', item.path);
                  }}
                  className={`doodle-nav-item ${activeNav === item.id ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        } />
        <Route path="/scrapers" element={
          <AppLayout>
            <ScraperManagement />
          </AppLayout>
        } />
        <Route path="/reviews" element={
          <AppLayout>
            <ReviewViewer />
          </AppLayout>
        } />
        <Route path="/export" element={
          <AppLayout>
            <div className="doodle-card">
              <h2 className="doodle-subtitle">Export Data</h2>
              <p className="doodle-text">Export functionality coming soon...</p>
            </div>
          </AppLayout>
        } />
        <Route path="/settings" element={
          <AppLayout>
            <div className="doodle-card">
              <h2 className="doodle-subtitle">Settings</h2>
              <p className="doodle-text">Settings page coming soon...</p>
            </div>
          </AppLayout>
        } />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}
