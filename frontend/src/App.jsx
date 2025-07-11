import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, useMediaQuery, Typography, ThemeProvider } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import mobileFirstTheme from './theme/mobileFirstTheme';
import './mobile-first.css';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import MobileNavigation from './components/MobileNavigation';
import Login from './pages/Login';
import EnhancedDashboard from './pages/EnhancedDashboard';
import SimpleClients from './pages/SimpleClients';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
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
import AIAssistant from './components/AIAssistantSimple';
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
        // Safe area support
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
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
        height: '100vh',
        backgroundColor: 'background.default'
      }}>
        <MobileNavigation />
        <Box 
          component="main" 
          sx={{ 
            flex: 1,
            marginTop: '56px', // Header height
            marginBottom: '64px', // Bottom nav height
            padding: 2,
            overflow: 'auto',
            backgroundColor: 'background.default',
          }}
        >
          {children}
        </Box>
      </Box>
    );
  }

  // Desktop layout
  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      backgroundColor: 'background.default'
    }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box 
          component="main" 
          sx={{ 
            flex: 1,
            marginTop: '64px', // Navbar height
            padding: { xs: 2, sm: 3, md: 4 },
            overflow: 'auto',
            backgroundColor: 'background.default',
          }}
        >
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        // Safe area support
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: `conic-gradient(${mobileFirstTheme.palette.secondary.main}, transparent, ${mobileFirstTheme.palette.secondary.main})`,
            animation: 'spin 1s linear infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: mobileFirstTheme.palette.primary.main,
            }}
          />
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            color: mobileFirstTheme.palette.primary.contrastText,
            fontWeight: 600,
            letterSpacing: '0.05em'
          }}
        >
          Loading SG CRM...
        </Typography>
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
                  <Clients />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clients/:id" 
              element={
                <ProtectedRoute>
                  <ClientDetail />
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
            <Route path="/" element={<RootRedirect />} />
        </Routes>
      <AIAssistant />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: mobileFirstTheme.palette.background.paper,
            color: mobileFirstTheme.palette.text.primary,
            border: `1px solid ${mobileFirstTheme.palette.divider}`,
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontWeight: 500,
            boxShadow: `0 8px 32px ${mobileFirstTheme.palette.primary.main}20`,
            backdropFilter: 'blur(8px)',
            marginTop: '80px', // Account for mobile header and safe area
            padding: '12px 16px',
            maxWidth: '90vw',
          },
          success: {
            style: {
              background: `linear-gradient(135deg, ${mobileFirstTheme.palette.primary.main}10 0%, ${mobileFirstTheme.palette.secondary.main}10 100%)`,
              border: `1px solid ${mobileFirstTheme.palette.secondary.main}40`,
              color: mobileFirstTheme.palette.text.primary,
            },
            iconTheme: {
              primary: mobileFirstTheme.palette.secondary.main,
              secondary: mobileFirstTheme.palette.secondary.contrastText,
            },
          },
          error: {
            style: {
              background: `linear-gradient(135deg, #f4433610 0%, #ff000010 100%)`,
              border: `1px solid #f4433640`,
              color: mobileFirstTheme.palette.text.primary,
            },
            iconTheme: {
              primary: '#f44336',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </AppLayout>
  );
}

export default App;
