import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const MASCOT_IMAGE = "/assets/pets/poncik-bear.jpg";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { exchangeSession } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (sessionIdMatch) {
        const sessionId = sessionIdMatch[1];
        try {
          const user = await exchangeSession(sessionId);
          // Clear the hash and navigate
          window.history.replaceState(null, '', window.location.pathname);
          navigate('/dashboard', { state: { user }, replace: true });
        } catch (error) {
          console.error('Auth callback error:', error);
          navigate('/', { replace: true });
        }
      } else {
        navigate('/', { replace: true });
      }
    };

    processAuth();
  }, [exchangeSession, navigate]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.img
          src={MASCOT_IMAGE}
          alt="Poncik"
          className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-xl font-semibold text-[var(--text-main)]"
          style={{ fontFamily: "'Fredoka', sans-serif" }}
        >
          Giriş yapılıyor...
        </motion.div>
      </motion.div>
    </div>
  );
}
