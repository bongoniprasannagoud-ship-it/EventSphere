import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-sm">
              ES
            </div>
            <span className="font-display text-xl font-bold text-slate-800 hidden sm:block">
              Event<span className="text-primary-600">Sphere</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" active={isActive('/')}>Events</NavLink>
            {user && !isAdmin && (
              <NavLink to="/dashboard" active={isActive('/dashboard')}>My Dashboard</NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" active={isActive('/admin')}>Admin Panel</NavLink>
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">{user.name}</p>
                  <p className="text-xs text-primary-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-slate-400 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 py-3 px-4 space-y-1 bg-white animate-fade-in">
          <MobileNavLink to="/" onClick={() => setMenuOpen(false)}>🏠 Events</MobileNavLink>
          {user && !isAdmin && (
            <MobileNavLink to="/dashboard" onClick={() => setMenuOpen(false)}>📋 My Dashboard</MobileNavLink>
          )}
          {isAdmin && (
            <MobileNavLink to="/admin" onClick={() => setMenuOpen(false)}>⚙️ Admin Panel</MobileNavLink>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 px-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm"
            >
              🚪 Logout ({user.name})
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm py-2 px-4 flex-1 justify-center">Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="btn-primary text-sm py-2 px-4 flex-1 justify-center">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

const NavLink = ({ to, active, children }) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-primary-50 text-primary-600'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, onClick, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block py-2 px-3 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
  >
    {children}
  </Link>
);