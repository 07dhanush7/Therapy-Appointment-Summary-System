import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserPlus, AlertCircle, ShieldAlert, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import TherapistCard from '../components/TherapistCard';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const Therapists = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Search, filter & pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);



  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState(null);

  // Custom Delete Modal State
  const [deleteId, setDeleteId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [location, setLocation] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('Available Today');

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const data = await api.getTherapists();
      setTherapists(data);
    } catch (err) {
      console.error('Error fetching therapists:', err);
      showToast('Network Error', 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleOpenAddModal = () => {
    setEditingTherapist(null);
    setName('');
    setSpecialty('');
    setBio('');
    setAvatar('');
    setExperienceYears(5);
    setLocation('');
    setAvailabilityStatus('Available Today');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (therapist) => {
    setEditingTherapist(therapist);
    setName(therapist.name);
    setSpecialty(therapist.specialty);
    setBio(therapist.bio);
    setAvatar(therapist.avatar || '');
    setExperienceYears(therapist.experienceYears || 5);
    setLocation(therapist.location || '');
    setAvailabilityStatus(therapist.availabilityStatus || 'Available Today');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !specialty) {
      showToast('Validation Failed', 'error');
      return;
    }

    try {
      const avatarUrl = avatar.trim() || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
      const payload = {
        name,
        specialty,
        bio,
        avatar: avatarUrl,
        experienceYears: parseInt(experienceYears),
        location,
        availabilityStatus
      };
      if (editingTherapist) {
        await api.updateTherapist(editingTherapist.id, payload);
        showToast('Therapist Updated Successfully', 'success');
      } else {
        await api.addTherapist(payload);
        showToast('Therapist Added Successfully', 'success');
      }
      setIsModalOpen(false);
      fetchTherapists();
    } catch (err) {
      console.error('Error saving therapist:', err);
      if (err.response && err.response.status === 400) {
        showToast('Validation Failed', 'error');
      } else if (err.response) {
        showToast('Server Error', 'error');
      } else {
        showToast('Network Error', 'error');
      }
    }
  };

  // Re-routes delete trigger to our custom confirmation modal
  const handleDeleteTrigger = (id) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteTherapist(deleteId);
      showToast('Therapist Deleted Successfully', 'success');
      setDeleteId(null);
      fetchTherapists();
    } catch (err) {
      console.error('Error deleting therapist:', err);
      if (err.response) {
        showToast('Server Error', 'error');
      } else {
        showToast('Network Error', 'error');
      }
    }
  };

  // Search & filter logic
  const filteredTherapists = therapists.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedSpecialty === 'All' ||
                          t.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  // Pagination logic
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredTherapists.length / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedTherapists = filteredTherapists.slice(startIndex, startIndex + itemsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        position: 'relative',
        zIndex: 2
      }}
    >
      {/* Page Title Header */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        margin: '40px 0 40px'
      }}>
        <motion.h1
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          style={{
            fontSize: '3rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 500,
            background: 'linear-gradient(135deg, var(--accent-forest) 30%, var(--accent-sage) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1px',
            marginBottom: '12px'
          }}
        >
          Therapists
        </motion.h1>
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            lineHeight: '1.6'
          }}
        >
          Manage therapist profiles and log clinical appointments.
        </motion.p>
      </div>

      {/* Controls Bar (Add Button) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '32px'
      }}>
        {/* Add Therapist Button */}
        <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ padding: '12px 24px', color: '#ffffff' }}>
          <UserPlus size={18} color="#ffffff" />
          <span>Add Therapist</span>
        </button>
      </div>

      {/* Search & Filter Panel */}
      <div className="glass-panel" style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '32px',
        background: 'rgba(255, 255, 255, 0.45)',
        textAlign: 'left'
      }}>
        {/* Search */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--accent-forest)', fontWeight: 600 }}>Search Directory</label>
          <input
            type="text"
            placeholder="Search Therapist..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="glass-input"
            style={{ width: '100%' }}
          />
        </div>

        {/* Filter Badges */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, marginRight: '8px' }}>
            Filter by:
          </span>
          {['All', 'CBT', 'Trauma Recovery', 'Family Therapy', 'Mindfulness', 'Child Therapy'].map((spec) => (
            <button
              key={spec}
              onClick={() => {
                setSelectedSpecialty(spec);
                setCurrentPage(1);
              }}
              style={{
                background: selectedSpecialty === spec ? 'var(--accent-forest)' : 'rgba(92, 114, 96, 0.05)',
                border: selectedSpecialty === spec ? '1px solid var(--accent-forest)' : '1px solid rgba(92, 114, 96, 0.12)',
                color: selectedSpecialty === spec ? '#ffffff' : 'var(--accent-forest)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Therapist Cards List */}
      <div style={{ width: '100%' }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="glass-panel"
                style={{
                  height: '280px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255, 255, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse-glow 2s infinite ease-in-out'
                }}
              >
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading card profiles...</div>
              </div>
            ))}
          </div>
        ) : filteredTherapists.length === 0 ? (
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel"
            style={{
              padding: '48px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <AlertCircle size={40} color="var(--accent-sage)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 550, fontFamily: 'var(--font-heading)' }}>No therapists found</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              There are no matching therapists in the system. Check your search query or add a therapist.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              layout
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              <AnimatePresence mode="popLayout">
                {paginatedTherapists.map((therapist) => (
                  <motion.div
                    key={therapist.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TherapistCard
                      therapist={therapist}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDeleteTrigger}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '36px',
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
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTherapist ? "Edit Therapist Profile" : "Create Therapist Profile"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--accent-forest)', fontWeight: 600 }}>Therapist Name</label>
            <input
              type="text"
              placeholder="e.g. Dr. Evelyn Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--accent-forest)', fontWeight: 600 }}>Specialty / Focus</label>
            <input
              type="text"
              placeholder="e.g. Cognitive Behavioral Therapy (CBT)"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="glass-input"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--accent-forest)', fontWeight: 600 }}>Short Biography (Optional)</label>
            <textarea
              placeholder="Provide a brief clinical background..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="glass-input"
              rows={4}
              style={{ resize: 'none', fontFamily: 'var(--font-sans)', lineHeight: '1.4' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--accent-forest)', fontWeight: 600 }}>Profile Image URL (Optional)</label>
            <input
              type="url"
              placeholder="e.g. https://images.unsplash.com/photo-..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="glass-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', flex: '1 1 120px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--accent-forest)', fontWeight: 600 }}>Years of Experience</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 10"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="glass-input"
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--accent-forest)', fontWeight: 600 }}>Location (City)</label>
              <input
                type="text"
                placeholder="e.g. Bangalore"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="glass-input"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--accent-forest)', fontWeight: 600 }}>Availability Status</label>
            <select
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value)}
              className="glass-input"
              required
            >
              <option value="Available Today">Available Today</option>
              <option value="Available Tomorrow">Available Tomorrow</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid rgba(44, 62, 46, 0.08)',
            paddingTop: '20px',
            marginTop: '8px'
          }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ color: '#ffffff' }}>
              {editingTherapist ? "Save Changes" : "Create Profile"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
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
                This action is permanent and will cascade-delete the therapist's profile along with all associated session appointments in the database.
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
            <button onClick={() => setDeleteId(null)} className="btn btn-secondary">
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

export default Therapists;
