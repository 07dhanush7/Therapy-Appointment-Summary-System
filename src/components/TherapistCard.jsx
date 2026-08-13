import { motion } from 'framer-motion';
import { Eye, Edit3, Trash2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TherapistCard = ({ therapist, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(44, 62, 46, 0.08)' }}
      transition={{ duration: 0.2 }}
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '24px',
        borderRadius: 'var(--radius-md)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--glass-border)',
        background: 'var(--bg-secondary)'
      }}
    >
      {/* Background soft sage orb glow */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '120px',
        height: '120px',
        background: 'radial-gradient(circle, rgba(92, 114, 96, 0.06) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header with Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <img
            src={therapist.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
            alt={therapist.name}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(44, 62, 46, 0.12)',
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: 500,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {therapist.name}
          </h3>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--accent-sage)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Shield size={12} />
            {therapist.specialty}
          </p>
        </div>
      </div>

      {/* Bio / Description */}
      <p style={{
        fontSize: '0.88rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        marginBottom: '16px',
        flexGrow: 1,
        textAlign: 'left'
      }}>
        {therapist.bio}
      </p>

      {/* Meta Info */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '20px',
        fontSize: '0.82rem',
        color: 'var(--text-secondary)'
      }}>
        <span style={{
          background: 'rgba(92, 114, 96, 0.05)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(92, 114, 96, 0.1)'
        }}>
          💼 {therapist.experienceYears} Years Exp
        </span>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginTop: 'auto',
        borderTop: '1px solid rgba(44, 62, 46, 0.06)',
        paddingTop: '16px'
      }}>
        <button
          onClick={() => navigate(`/therapist/${therapist.id}`)}
          className="btn btn-primary"
          style={{
            flex: 1,
            padding: '10px 16px',
            fontSize: '0.85rem',
            height: '40px',
            color: '#ffffff',
            gap: '6px'
          }}
        >
          <Eye size={16} color="#ffffff" />
          <span>View Appointments</span>
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onEdit(therapist)}
            className="btn btn-secondary btn-icon-only"
            title="Edit Therapist"
            style={{
              width: '40px',
              height: '40px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Edit3 size={15} />
          </button>
          
          <button
            onClick={() => onDelete(therapist.id)}
            className="btn btn-danger btn-icon-only"
            title="Delete Therapist"
            style={{
              width: '40px',
              height: '40px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TherapistCard;
