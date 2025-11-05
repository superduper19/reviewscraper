import React, { useState, useEffect } from 'react';

interface ScraperConfig {
  id?: number;
  name: string;
  platform: string;
  url: string;
  selectors: {
    reviewContainer: string;
    title: string;
    content: string;
    rating: string;
    author: string;
    date: string;
    verified: string;
    helpful: string;
  };
  settings: {
    maxPages: number;
    delay: number;
    userAgent: string;
    headers: Record<string, string>;
    proxy?: string;
  };
  schedule: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    time: string;
  };
  notifications: {
    email: boolean;
    webhook: boolean;
    emailAddress?: string;
    webhookUrl?: string;
  };
}

interface ScraperConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ScraperConfig) => void;
  config?: ScraperConfig;
}

const platformTemplates = {
  amazon: {
    name: 'Amazon Product Reviews',
    selectors: {
      reviewContainer: '[data-hook="review"]',
      title: '[data-hook="review-title"] span',
      content: '[data-hook="review-body"] span',
      rating: '[data-hook="review-star-rating"] .a-icon-alt',
      author: '[data-hook="review-author"] .a-profile-name',
      date: '[data-hook="review-date"]',
      verified: '[data-hook="avp-badge"]',
      helpful: '[data-hook="helpful-vote-statement"]'
    },
    settings: {
      maxPages: 10,
      delay: 2000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  google: {
    name: 'Google Business Reviews',
    selectors: {
      reviewContainer: '.gws-localreviews__general-reviews-block .gws-localreviews__google-review',
      title: '.Jtu6Td span',
      content: '.Jtu6Td span',
      rating: '.PuaHbe .Fam1ne',
      author: '.TSUbDb',
      date: '.dehysf',
      verified: '.Fam1ne',
      helpful: '.Fam1ne'
    },
    settings: {
      maxPages: 5,
      delay: 1500,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  },
  yelp: {
    name: 'Yelp Reviews',
    selectors: {
      reviewContainer: '[data-testid="review-card"]',
      title: '[data-testid="review-title"]',
      content: '[data-testid="review-text"]',
      rating: '[data-testid="review-rating"]',
      author: '.css-1snc6od',
      date: '.css-1snc6od + .css-1snc6od',
      verified: '.css-1snc6od',
      helpful: '.css-1snc6od'
    },
    settings: {
      maxPages: 8,
      delay: 3000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }
};

const ScraperConfigModal: React.FC<ScraperConfigModalProps> = ({ isOpen, onClose, onSave, config }) => {
  const [formData, setFormData] = useState<ScraperConfig>({
    name: '',
    platform: 'amazon',
    url: '',
    selectors: {
      reviewContainer: '',
      title: '',
      content: '',
      rating: '',
      author: '',
      date: '',
      verified: '',
      helpful: ''
    },
    settings: {
      maxPages: 10,
      delay: 2000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      headers: {},
      proxy: ''
    },
    schedule: {
      enabled: false,
      frequency: 'daily',
      time: '02:00'
    },
    notifications: {
      email: false,
      webhook: false
    }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handlePlatformChange = (platform: string) => {
    const template = platformTemplates[platform as keyof typeof platformTemplates];
    if (template) {
      setFormData(prev => ({
        ...prev,
        platform,
        selectors: template.selectors,
        settings: {
          ...prev.settings,
          ...template.settings
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, platform }));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      const newData = { ...prev };
      let current = newData as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const testSelectors = async () => {
    setTestResult('Testing selectors...');
    try {
      const response = await fetch('/api/scrapers/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          url: formData.url,
          selectors: formData.selectors
        })
      });

      const result = await response.json();
      if (result.success) {
        setTestResult(`Test successful! Found ${result.reviewsFound} reviews.`);
      } else {
        setTestResult(`Test failed: ${result.error}`);
      }
    } catch (error) {
      setTestResult('Test failed: Network error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 doodle-overlay">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden doodle-modal">
        <div className="p-6 border-b border-gray-200 doodle-border">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold doodle-title">
              {config ? 'Edit Scraper Configuration' : 'Create New Scraper'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 doodle-button"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200 doodle-border">
          {['basic', 'selectors', 'settings', 'schedule', 'notifications'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize doodle-tab ${
                activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 doodle-label">
                  Scraper Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-input"
                  placeholder="Enter scraper name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 doodle-label">
                  Platform *
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-select"
                >
                  <option value="">Select Platform</option>
                  <option value="amazon">Amazon</option>
                  <option value="google">Google Business</option>
                  <option value="yelp">Yelp</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 doodle-label">
                  Target URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-input"
                  placeholder="https://example.com/product/reviews"
                  required
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={testSelectors}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 doodle-button"
                >
                  Test Selectors
                </button>
                {testResult && (
                  <div className={`px-3 py-2 rounded-md text-sm ${
                    testResult.includes('successful') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {testResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'selectors' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 doodle-subtitle">CSS Selectors</h3>
              
              {Object.entries(formData.selectors).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 doodle-label capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange(`selectors.${key}`, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-input"
                    placeholder={`Enter CSS selector for ${key}`}
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 doodle-subtitle">Scraping Settings</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 doodle-label">
                  Max Pages
                </label>
                <input
                  type="number"
                  value={formData.settings.maxPages}
                  onChange={(e) => handleInputChange('settings.maxPages', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-input"
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 doodle-label">
                  Delay Between Requests (ms)
                </label>
                <input
                  type="number"
                  value={formData.settings.delay}
                  onChange={(e) => handleInputChange('settings.delay', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-input"
                  min="100"
                  max="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 doodle-label">
                  User Agent
                </label>
                <textarea
                  value={formData.settings.userAgent}
                  onChange={(e) => handleInputChange('settings.userAgent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-textarea"
                  rows={3}
                  placeholder="Enter custom user agent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 doodle-label">
                  Proxy (Optional)
                </label>
                <input
                  type="text"
                  value={formData.settings.proxy || ''}
                  onChange={(e) => handleInputChange('settings.proxy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-input"
                  placeholder="http://proxy:port or socks5://proxy:port"
                />
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="schedule-enabled"
                  checked={formData.schedule.enabled}
                  onChange={(e) => handleInputChange('schedule.enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="schedule-enabled" className="ml-2 block text-sm font-medium text-gray-700 doodle-label">
                  Enable Scheduled Scraping
                </label>
              </div>

              {formData.schedule.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 doodle-label">
                      Frequency
                    </label>
                    <select
                      value={formData.schedule.frequency}
                      onChange={(e) => handleInputChange('schedule.frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-select"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 doodle-label">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.schedule.time}
                      onChange={(e) => handleInputChange('schedule.time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-input"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email-notifications"
                  checked={formData.notifications.email}
                  onChange={(e) => handleInputChange('notifications.email', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="email-notifications" className="ml-2 block text-sm font-medium text-gray-700 doodle-label">
                  Email Notifications
                </label>
              </div>

              {formData.notifications.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 doodle-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.notifications.emailAddress || ''}
                    onChange={(e) => handleInputChange('notifications.emailAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-input"
                    placeholder="your-email@example.com"
                  />
                </div>
              )}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="webhook-notifications"
                  checked={formData.notifications.webhook}
                  onChange={(e) => handleInputChange('notifications.webhook', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="webhook-notifications" className="ml-2 block text-sm font-medium text-gray-700 doodle-label">
                  Webhook Notifications
                </label>
              </div>

              {formData.notifications.webhook && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 doodle-label">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={formData.notifications.webhookUrl || ''}
                    onChange={(e) => handleInputChange('notifications.webhookUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-input"
                    placeholder="https://your-webhook-url.com"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 doodle-border">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 doodle-button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 doodle-button"
            >
              {config ? 'Update Scraper' : 'Create Scraper'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScraperConfigModal;