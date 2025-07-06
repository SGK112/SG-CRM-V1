import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { marketingApi } from '../services/api';

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
      // Social Media Integrations
      social_facebook: {
        connected: false,
        enabled: false,
        appId: '',
        appSecret: '',
        accessToken: '',
        pageId: '',
        autoPost: false,
      },
      social_twitter: {
        connected: false,
        enabled: false,
        apiKey: '',
        apiSecret: '',
        accessToken: '',
        accessTokenSecret: '',
        autoPost: false,
      },
      social_instagram: {
        connected: false,
        enabled: false,
        appId: '',
        appSecret: '',
        accessToken: '',
        autoPost: false,
      },
      social_linkedin: {
        connected: false,
        enabled: false,
        clientId: '',
        clientSecret: '',
        accessToken: '',
        autoPost: false,
      },
      social_youtube: {
        connected: false,
        enabled: false,
        apiKey: '',
        clientId: '',
        clientSecret: '',
        channelId: '',
        autoPost: false,
      },
    },
    marketing: {
      campaigns: [],
      scheduledPosts: [],
      analytics: {
        googleAnalytics: {
          connected: false,
          trackingId: '',
        },
        facebookPixel: {
          connected: false,
          pixelId: '',
        },
      },
      seo: {
        googleSearchConsole: {
          connected: false,
          siteUrl: '',
        },
        keywords: [],
        metaTags: {
          title: '',
          description: '',
          keywords: '',
        },
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
      // Try to get authenticated settings first
      const response = await api.get('/settings');
      setSettings(prevSettings => ({
        ...prevSettings,
        ...response.data,
      }));
    } catch (error) {
      try {
        // Fallback to public settings if not authenticated
        const response = await api.get('/settings/public');
        setSettings(prevSettings => ({
          ...prevSettings,
          ...response.data,
        }));
      } catch (publicError) {
        console.log('Settings not found, using defaults');
      }
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

  // Marketing-specific methods
  const updateSocialMediaPlatform = async (platform, config) => {
    try {
      const response = await marketingApi.configurePlatform(platform, config);
      
      // Update local settings
      const updatedSettings = {
        ...settings,
        socialMedia: {
          ...settings.socialMedia,
          [platform]: {
            ...settings.socialMedia[platform],
            ...config,
          },
        },
      };
      
      setSettings(updatedSettings);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to update platform' 
      };
    }
  };

  const createMarketingPost = async (content, platforms, scheduleTime = null) => {
    try {
      const response = await marketingApi.createPost(content, platforms, scheduleTime);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to create post' 
      };
    }
  };

  const getMarketingAnalytics = async (platform = null, days = 30) => {
    try {
      const response = await marketingApi.getAnalytics(platform, days);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get analytics' 
      };
    }
  };

  const createMarketingCampaign = async (campaignData) => {
    try {
      const response = await marketingApi.createCampaign(campaignData);
      
      // Update local campaigns
      const updatedSettings = {
        ...settings,
        marketing: {
          ...settings.marketing,
          campaigns: [...settings.marketing.campaigns, response.data],
        },
      };
      
      setSettings(updatedSettings);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to create campaign' 
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
    // Marketing methods
    updateSocialMediaPlatform,
    createMarketingPost,
    getMarketingAnalytics,
    createMarketingCampaign,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
