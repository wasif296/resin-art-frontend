import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import React from 'react';

// 1. In do imports ko bilkul dhyan se check karein
import LoginPage from '../auth/loginpage'; 
import Dashboard from '../dashboard/Dashboard'; // YE WALI LINE MISSING THI
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Login Page ka rasta */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Dashboard ka rasta (Protected) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />  {/* Ab yahan error nahi aayega */}
            </ProtectedRoute>
          } 
        />

        {/* Default route login par bhej dega */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;