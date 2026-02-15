import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Home, ShoppingBag, Heart, Users, User } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'nav_dashboard' },
  { path: '/shop', icon: ShoppingBag, label: 'nav_shop' },
  { path: '/pets', icon: Heart, label: 'nav_pets' },
  { path: '/community', icon: Users, label: 'nav_community' },
  { path: '/profile', icon: User, label: 'nav_profile' },
];

export const BottomNav = () => {
  const { t } = useLanguage();

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface)] border-t border-[var(--border)] px-2 py-2 md:py-3"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-lg mx-auto flex justify-around items-center">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-colors ${
                isActive
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`
            }
            data-testid={`nav-${item.path.slice(1)}`}
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                </motion.div>
                <span className="text-xs font-medium hidden sm:block">{t(item.label)}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
};
