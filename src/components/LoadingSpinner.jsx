import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const MESSAGES = [
  "Gathering TheraSync appointment logs...",
  "Analyzing psychological themes...",
  "Synthesizing cognitive behavioral progress...",
  "Consolidating emotional regulation markers...",
  "Formulating clinical summary of summaries...",
  "Polishing AI-generated clinical insights..."
];

const LoadingSpinner = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      gap: '24px',
      textAlign: 'center',
      width: '100%'
    }}>
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        {/* Pulsing ring 1 */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid var(--accent-sage)',
            filter: 'drop-shadow(0 0 8px var(--accent-sage))'
          }}
        />

        {/* Pulsing ring 2 */}
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '50%',
            border: '2px dashed var(--accent-forest)',
            filter: 'drop-shadow(0 0 10px var(--accent-forest))'
          }}
        />

        {/* Central logo icon */}
        <div style={{
          position: 'absolute',
          inset: '10px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(5px)',
          borderRadius: '50%',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'flex', alignItems: 'center', justify: 'center' }}
          >
            <Logo size={32} />
          </motion.div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px' }}>
        <h4 style={{
          fontSize: '1.1rem',
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          background: 'linear-gradient(90deg, var(--accent-forest), var(--accent-sage))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Synthesizing AI Summary
        </h4>
        
        {/* Animated text message */}
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            minHeight: '20px'
          }}
        >
          {MESSAGES[messageIndex]}
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
