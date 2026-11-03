import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { PageLoader } from '../components/Loaders';
import { formatDate, getCategoryColor, getCategoryIcon } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        eventsAPI.getAdminStats(),
        eventsAPI.getAll({ limit: 50, sort: '-createdAt' }),
      ]);
      setStats(statsRes.data.stats);
      setEvents(eventsRes.data.events);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await eventsAPI.delete(id);
      toast.success('Event deleted');
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch {
      toast.error('Failed to delete event');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all campus events</p>
        </div>
        <Link to="/admin/events/create" className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Event
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard value={stats.totalEvents} label="Total Events" icon="📅" />
          <StatCard value={stats.upcomingEvents} label="Upcoming" icon="🗓️" highlight />
          <StatCard value={stats.totalUsers} label="Students" icon="👥" />
          <StatCard value={stats.totalEvents - stats.upcomingEvents} label="Completed" icon="✅" />
        </div>
      )}

      {/* Category breakdown */}
      {stats?.categoryStats?.length > 0 && (
        <div className="glass-card rounded-2xl p-5 mb-8">
          <h2 className="font-display text-lg font-semibold text-slate-900 mb-4">Events by Category</h2>
          <div className="flex gap-4 flex-wrap">
            {stats.categoryStats.map(({ _id, count }) => (
              <div key={_id} className={`flex items-center gap-2 category-badge ${getCategoryColor(_id)} py-2 px-3`}>
                <span>{getCategoryIcon(_id)}</span>
                <span className="font-display font-bold text-base">{count}</span>
                <span>{_id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Events Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-slate-900">All Events ({events.length})</h2>
        </div>
        <div className="overflow-x-auto">
          {events.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-slate-500 font-display font-semibold mb-2">No events yet</p>
              <Link to="/admin/events/create" className="btn-primary text-sm">Create your first event</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-mono text-slate-500 uppercase tracking-wider">Event</th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-slate-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-mono text-slate-500 uppercase tracking-wider hidden lg:table-cell">Venue</th>
                  <th className="text-right px-5 py-3 text-xs font-mono text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event._id} className="border-b border-border/50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getCategoryIcon(event.category)}</span>
                        <div>
                          <p className="font-medium text-slate-800 max-w-[200px] truncate">{event.title}</p>
                          <p className="text-xs text-slate-500 font-mono">#{event._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className={`category-badge ${getCategoryColor(event.category)}`}>{event.category}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500 text-xs font-mono">
                      {formatDate(event.date)}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500 text-xs max-w-[150px] truncate">
                      {event.venue}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/events/${event._id}`}
                          className="text-xs text-slate-500 hover:text-slate-600 py-1 px-2 rounded hover:bg-slate-100 transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          to={`/admin/events/${event._id}/edit`}
                          className="text-xs text-primary-600 hover:text-primary-800 py-1 px-2 rounded hover:bg-slate-100 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(event._id, event.title)}
                          className="text-xs text-red-500 hover:text-red-600 py-1 px-2 rounded hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, icon, highlight }) {
  return (
    <div className={`glass-card rounded-xl p-5 ${highlight ? 'border-primary-300' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-display font-black text-slate-900">{value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}
