import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clipboard, Check, Sparkles, User, Calendar, FileText } from 'lucide-react';

const SummaryCard = ({ summaryData }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `
THERAPIST SUMMARY
-----------------------------
Therapist: ${summaryData.therapistName}
Generated Date: ${summaryData.generatedAt}

Summary:
${summaryData.summary}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="glass-panel"
      style={{
        padding: '36px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(44, 62, 46, 0.15)',
        boxShadow: '0 12px 40px rgba(44, 62, 46, 0.05)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(247, 244, 237, 0.9) 100%)',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: '850px',
        margin: '0 auto',
        textAlign: 'left'
      }}
    >
      {/* Background soft sage orb glow */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(92, 114, 96, 0.04) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        borderBottom: '1px solid rgba(44, 62, 46, 0.08)',
        paddingBottom: '20px',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--accent-forest)',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(44, 62, 46, 0.1)'
          }}>
            <Sparkles size={18} color="#ffffff" strokeWidth={2} />
          </div>
          <div>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 600,
              fontFamily: 'var(--font-heading)',
              color: 'var(--accent-forest)'
            }}>
              Therapist Summary
            </h3>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="btn btn-secondary"
          style={{
            fontSize: '0.8rem',
            padding: '8px 14px',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(44, 62, 46, 0.08)'
          }}
        >
          {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Clipboard size={14} color="var(--accent-forest)" />}
          <span style={{ color: copied ? 'var(--accent-emerald)' : 'inherit' }}>
            {copied ? 'Copied!' : 'Copy Summary'}
          </span>
        </button>
      </div>

      {/* Metadata */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 1,
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} color="var(--accent-sage)" />
          <span><strong>Therapist:</strong> {summaryData.therapistName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="var(--accent-sage)" />
          <span><strong>Generated Date:</strong> {summaryData.generatedAt}</span>
        </div>
      </div>

      {/* Summary Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(44, 62, 46, 0.05)',
          padding: '24px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <h4 style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--accent-forest)',
            letterSpacing: '0.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '4px'
          }}>
            <FileText size={14} color="var(--accent-forest)" />
            AI Generated Summary
          </h4>
          <p style={{
            fontSize: '1rem',
            lineHeight: '1.7',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-line'
          }}>
            {summaryData.summary}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryCard;
