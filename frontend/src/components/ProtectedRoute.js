import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, authChecked } = useAuth();
  const location = useLocation();

  // If user data was passed from AuthCallback, skip loading
  if (location.state?.user) {
    return children;
  }

  // Show loading only while actually checking auth
  if (loading && !authChecked) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            ☕
          </motion.div>
          <p className="text-[var(--text-muted)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            Yükleniyor...
          </p>
        </motion.div>
      </div>
    );
  }

  // Auth check complete but not authenticated
  if (authChecked && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Still loading after auth check started
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div className="text-6xl" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          ☕
        </motion.div>
      </div>
    );
  }

  return children;
};
