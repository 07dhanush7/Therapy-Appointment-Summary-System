import { motion } from 'framer-motion';
import { FileText, Edit3, Trash2 } from 'lucide-react';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[parseInt(month, 10) - 1];
  return `${parseInt(day, 10)} ${monthName} ${year}`;
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const min = minStr;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${hour}:${min} ${ampm}`;
};

const statusColors = {
  Completed: { bg: 'rgba(16, 185, 129, 0.1)', color: 'rgb(5, 150, 105)' },
  Scheduled: { bg: 'rgba(59, 130, 246, 0.1)', color: 'rgb(37, 99, 235)' },
  Pending: { bg: 'rgba(245, 158, 11, 0.1)', color: 'rgb(217, 119, 6)' },
  Cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: 'rgb(220, 38, 38)' }
};

const AppointmentCard = ({ appointment, onEdit, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -3, borderColor: 'rgba(44, 62, 46, 0.15)' }}
      transition={{ duration: 0.18 }}
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255, 255, 255, 0.75)',
        border: '1px solid var(--glass-border)',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(92, 114, 96, 0.05)',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(92, 114, 96, 0.12)',
            flexShrink: 0
          }}>
            <FileText size={16} color="var(--accent-forest)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h4 style={{
                fontSize: '1.05rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
                margin: 0
              }}>
                {appointment.title}
              </h4>
              {appointment.status && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: statusColors[appointment.status]?.bg || 'rgba(92, 114, 96, 0.1)',
                  color: statusColors[appointment.status]?.color || 'var(--accent-forest)'
                }}>
                  {appointment.status}
                </span>
              )}
            </div>
            {(appointment.date || appointment.time) && (
              <span style={{
                fontSize: '0.8rem',
                color: 'var(--accent-sage)',
                fontWeight: 500
              }}>
                {appointment.date ? formatDate(appointment.date) : ''}
                {appointment.date && appointment.time ? ' | ' : ''}
                {appointment.time ? formatTime(appointment.time) : ''}
              </span>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onEdit(appointment)}
            className="btn btn-secondary"
            title="Edit Appointment"
            style={{
              padding: '6px',
              height: '32px',
              width: '32px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(44, 62, 46, 0.08)'
            }}
          >
            <Edit3 size={13} />
          </button>
          
          <button
            onClick={() => onDelete(appointment.id)}
            className="btn btn-danger"
            title="Delete Appointment"
            style={{
              padding: '6px',
              height: '32px',
              width: '32px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Summary Content */}
      <p style={{
        fontSize: '0.88rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        textAlign: 'left'
      }}>
        {appointment.summary}
      </p>
    </motion.div>
  );
};

export default AppointmentCard;
