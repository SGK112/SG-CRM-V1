import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Contractors from './pages/Contractors';
import Calendar from './pages/Calendar';
import Services from './pages/Services';
import Vendors from './pages/Vendors';
import Estimates from './pages/Estimates';
import Contracts from './pages/Contracts';
import Payments from './pages/Payments';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return children;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clients" 
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contractors" 
            element={
              <ProtectedRoute>
                <Contractors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/services" 
            element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vendors" 
            element={
              <ProtectedRoute>
                <Vendors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/estimates" 
            element={
              <ProtectedRoute>
                <Estimates />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contracts" 
            element={
              <ProtectedRoute>
                <Contracts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payments" 
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AppLayout>
    </AuthProvider>
  );
}

export default App;
