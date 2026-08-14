import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, BrainCircuit, AlertCircle, FileText, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import AppointmentCard from '../components/AppointmentCard';
import SummaryCard from '../components/SummaryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const TherapistDetails = () => {
  const { id } = useParams();
  const summaryRef = useRef(null);
  const { showToast } = useToast();

  // Core details states
  const [therapist, setTherapist] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);

  // Search & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // AI summary states
  const [summaryData, setSummaryData] = useState(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  // Custom Delete Confirm Modal State
  const [deleteApptId, setDeleteApptId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState('Scheduled');

  useEffect(() => {
    fetchTherapistAndAppointments();
  }, [id]);

  const fetchTherapistAndAppointments = async () => {
    setLoadingDetails(true);
    try {
      const therapistData = await api.getTherapistById(id);
      const apptsData = await api.getAppointments(id);
      setTherapist(therapistData);
      setAppointments(apptsData);
    } catch (err) {
      console.error('Error fetching therapist details:', err);
      showToast('Network Error', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingAppointment(null);
    setTitle('');
    setSummary('');
    setDate('');
    setTime('');
    setStatus('Scheduled');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (appt) => {
    setEditingAppointment(appt);
    setTitle(appt.title);
    setSummary(appt.summary);
    setDate(appt.date || '');
    setTime(appt.time || '');
    setStatus(appt.status || 'Scheduled');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !summary || !date || !time) {
      showToast('Validation Failed', 'error');
      return;
    }

    try {
      const payload = { title, summary, date, time, status };
      if (editingAppointment) {
        await api.updateAppointment(editingAppointment.id, payload);
        showToast('Appointment Updated Successfully', 'success');
      } else {
        await api.addAppointment(id, payload);
        showToast('Appointment Added Successfully', 'success');
      }
      setIsModalOpen(false);
      
      // If we modified appointments, invalidate the current cached summary
      setSummaryData(null);
      
      // Refresh list
      const apptsData = await api.getAppointments(id);
      setAppointments(apptsData);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error saving appointment:', err);
      if (err.response && err.response.status === 400) {
        showToast('Validation Failed', 'error');
      } else if (err.response) {
        showToast('Server Error', 'error');
      } else {
        showToast('Network Error', 'error');
      }
    }
  };

  // Re-routes delete trigger to our custom modal
  const handleDeleteTrigger = (apptId) => {
    setDeleteApptId(apptId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteApptId) return;
    try {
      await api.deleteAppointment(deleteApptId);
      showToast('Appointment Deleted Successfully', 'success');
      setDeleteApptId(null);
      setSummaryData(null); // invalidate summary cache
      const apptsData = await api.getAppointments(id);
      setAppointments(apptsData);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error deleting appointment:', err);
      if (err.response) {
        showToast('Server Error', 'error');
      } else {
        showToast('Network Error', 'error');
      }
    }
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    setSummaryError(null);
    setSummaryData(null);

    // Scroll to the loading area smoothly
    setTimeout(() => {
      summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
      const data = await api.generateSummary(id);
      setSummaryData({
        summary: data.summary,
        therapistName: therapist.name,
        generatedAt: new Date().toLocaleString()
      });
    } catch (err) {
      setSummaryError(err.message || 'Failed to generate AI summary.');
      showToast('Server Error', 'error');
    } finally {
      setGeneratingSummary(false);
      
      // Adjust scroll to fit the newly rendered block
      setTimeout(() => {
        summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  };

  if (loadingDetails) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'var(--text-secondary)',
        gap: '16px'
      }}>
        <LoadingSpinner />
        <p>Loading profile details...</p>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', zIndex: 2 }}>
        <h2 style={{ color: 'var(--accent-rose)' }}>Therapist Profile Not Found</h2>
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '20px' }}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  // Filter & Pagination logic for appointments
  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '24px',
        position: 'relative',
        zIndex: 2,
        paddingBottom: '100px'
      }}
    >
      {/* Back Button */}
      <Link
        to="/"
        className="btn btn-secondary"
        style={{
          alignSelf: 'start',
          marginBottom: '32px',
          padding: '8px 16px',
          fontSize: '0.85rem',
          gap: '6px'
        }}
      >
        <ArrowLeft size={16} color="var(--accent-forest)" />
        <span>Back to Therapists</span>
      </Link>

      {/* Therapist Profile Header Section */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          padding: '32px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '40px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(247, 244, 237, 0.75) 100%)',
          border: '1px solid rgba(44, 62, 46, 0.08)',
          alignItems: 'center'
        }}
      >
        <img
          src={therapist.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
          alt={therapist.name}
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            objectFit: 'cover',
            border: '3px solid rgba(44, 62, 46, 0.15)',
            boxShadow: '0 0 20px rgba(44, 62, 46, 0.05)'
          }}
        />

        <div style={{ flex: '1', minWidth: '250px', textAlign: 'left' }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 500,
            marginBottom: '6px',
            color: 'var(--text-primary)'
          }}>
            {therapist.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.82rem',
              color: 'var(--accent-forest)',
              fontWeight: 600,
              padding: '4px 12px',
              background: 'rgba(92, 114, 96, 0.06)',
              border: '1px solid rgba(92, 114, 96, 0.15)',
              borderRadius: 'var(--radius-full)'
            }}>
              {therapist.specialty}
            </span>
            <span style={{
              display: 'inline-block',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              padding: '4px 10px',
              background: 'rgba(92, 114, 96, 0.04)',
              border: '1px solid rgba(92, 114, 96, 0.1)',
              borderRadius: 'var(--radius-sm)'
            }}>
              💼 {therapist.experienceYears} Years Exp
            </span>
          </div>
          <p style={{
            fontSize: '0.92rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            {therapist.bio}
          </p>
        </div>
      </div>

      {/* Appointments List Section */}
      <div style={{ marginBottom: '48px', textAlign: 'left' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 500,
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)'
            }}>
              Logged Appointments
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {filteredAppointments.length} record(s) found
            </span>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="btn btn-secondary"
            style={{
              padding: '10px 16px',
              fontSize: '0.85rem',
              gap: '6px',
              border: '1px solid rgba(44, 62, 46, 0.08)'
            }}
          >
            <Plus size={16} color="var(--accent-forest)" />
            <span>Add Appointment</span>
          </button>
        </div>

        {/* Appointment Search input */}
        {appointments.length > 0 && (
          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--accent-forest)', fontWeight: 600 }}>Search Appointments</label>
            <input
              type="text"
              placeholder="Search Appointment..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input"
              style={{ width: '100%' }}
            />
          </div>
        )}

        {appointments.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '40px',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <FileText size={32} color="var(--text-secondary)" />
            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>No appointments logged</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: '1.4' }}>
              Create an appointment record containing session details to begin using summary aggregation.
            </p>
            <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ marginTop: '8px', color: '#ffffff' }}>
              <Plus size={16} color="#ffffff" />
              <span>Log First Appointment</span>
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '30px',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.5)'
            }}
          >
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No matching appointments found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnimatePresence mode="popLayout">
              {paginatedAppointments.map((appt) => (
                <motion.div
                  key={appt.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <AppointmentCard
                    appointment={appt}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteTrigger}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '16px',
                padding: '10px'
              }}>
                <button
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage(activePage - 1)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    style={{
                      background: pg === activePage ? 'var(--accent-forest)' : 'rgba(255, 255, 255, 0.7)',
                      border: pg === activePage ? '1px solid var(--accent-forest)' : '1px solid rgba(44, 62, 46, 0.1)',
                      color: pg === activePage ? '#ffffff' : 'var(--text-primary)',
                      cursor: 'pointer',
                      padding: '6px 12px',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: pg === activePage ? 600 : 400,
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage(activePage + 1)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generate AI Summary Button Panel */}
      {appointments.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          borderTop: '1px solid rgba(44, 62, 46, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            fontWeight: 500
          }}>
            Analyze Caseload Records
          </h3>
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            maxWidth: '520px',
            marginBottom: '8px',
            lineHeight: '1.5'
          }}>
            Generate a secure, synthesized clinical "Summary of Summaries" condensing all recorded session details for this therapist.
          </p>

          <button
            disabled={generatingSummary}
            onClick={handleGenerateSummary}
            className="btn btn-primary"
            style={{
              padding: '14px 28px',
              fontSize: '0.95rem',
              fontWeight: 500,
              borderRadius: 'var(--radius-sm)',
              background: generatingSummary ? 'var(--text-muted)' : 'var(--accent-forest)',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              cursor: generatingSummary ? 'not-allowed' : 'pointer'
            }}
          >
            <BrainCircuit size={18} color="#ffffff" />
            <span>{generatingSummary ? 'Generating...' : 'Generate Summary'}</span>
          </button>
        </div>
      )}

      {/* Page 3: Summary View Section / Anchor */}
      <div ref={summaryRef} style={{ width: '100%', scrollMarginTop: '120px' }}>
        <AnimatePresence mode="wait">
          {/* Loading State */}
          {generatingSummary && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-md)',
                padding: '40px 24px',
                marginTop: '32px'
              }}
            >
              <LoadingSpinner />
            </motion.div>
          )}

          {/* Error State */}
          {summaryError && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-md)',
                padding: '32px',
                marginTop: '32px',
                textAlign: 'center',
                border: '1px solid rgba(214, 77, 98, 0.18)',
                background: 'rgba(214, 77, 98, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <AlertCircle size={40} color="var(--accent-rose)" />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>Summary Generation Failed</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
                {summaryError}
              </p>
              <button
                onClick={handleGenerateSummary}
                className="btn btn-secondary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  gap: '8px'
                }}
              >
                <RefreshCw size={14} />
                <span>Retry Generation</span>
              </button>
            </motion.div>
          )}

          {/* Summary Display Card */}
          {summaryData && !generatingSummary && !summaryError && (
            <motion.div key="summary" style={{ marginTop: '32px' }}>
              {summaryData.summary ? (
                <SummaryCard summaryData={summaryData} />
              ) : (
                <div className="glass-panel" style={{
                  padding: '36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(44, 62, 46, 0.15)',
                  boxShadow: '0 12px 40px rgba(44, 62, 46, 0.05)',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(247, 244, 237, 0.9) 100%)',
                  maxWidth: '850px',
                  margin: '0 auto',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--accent-forest)',
                    marginBottom: '16px'
                  }}>
                    Generated Summary
                  </h3>
                  <p style={{
                    fontSize: '1.02rem',
                    color: 'var(--text-primary)',
                    fontWeight: 400
                  }}>
                    {summaryData.message || 'AI integration pending'}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add / Edit Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAppointment ? "Edit Session Details" : "Record Session Details"}
      >
        <form className="modern-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Appointment Title <span className="required">*</span></label>
              <input
                type="text"
                placeholder="e.g. Cognitive Distortions Analysis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Appointment Date <span className="required">*</span></label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Appointment Time <span className="required">*</span></label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Status <span className="required">*</span></label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-select"
                required
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Appointment Summary <span className="required">*</span></label>
              <textarea
                placeholder="Provide a comprehensive summary of the topics discussed, clinical findings, and actions agreed upon..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="form-textarea"
                rows={6}
                required
              />
            </div>
          </div>

          <div className="form-footer">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary-modern">
              Cancel
            </button>
            <button type="submit" className="btn-primary-modern">
              {editingAppointment ? "Save Changes" : "Log Appointment"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <Modal
        isOpen={deleteApptId !== null}
        onClose={() => setDeleteApptId(null)}
        title="Confirm Deletion"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
            <ShieldAlert size={28} color="var(--accent-rose)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                Are you absolutely sure?
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                This action is permanent and will delete the selected appointment details in the database.
              </p>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid rgba(44, 62, 46, 0.08)',
            paddingTop: '16px',
            marginTop: '8px'
          }}>
            <button onClick={() => setDeleteApptId(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleConfirmDelete} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={16} />
              <span>Confirm Delete</span>
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default TherapistDetails;
