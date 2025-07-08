import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, useMediaQuery, Typography, ThemeProvider } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import mobileFirstTheme, { mobileStyles, mobileBreakpoints } from './theme/mobileFirstTheme';
import './mobile-first.css';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Login from './pages/Login';
import EnhancedDashboard from './pages/EnhancedDashboard';
import SimpleClients from './pages/SimpleClients';
import Contractors from './pages/Contractors';
import Calendar from './pages/Calendar';
import Services from './pages/Services';
import Vendors from './pages/Vendors';
import Estimates from './pages/Estimates/EstimateBuilder';
import Contracts from './pages/Contracts';
import Payments from './pages/Payments';
import MarketingDashboard from './pages/MarketingDashboard';
import EnhancedSettings from './pages/Admin/EnhancedSettings';
import Inbox from './pages/Inbox';
import Forms from './pages/Forms';
import LeadCaptureForm from './components/LeadCaptureForm';
import CRMCopilot from './components/CRMCopilot';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const isMobile = useMediaQuery(mobileFirstTheme.breakpoints.down('md'));

  if (!isAuthenticated) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4A90E2 0%, #B89778 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...mobileStyles.mobileContainer
      }}>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: '#F5F5F5'
    }}>
      {!isMobile && <Sidebar />}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: { xs: 1, sm: 2, md: 3 }, 
          mt: { xs: 7, sm: 8 },
          mb: { xs: 10, md: 0 }, // Add bottom margin for mobile navigation
          maxWidth: '100%',
          overflow: 'auto',
          backgroundColor: '#f8fafc',
          minHeight: `calc(100vh - ${isMobile ? 150 : 64}px)`, // Account for mobile bottom nav
          // Safe area padding for mobile devices
          paddingTop: { xs: 'calc(1rem + env(safe-area-inset-top))', sm: '1rem' },
          paddingBottom: { xs: 'calc(1rem + env(safe-area-inset-bottom))', sm: '1rem' },
          paddingLeft: { xs: 'calc(1rem + env(safe-area-inset-left))', sm: '1rem' },
          paddingRight: { xs: 'calc(1rem + env(safe-area-inset-right))', sm: '1rem' }
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />;
};

function App() {
  return (
    <ThemeProvider theme={mobileFirstTheme}>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AuthenticatedApp() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h6" color="white">Loading...</Typography>
      </Box>
    );
  }

  return (
    <AppLayout>
      <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <EnhancedDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute>
                  <SimpleClients />
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
            <Route 
              path="/marketing" 
              element={
                <ProtectedRoute>
                  <MarketingDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inbox" 
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/forms" 
              element={
                <ProtectedRoute>
                  <Forms />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute>
                  <EnhancedSettings />
                </ProtectedRoute>
              } 
            />
            {/* Redirect old estimate builder route */}
            <Route path="/estimate-builder" element={<Navigate to="/estimates" replace />} />
            <Route path="/instant-fix" element={<Navigate to="/dashboard" replace />} />
            <Route path="/instant-fix/*" element={<Navigate to="/dashboard" replace />} />
            <Route path="/admin/feedback" element={<Navigate to="/admin/settings" replace />} />
            <Route path="/admin/bug-reports" element={<Navigate to="/admin/settings" replace />} />
            <Route path="/files" element={<Navigate to="/services" replace />} />
            <Route path="/" element={<RootRedirect />} />        </Routes>
      <CRMCopilot />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </AppLayout>
  );
}

export default App;
