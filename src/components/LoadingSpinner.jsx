import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, FileText, Sparkles } from 'lucide-react';
import Logo from './Logo';

const LoadingSpinner = ({ mode = 'summary' }) => {
  const [progress, setProgress] = useState(0);

  // Simulated progress bar logic for the AI summary generation
  useEffect(() => {
    if (mode !== 'summary') return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        
        // Dynamic speed simulation (reaches 50% / Stage 2 in ~1.0s, then crawls)
        let increment = 1.0;
        if (prev < 50) {
          increment = 4.0 + Math.random() * 2.0; // ~5% per 100ms -> 50% in 1.0s
        } else if (prev < 80) {
          increment = 1.5 + Math.random() * 1.5; // ~2.25% per 100ms
        } else if (prev < 95) {
          increment = 0.3 + Math.random() * 0.4;
        } else {
          increment = 0.05 + Math.random() * 0.1;
        }
        
        return Math.min(prev + increment, 98);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [mode]);

  // Render minimal details mode
  if (mode === 'details') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '70px',
        height: '70px'
      }}>
        {/* Pulsing Outer Ring */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid var(--accent-sage)',
            opacity: 0.5
          }}
        />
        
        {/* Rotating Progress Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: '6px',
            borderRadius: '50%',
            border: '2px dashed var(--accent-forest)',
            borderTopColor: 'transparent'
          }}
        />

        {/* Central Logo */}
        <div style={{
          position: 'absolute',
          inset: '12px',
          background: '#ffffff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--glass-shadow)'
        }}>
          <Logo size={24} />
        </div>
      </div>
    );
  }

  // Render multi-stage AI summary loader
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      gap: '24px',
      textAlign: 'center',
      width: '100%',
      minHeight: '260px',
      position: 'relative'
    }}>
      <AnimatePresence mode="wait">
        {progress < 50 ? (
          /* STAGE 1: Preparing Clinical Insights */
          <motion.div
            key="preparing-insights"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              width: '100%'
            }}
          >
            {/* Animated medical/AI icon with circular progress */}
            <div style={{ position: 'relative', width: '84px', height: '84px' }}>
              {/* Rotating outer dash ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '2px dashed var(--accent-sage)',
                  opacity: 0.6
                }}
              />
              
              {/* Pulsing inner ring */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.4, 0.15] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: '6px',
                  borderRadius: '50%',
                  background: 'rgba(77, 107, 87, 0.08)',
                  border: '1px solid rgba(77, 107, 87, 0.15)'
                }}
              />

              {/* Central AI/Medical Icon */}
              <div style={{
                position: 'absolute',
                inset: '12px',
                background: '#ffffff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--glass-shadow)'
              }}>
                <motion.div
                  animate={{ scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <BrainCircuit size={32} color="var(--accent-forest)" />
                </motion.div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '340px' }}>
              <h4 style={{
                fontSize: '1.2rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                color: 'var(--accent-forest)'
              }}>
                Preparing Clinical Insights
              </h4>
              <p style={{
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                fontWeight: 400
              }}>
                Reviewing appointment information...
              </p>
            </div>
          </motion.div>
        ) : (
          /* STAGE 2: Generating Session Summary */
          <motion.div
            key="generating-summary"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              width: '100%'
            }}
          >
            {/* Scanning document icon */}
            <div style={{ position: 'relative', width: '84px', height: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Outer soft solid ring */}
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '1px solid rgba(77, 107, 87, 0.08)',
                background: 'rgba(77, 107, 87, 0.03)'
              }} />

              {/* Document Icon Container */}
              <div style={{
                position: 'absolute',
                inset: '12px',
                background: '#ffffff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--glass-shadow)',
                overflow: 'hidden'
              }}>
                <FileText size={30} color="var(--accent-forest)" style={{ opacity: 0.9 }} />
                
                {/* Sparkle badge */}
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    <Sparkles size={10} color="var(--accent-gold)" fill="var(--accent-gold)" />
                  </motion.div>
                </div>

                {/* Laser Scanning Line */}
                <motion.div
                  animate={{
                    top: ['20%', '80%', '20%']
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  style={{
                    position: 'absolute',
                    left: '15%',
                    right: '15%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, var(--accent-sage), transparent)',
                    boxShadow: '0 0 6px var(--accent-sage), 0 0 2px var(--accent-sage)',
                    zIndex: 2
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '340px' }}>
              <h4 style={{
                fontSize: '1.2rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                color: 'var(--accent-forest)'
              }}>
                Generating Session Summary
              </h4>
              <p style={{
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                fontWeight: 400
              }}>
                Organizing key observations and outcomes...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern, elegant horizontal progress bar */}
      <div style={{
        width: '100%',
        maxWidth: '240px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        marginTop: '8px'
      }}>
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(35, 65, 47, 0.08)',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-sage) 0%, var(--accent-forest) 100%)',
              borderRadius: '2px'
            }}
          />
        </div>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 500
        }}>
          {Math.round(progress)}% Completed
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
