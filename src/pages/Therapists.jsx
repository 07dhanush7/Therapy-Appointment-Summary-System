import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserPlus, AlertCircle, ShieldAlert, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import TherapistCard from '../components/TherapistCard';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const Therapists = () => {
  const fileInputRef = useRef(null);
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
  const [imagePreview, setImagePreview] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB = 5 * 1024 * 1024 bytes)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds the 5MB limit.', 'error');
      e.target.value = ''; // Reset input
      return;
    }

    // Validate type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Invalid file format. Please upload PNG, JPG, JPEG, or WEBP.', 'error');
      e.target.value = ''; // Reset input
      return;
    }

    setAvatar(file);

    // Create a local object URL to display preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

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
    setImagePreview('');
    setExperienceYears(5);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (therapist) => {
    setEditingTherapist(therapist);
    setName(therapist.name);
    setSpecialty(therapist.specialty);
    setBio(therapist.bio);
    setAvatar(therapist.avatar || '');
    setImagePreview(therapist.avatar || '');
    setExperienceYears(therapist.experienceYears || 5);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !specialty) {
      showToast('Validation Failed: Name and specialty are required', 'error');
      return;
    }

    if (!editingTherapist && !avatar) {
      showToast('Validation Failed: Profile Image is required', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name,
        specialty,
        bio,
        avatar, // Can be File object or existing string URL
        experienceYears: parseInt(experienceYears)
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
    } catch (error) {
      console.error(error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.message || 'Profile Creation Failed';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
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
          TheraSync
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
          Manage Therapists, Track Appointments, and Generate Clinical Summaries in One Place.
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
        <form className="modern-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Therapist Name</label>
              <input
                type="text"
                placeholder="e.g. Dr. Evelyn Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Specialty / Focus</label>
              <input
                type="text"
                placeholder="e.g. Cognitive Behavioral Therapy (CBT)"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 10"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Profile Image {!editingTherapist && <span className="required">*</span>}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
                {imagePreview && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300';
                      }}
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid var(--accent-sage)',
                        boxShadow: '0 2px 8px rgba(35, 65, 47, 0.1)'
                      }}
                    />
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setAvatar('');
                        setImagePreview('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        background: 'var(--accent-rose)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        opacity: isSubmitting ? 0.6 : 1
                      }}
                      title="Remove Image"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".png,.jpg,.jpeg,.webp"
                    disabled={isSubmitting}
                    onChange={handleFileChange}
                    className="form-input"
                    style={{ padding: '8px 12px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    required={!editingTherapist && !imagePreview}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Supported formats: PNG, JPG, JPEG, WEBP. Max size: 5MB.
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Short Biography</label>
              <textarea
                placeholder="Provide a brief clinical background..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="form-textarea"
                rows={4}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="form-footer">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="btn-secondary-modern"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary-modern"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : (editingTherapist ? "Save Changes" : "Create Profile")}
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
