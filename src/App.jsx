import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ThreeBackground from './components/ThreeBackground';
import Therapists from './pages/Therapists';
import TherapistDetails from './pages/TherapistDetails';

function App() {
  return (
    <Router>
      {/* 3D background visible across all pages */}
      <ThreeBackground />

      {/* Navigation header */}
      <Navbar />

      {/* Main page content area */}
      <main style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Routes>
          {/* Page 1: Therapists */}
          <Route path="/" element={<Therapists />} />

          {/* Page 2 & Page 3: Therapist Details & Summary View */}
          <Route path="/therapist/:id" element={<TherapistDetails />} />

          {/* Fallback routing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
