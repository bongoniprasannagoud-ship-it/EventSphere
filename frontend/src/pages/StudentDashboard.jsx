import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/Loaders';
import { formatDate, getCategoryColor, getCategoryIcon, isUpcoming } from '../utils/helpers';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.getMe()
      .then(({ data }) => setUserData(data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const registeredEvents = userData?.registeredEvents || [];
  const upcomingEvents = registeredEvents.filter(e => isUpcoming(e.date));
  const pastEvents = registeredEvents.filter(e => !isUpcoming(e.date));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-2xl font-display font-bold text-white">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">My Dashboard</h1>
            <p className="text-slate-500 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Registered" value={registeredEvents.length} icon="📋" />
          <StatCard label="Upcoming" value={upcomingEvents.length} icon="🗓️" highlight />
          <StatCard label="Attended" value={pastEvents.length} icon="✅" />
        </div>
      </div>

      {/* Upcoming Events */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span>🗓️</span> Upcoming Events
        </h2>
        {upcomingEvents.length === 0 ? (
          <EmptyState message="No upcoming events" hint="Browse events and register to see them here" link="/" linkText="Browse Events" />
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map(event => <EventRow key={event._id} event={event} upcoming />)}
          </div>
        )}
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold text-slate-500 mb-4 flex items-center gap-2">
            <span>📁</span> Past Events
          </h2>
          <div className="space-y-3">
            {pastEvents.map(event => <EventRow key={event._id} event={event} />)}
          </div>
        </section>
      )}

      {registeredEvents.length === 0 && (
        <EmptyState
          message="You haven't registered for any events yet"
          hint="Discover amazing campus events and start registering"
          link="/"
          linkText="Explore Events →"
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, highlight }) {
  return (
    <div className={`glass-card rounded-xl p-4 text-center ${highlight ? 'border-primary-300' : ''}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className={`font-display text-2xl font-bold ${highlight ? 'text-primary-600' : 'text-slate-900'}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function EventRow({ event, upcoming }) {
  return (
    <Link
      to={`/events/${event._id}`}
      className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-primary-300 transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl flex-shrink-0">
        {getCategoryIcon(event.category)}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
          {event.title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">{formatDate(event.date)}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`category-badge ${getCategoryColor(event.category)} text-xs`}>
          {event.category}
        </span>
        {upcoming && (
          <span className="text-xs text-green-600 font-mono">● Live</span>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ message, hint, link, linkText }) {
  return (
    <div className="glass-card rounded-2xl p-10 text-center">
      <div className="text-5xl mb-4">📭</div>
      <h3 className="font-display font-semibold text-slate-600 mb-2">{message}</h3>
      <p className="text-slate-500 text-sm mb-4">{hint}</p>
      <Link to={link} className="btn-primary text-sm">{linkText}</Link>
    </div>
  );
}
