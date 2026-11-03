import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { eventsAPI } from '../services/api';
import EventCard from '../components/EventCard';
import { EventCardSkeleton } from '../components/Loaders';

const CATEGORIES = ['All', 'Tech', 'Cultural', 'Sports', 'Workshop'];

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (category !== 'All') params.category = category;
      if (search.trim()) params.search = search.trim();

      const { data } = await eventsAPI.getAll(params);
      setEvents(data.events);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      toast.error('Could not load events. Is the backend running?', { id: 'load-events' });
    } finally {
      setLoading(false);
    }
  }, [category, page, search]);

  useEffect(() => {
    const debounce = setTimeout(fetchEvents, 300);
    return () => clearTimeout(debounce);
  }, [fetchEvents]);

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 text-xs font-mono text-primary-600 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live Campus Events
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-black text-slate-900 mb-4 leading-tight">
            Discover <span className="gradient-text">Campus Events</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Explore tech talks, cultural fests, sports tournaments, and workshops happening at your college.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
        {/* Search + Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-field pl-9 text-sm"
              />
              {search && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category filters */}
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`text-xs px-3 py-2 rounded-lg font-medium transition-all ${
                    category === cat
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-slate-400 mb-5 font-mono">
            {total === 0 ? 'No events found' : `Showing ${events.length} of ${total} events`}
            {category !== 'All' && <span className="text-primary-500"> · {category}</span>}
            {search && <span className="text-primary-500"> · "{search}"</span>}
          </p>
        )}

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-display font-semibold text-slate-700 mb-2">No events found</h3>
            <p className="text-slate-400 text-sm">Try a different search or category filter</p>
            {(search || category !== 'All') && (
              <button
                onClick={() => { setSearch(''); setCategory('All'); }}
                className="mt-4 btn-secondary text-sm"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
              {events.map((event) => <EventCard key={event._id} event={event} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="btn-secondary text-sm py-2 px-4 disabled:opacity-30"
                >
                  ← Prev
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-9 h-9 rounded-lg text-sm font-mono transition-colors ${
                        page === i + 1
                          ? 'bg-primary-600 text-white'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="btn-secondary text-sm py-2 px-4 disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}