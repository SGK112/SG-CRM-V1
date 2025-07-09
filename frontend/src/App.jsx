import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, useMediaQuery, Typography, ThemeProvider } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import mobileFirstTheme, { mobileStyles } from './theme/mobileFirstTheme';
import './mobile-first.css';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import MobileNavigation from './components/MobileNavigation';
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
        background: `linear-gradient(135deg, ${mobileFirstTheme.palette.primary.main} 0%, ${mobileFirstTheme.palette.secondary.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...mobileStyles.mobileContainer
      }}>
        {children}
      </Box>
    );
  }

  if (isMobile) {
    return (
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default'
      }}>
        <MobileNavigation />
        <Box component="main" sx={{ 
          flexGrow: 1,
          pt: 7, // Space for fixed mobile header
          pb: 8, // Space for bottom navigation
          px: 2,
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 120px)',
          // Safe area insets for mobile devices
          paddingTop: 'calc(56px + env(safe-area-inset-top))',
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
          paddingLeft: 'calc(1rem + env(safe-area-inset-left))',
          paddingRight: 'calc(1rem + env(safe-area-inset-right))'
        }}>
          {children}
        </Box>
      </Box>
    );
  }

  // Desktop layout
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: 'background.default'
    }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: 3,
          mt: 8,
          maxWidth: '100%',
          overflow: 'auto',
          backgroundColor: 'background.default'
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
        background: `linear-gradient(135deg, ${mobileFirstTheme.palette.primary.main} 0%, ${mobileFirstTheme.palette.secondary.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...mobileStyles.mobileContainer
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
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: mobileFirstTheme.palette.primary.main,
            color: mobileFirstTheme.palette.primary.contrastText,
            marginTop: '60px', // Account for mobile header
          },
        }}
      />
    </AppLayout>
  );
}

export default App;
