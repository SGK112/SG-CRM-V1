import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    company: {
      name: 'Surprise Granite',
      logo: 'https://cdn.prod.website-files.com/6456ce4476abb25581fbad0c/64a70d4b30e87feb388f004f_surprise-granite-profile-logo.svg',
      address: '',
      phone: '',
      email: '',
      website: 'https://www.surprisegranite.com',
    },
    integrations: {
      quickbooks: {
        connected: false,
        clientId: '',
        clientSecret: '',
        accessToken: '',
        companyId: '',
      },
      stripe: {
        connected: false,
        publishableKey: '',
        secretKey: '',
        webhookSecret: '',
      },
      googleCalendar: {
        connected: false,
        clientId: '',
        clientSecret: '',
        calendarId: '',
      },
      sendgrid: {
        connected: false,
        apiKey: '',
        fromEmail: '',
      },
      twilio: {
        connected: false,
        accountSid: '',
        authToken: '',
        phoneNumber: '',
      },
    },
    features: {
      estimateApproval: true,
      automaticInvoicing: true,
      materialTracking: true,
      laborTracking: true,
      photoUpload: true,
      gpsTracking: false,
      mobileApp: true,
    },
    permissions: {
      admin: ['all'],
      manager: ['estimates', 'contracts', 'clients', 'reports'],
      employee: ['estimates', 'clients'],
      contractor: ['jobs', 'materials', 'progress'],
    },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(prevSettings => ({
        ...prevSettings,
        ...response.data,
      }));
    } catch (error) {
      console.log('Settings not found, using defaults');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updatedSettings = {
        ...settings,
        ...newSettings,
      };
      
      await api.put('/settings', updatedSettings);
      setSettings(updatedSettings);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to update settings' 
      };
    }
  };

  const updateIntegration = async (integration, config) => {
    try {
      const updatedSettings = {
        ...settings,
        integrations: {
          ...settings.integrations,
          [integration]: {
            ...settings.integrations[integration],
            ...config,
          },
        },
      };

      await api.put('/settings', updatedSettings);
      setSettings(updatedSettings);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to update integration' 
      };
    }
  };

  const testIntegration = async (integration) => {
    try {
      const response = await api.post(`/integrations/${integration}/test`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Integration test failed' 
      };
    }
  };

  const value = {
    settings,
    loading,
    updateSettings,
    updateIntegration,
    testIntegration,
    loadSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
