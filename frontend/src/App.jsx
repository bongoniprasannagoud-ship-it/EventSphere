import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventFormPage from './pages/EventFormPage';

function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center">
      <div>
        <div className="text-7xl mb-4">🌌</div>
        <h1 className="font-display text-4xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-slate-500 mb-6">This page doesn't exist in our universe</p>
        <Link to="/" className="btn-primary">← Go Home</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="noise min-h-screen">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/create"
                element={
                  <ProtectedRoute adminOnly>
                    <EventFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/events/:id/edit"
                element={
                  <ProtectedRoute adminOnly>
                    <EventFormPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
  duration: 3500,
  style: {
    background: '#ffffff',
    color: '#1e293b',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontFamily: 'DM Sans, sans-serif',
    fontSize: '14px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  },
  success: {
    iconTheme: { primary: '#6366f1', secondary: '#ffffff' },
  },
  error: {
    iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
  },
}}
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
