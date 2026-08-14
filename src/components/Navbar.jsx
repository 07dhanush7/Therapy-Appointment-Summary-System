import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const Navbar = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="glass-panel"
      style={{
        position: 'sticky',
        top: '20px',
        left: '20px',
        right: '20px',
        margin: '20px auto',
        maxWidth: '1200px',
        width: 'calc(100% - 40px)',
        zIndex: 100,
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-md)',
        backdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(44, 62, 46, 0.05)',
          border: '1px solid var(--glass-border)'
        }}>
          <Logo size={32} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '1.25rem',
            letterSpacing: '-0.5px',
            color: 'var(--accent-forest)'
          }}>
            TheraSync
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--accent-clay)', fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            Therapy Appointment Summary Platform
          </span>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link to="/" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
          Therapists
        </Link>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'rgba(92, 114, 96, 0.08)',
          border: '1px solid rgba(92, 114, 96, 0.18)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--accent-sage)'
        }}>
          <Sparkles size={12} color="var(--accent-sage)" />
          <span>AI Active</span>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
