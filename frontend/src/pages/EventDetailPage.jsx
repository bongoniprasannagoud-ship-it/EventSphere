import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';
import { PageLoader } from '../components/Loaders';
import { formatDate, formatTime, formatCurrency, getCategoryColor, getCategoryIcon, getImageUrl, isUpcoming } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    eventsAPI.getOne(id)
      .then(({ data }) => {
        setEvent(data.event);
        if (user) {
          setRegistered(data.event.registrations?.includes(user.id));
        }
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate, user]);

  const upcoming = event ? isUpcoming(event.date) : false;

  const handleRegister = async () => {
    if (registered) {
      window.open(event.googleFormLink, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!upcoming) return;
    if (!user) {
      toast.error('Please login to register for events');
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      const { data } = await eventsAPI.register(id);
      setRegistered(true);
      toast.success('Registered successfully! Opening Google Form...');
      window.open(data.googleFormLink, '_blank', 'noopener,noreferrer');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      if (msg.includes('already registered')) {
        setRegistered(true);
        toast('Already registered! Opening form...', { icon: 'ℹ️' });
        window.open(event.googleFormLink, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(msg);
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventsAPI.delete(id);
      toast.success('Event deleted');
      navigate('/admin');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  if (loading) return <PageLoader />;
  if (!event) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-600 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left - Poster + Countdown */}
        <div className="lg:col-span-2 space-y-4">
          {/* Poster */}
          <div className="glass-card rounded-2xl overflow-hidden aspect-[3/4]">
            {event.posterImage ? (
              <img
                src={getImageUrl(event.posterImage)}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary-50 to-primary-100">
                <span className="text-7xl">{getCategoryIcon(event.category)}</span>
                <p className="text-slate-500 text-sm">No poster uploaded</p>
              </div>
            )}
          </div>

          {/* Countdown */}
          {upcoming && (
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs text-slate-500 font-mono text-center mb-3 uppercase tracking-wider">
                ⏱ Event starts in
              </p>
              <CountdownTimer date={event.date} />
            </div>
          )}
        </div>

        {/* Right - Details */}
        <div className="lg:col-span-3 space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`category-badge ${getCategoryColor(event.category)}`}>
                {getCategoryIcon(event.category)} {event.category}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-mono ${
                upcoming
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {upcoming ? '● Upcoming' : 'Completed'}
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 mb-3 leading-tight">
              {event.title}
            </h1>
            <p className="text-slate-500 leading-relaxed">{event.description}</p>
          </div>

          {/* Details grid */}
          <div className="glass-card rounded-xl p-4 grid grid-cols-2 gap-4">
            <DetailItem icon="📅" label="Date" value={formatDate(event.date)} />
            <DetailItem icon="⏰" label="Time" value={formatTime(event.date)} />
            <DetailItem icon="📍" label="Venue" value={event.venue} />
            <DetailItem
              icon="💰"
              label="Fee"
              value={formatCurrency(event.registrationFee)}
              valueClass={event.registrationFee === 0 ? 'text-green-600' : 'text-amber-600'}
            />
          </div>

          {/* Created by */}
          {event.createdBy && (
            <p className="text-xs text-slate-400 font-mono">
              Organized by <span className="text-slate-500">{event.createdBy.name}</span>
            </p>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {/* Register button */}
            {!isAdmin && (
              <button
                onClick={handleRegister}
                disabled={registering || (!registered && !upcoming)}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all ${
                  registered
                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                    : upcoming
                    ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:-translate-y-0.5'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {registering ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering...
                  </span>
                ) : registered ? (
                  '✓ Registered — Open Google Form'
                ) : upcoming ? (
                  '📝 Register Now'
                ) : (
                  'Registration Closed'
                )}
              </button>
            )}

            {/* Direct form link */}
            {registered && (
              <a
                href={event.googleFormLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-sm text-primary-600 hover:text-primary-800 transition-colors"
              >
                Open Google Form directly ↗
              </a>
            )}

            {/* Admin actions */}
            {isAdmin && (
              <div className="flex gap-3">
                <Link
                  to={`/admin/events/${event._id}/edit`}
                  className="btn-secondary flex-1 justify-center"
                >
                  ✏️ Edit Event
                </Link>
                <button onClick={handleDelete} className="btn-danger flex-1 justify-center">
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value, valueClass = 'text-slate-700' }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{icon} {label}</p>
      <p className={`text-sm font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}
