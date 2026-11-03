import { useNavigate } from 'react-router-dom';
import { formatDate, formatCurrency, getCategoryColor, getCategoryIcon, getImageUrl, isUpcoming } from '../utils/helpers';

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const upcoming = isUpcoming(event.date);

  return (
    <div className="event-card" onClick={() => navigate(`/events/${event._id}`)}>
      {/* Poster Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
        {event.posterImage ? (
          <img
            src={getImageUrl(event.posterImage)}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-30">{getCategoryIcon(event.category)}</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`category-badge ${getCategoryColor(event.category)}`}>
            {getCategoryIcon(event.category)} {event.category}
          </span>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {upcoming ? (
            <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 font-mono">
              ● Upcoming
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-mono">
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg text-slate-900 leading-tight mb-1 line-clamp-2">
          {event.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{event.description}</p>

        <div className="space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-slate-600">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <span className={`text-sm font-semibold ${event.registrationFee === 0 ? 'text-green-600' : 'text-amber-600'}`}>
            {formatCurrency(event.registrationFee)}
          </span>
          <button className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors flex items-center gap-1">
            View Details
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
