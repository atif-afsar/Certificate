import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import CertificatePage from './pages/CertificatePage';
import SuccessPage from './pages/SuccessPage';
import VerifyPage from './pages/VerifyPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-purple-200 selection:text-brand-purple-900">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              {/* Root redirect to certificate landing */}
              <Route path="/" element={<Navigate to="/certificate" replace />} />
              
              {/* Participant Flows */}
              <Route path="/certificate" element={<CertificatePage />} />
              <Route path="/success" element={<SuccessPage />} />
              
              {/* Verification Flows */}
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/verify/:certificateId" element={<VerifyPage />} />
              
              {/* Admin Flows */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/certificate" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
