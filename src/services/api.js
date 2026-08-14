import axios from 'axios';

// Production-ready API service connecting to Express backend
let rawBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://therapy-appointment-summary-system.onrender.com/api');

// Auto-correct baseURL to ensure it always includes the /api suffix even if misconfigured in environment variables
if (rawBaseUrl && !rawBaseUrl.endsWith('/api') && !rawBaseUrl.endsWith('/api/')) {
  rawBaseUrl = rawBaseUrl.replace(/\/+$/, '') + '/api';
}

const BASE_URL = rawBaseUrl;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Axios request interceptor to log URLs for debugging environment routing
axiosInstance.interceptors.request.use(config => {
  const fullUrl = (config.baseURL || '') + config.url;
  console.log("BASE_URL:", config.baseURL);
  console.log("Request URL:", config.url);
  console.log("Full Resolved Request URL:", fullUrl);
  return config;
}, error => {
  return Promise.reject(error);
});

export const api = {
  // --- THERAPISTS ---
  getTherapists: async () => {
    const res = await axiosInstance.get('/therapists');
    return res.data.data.map(t => ({
      id: t.therapist_id,
      name: t.therapist_name,
      specialty: t.specialization,
      bio: t.description,
      avatar: t.profile_image,
      experienceYears: t.experience_years,
      location: t.location,
      availabilityStatus: t.availability_status
    }));
  },

  getTherapistById: async (id) => {
    const res = await axiosInstance.get(`/therapists/${id}`);
    const t = res.data.data;
    return {
      id: t.therapist_id,
      name: t.therapist_name,
      specialty: t.specialization,
      bio: t.description,
      avatar: t.profile_image,
      experienceYears: t.experience_years,
      location: t.location,
      availabilityStatus: t.availability_status
    };
  },

  addTherapist: async (therapistData) => {
    const res = await axiosInstance.post('/therapists', {
      therapist_name: therapistData.name,
      specialization: therapistData.specialty,
      description: therapistData.bio,
      profile_image: therapistData.avatar,
      experience_years: therapistData.experienceYears,
      location: therapistData.location,
      availability_status: therapistData.availabilityStatus
    });
    const t = res.data.data;
    return {
      id: t.therapist_id,
      name: t.therapist_name,
      specialty: t.specialization,
      bio: t.description,
      avatar: t.profile_image,
      experienceYears: t.experience_years,
      location: t.location,
      availabilityStatus: t.availability_status
    };
  },

  updateTherapist: async (id, updatedData) => {
    const res = await axiosInstance.put(`/therapists/${id}`, {
      therapist_name: updatedData.name,
      specialization: updatedData.specialty,
      description: updatedData.bio,
      profile_image: updatedData.avatar,
      experience_years: updatedData.experienceYears,
      location: updatedData.location,
      availability_status: updatedData.availabilityStatus
    });
    const t = res.data.data;
    return {
      id: t.therapist_id,
      name: t.therapist_name,
      specialty: t.specialization,
      bio: t.description,
      avatar: t.profile_image,
      experienceYears: t.experience_years,
      location: t.location,
      availabilityStatus: t.availability_status
    };
  },

  deleteTherapist: async (id) => {
    await axiosInstance.delete(`/therapists/${id}`);
    return { success: true };
  },

  // --- APPOINTMENTS ---
  getAppointments: async (therapistId) => {
    const res = await axiosInstance.get(`/appointments/therapist/${therapistId}`);
    return res.data.data.map(a => ({
      id: a.appointment_id,
      therapistId: a.therapist_id,
      title: a.appointment_title,
      summary: a.summary,
      date: a.appointment_date,
      time: a.appointment_time,
      status: a.status
    }));
  },

  addAppointment: async (therapistId, appointmentData) => {
    const res = await axiosInstance.post('/appointments', {
      therapist_id: therapistId,
      appointment_title: appointmentData.title,
      summary: appointmentData.summary,
      appointment_date: appointmentData.date,
      appointment_time: appointmentData.time,
      status: appointmentData.status
    });
    const a = res.data.data;
    return {
      id: a.appointment_id,
      therapistId: a.therapist_id,
      title: a.appointment_title,
      summary: a.summary,
      date: a.appointment_date,
      time: a.appointment_time,
      status: a.status
    };
  },

  updateAppointment: async (id, updatedData) => {
    const res = await axiosInstance.put(`/appointments/${id}`, {
      appointment_title: updatedData.title,
      summary: updatedData.summary,
      appointment_date: updatedData.date,
      appointment_time: updatedData.time,
      status: updatedData.status
    });
    const a = res.data.data;
    return {
      id: a.appointment_id,
      therapistId: a.therapist_id,
      title: a.appointment_title,
      summary: a.summary,
      date: a.appointment_date,
      time: a.appointment_time,
      status: a.status
    };
  },

  deleteAppointment: async (id) => {
    await axiosInstance.delete(`/appointments/${id}`);
    return { success: true };
  },

  // --- REAL-TIME INSIGHTS ---
  getInsights: async () => {
    const res = await axiosInstance.get('/insights');
    return res.data.data;
  },

  // --- RECENT ACTIVITIES ---
  getActivities: async () => {
    const res = await axiosInstance.get('/activities');
    return res.data.data;
  },

  // --- AI SUMMARY GENERATION ---
  generateSummary: async (therapistId) => {
    const res = await axiosInstance.post(`/generate-summary/${therapistId}`);
    return res.data;
  }
};
