import { useState } from "react";
import { Search, Filter, Download, Star, Calendar, User, MapPin, ExternalLink } from "lucide-react";

// Star Rating Component
function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const starSize = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: any }) {
  const [expanded, setExpanded] = useState(false);
  
  const shouldTruncate = review.content.length > 200;
  const displayContent = expanded || !shouldTruncate 
    ? review.content 
    : review.content.substring(0, 200) + "...";

  return (
    <div className="doodle-card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 doodle-border bg-blue-100 flex items-center justify-center">
            <span className="text-lg font-bold text-blue-600">
              {review.author.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="doodle-subtitle !text-lg !mb-1">{review.author}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{review.location}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <StarRating rating={review.rating} size="lg" />
          <p className="doodle-text text-sm mt-1">{review.date}</p>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="doodle-subtitle !text-base !mb-2">{review.title}</h4>
        <p className="doodle-text leading-relaxed">
          {displayContent}
        </p>
        {shouldTruncate && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="doodle-btn doodle-btn-link text-sm mt-2"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <ExternalLink className="w-4 h-4" />
            {review.source}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {review.scrapedDate}
          </span>
        </div>
        <div className="flex gap-2">
          <button className="doodle-btn doodle-btn-secondary text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="doodle-btn doodle-btn-secondary text-sm">
            View Source
          </button>
        </div>
      </div>
    </div>
  );
}

// Filter Panel Component
function FilterPanel({ filters, onFilterChange, platforms }: any) {
  return (
    <div className="doodle-card space-y-4">
      <h3 className="doodle-subtitle">Filters</h3>
      
      <div>
        <label className="doodle-label">Platform</label>
        <select 
          value={filters.platform}
          onChange={(e) => onFilterChange('platform', e.target.value)}
          className="doodle-input w-full"
        >
          <option value="">All Platforms</option>
          {platforms.map((platform: string) => (
            <option key={platform} value={platform}>{platform}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="doodle-label">Rating</label>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.ratings.includes(rating)}
                onChange={(e) => {
                  const newRatings = e.target.checked
                    ? [...filters.ratings, rating]
                    : filters.ratings.filter((r: number) => r !== rating);
                  onFilterChange('ratings', newRatings);
                }}
                className="doodle-checkbox"
              />
              <StarRating rating={rating} />
              <span className="doodle-text text-sm">& up</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="doodle-label">Date Range</label>
        <div className="space-y-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            className="doodle-input w-full"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            className="doodle-input w-full"
          />
        </div>
      </div>

      <div>
        <label className="doodle-label">Keyword Search</label>
        <input
          type="text"
          placeholder="Search in reviews..."
          value={filters.keyword}
          onChange={(e) => onFilterChange('keyword', e.target.value)}
          className="doodle-input w-full"
        />
      </div>

      <button 
        onClick={() => onFilterChange('reset', null)}
        className="doodle-btn doodle-btn-secondary w-full"
      >
        Clear Filters
      </button>
    </div>
  );
}

export default function ReviewViewer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState("date_desc");
  const [filters, setFilters] = useState({
    platform: "",
    ratings: [],
    dateFrom: "",
    dateTo: "",
    keyword: ""
  });

  // Mock review data
  const reviews = [
    {
      id: 1,
      author: "John Smith",
      location: "New York, NY",
      rating: 5,
      title: "Excellent product and service!",
      content: "I am extremely satisfied with this product. The quality exceeded my expectations and the customer service was outstanding. The delivery was fast and the packaging was secure. I would definitely recommend this to anyone looking for a reliable solution. The attention to detail and the overall user experience was fantastic.",
      date: "2 days ago",
      scrapedDate: "1 day ago",
      source: "Amazon",
      platform: "Amazon"
    },
    {
      id: 2,
      author: "Sarah Johnson",
      location: "Los Angeles, CA",
      rating: 4,
      title: "Good value for money",
      content: "This product offers good value for the price. While there are some minor issues, overall it's a solid choice. The build quality is decent and it functions as expected. Customer support was helpful when I had questions.",
      date: "1 week ago",
      scrapedDate: "3 days ago",
      source: "Yelp",
      platform: "Yelp"
    },
    {
      id: 3,
      author: "Mike Wilson",
      location: "Chicago, IL",
      rating: 3,
      title: "Average experience",
      content: "The product is okay but nothing special. It works as described but I expected more given the price point. The shipping was delayed and the packaging could have been better. It's functional but I might look for alternatives next time.",
      date: "3 days ago",
      scrapedDate: "2 days ago",
      source: "Google Reviews",
      platform: "Google"
    },
    {
      id: 4,
      author: "Emily Davis",
      location: "Miami, FL",
      rating: 5,
      title: "Amazing quality and fast delivery!",
      content: "Absolutely love this product! The quality is amazing and it arrived much faster than expected. The seller was very responsive to my questions and the entire purchasing process was smooth. Highly recommend!",
      date: "5 hours ago",
      scrapedDate: "4 hours ago",
      source: "TripAdvisor",
      platform: "TripAdvisor"
    }
  ];

  const platforms = ["Amazon", "Yelp", "Google", "TripAdvisor", "Best Buy"];

  const handleFilterChange = (key: string, value: any) => {
    if (key === 'reset') {
      setFilters({
        platform: "",
        ratings: [],
        dateFrom: "",
        dateTo: "",
        keyword: ""
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleExport = (format: string) => {
    console.log(`Export reviews as ${format}`);
  };

  const filteredReviews = reviews.filter(review => {
    if (searchTerm && !review.content.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !review.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !review.author.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    if (filters.platform && review.platform !== filters.platform) {
      return false;
    }
    
    if (filters.ratings.length > 0 && !filters.ratings.includes(review.rating)) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="doodle-title">Review Data Viewer</h1>
          <p className="doodle-text">Browse and analyze scraped reviews</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="doodle-btn doodle-btn-secondary"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="doodle-input pr-8"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="rating_desc">Highest Rating</option>
              <option value="rating_asc">Lowest Rating</option>
              <option value="author_asc">Author A-Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80">
            <FilterPanel 
              filters={filters}
              onFilterChange={handleFilterChange}
              platforms={platforms}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="doodle-card mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews by content, title, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="doodle-input pl-10 w-full"
              />
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="doodle-subtitle">
                {filteredReviews.length} Reviews Found
              </h2>
              <p className="doodle-text text-sm">
                Sorted by {sortBy === 'date_desc' ? 'newest first' : 
                         sortBy === 'date_asc' ? 'oldest first' :
                         sortBy === 'rating_desc' ? 'highest rating' :
                         sortBy === 'rating_asc' ? 'lowest rating' : 'author A-Z'}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleExport('excel')}
                className="doodle-btn doodle-btn-secondary"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
              <button 
                onClick={() => handleExport('csv')}
                className="doodle-btn doodle-btn-secondary"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button 
                onClick={() => handleExport('json')}
                className="doodle-btn doodle-btn-primary"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {/* Pagination */}
          <div className="doodle-card mt-6">
            <div className="flex items-center justify-between">
              <p className="doodle-text text-sm">
                Showing {filteredReviews.length} of {filteredReviews.length} reviews
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
        </div>
      </div>
    </div>
  );
}