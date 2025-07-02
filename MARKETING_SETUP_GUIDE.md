# 🚀 Marketing Administration Setup Guide

This guide will help you configure your SG-CRM marketing system to work with Facebook, Twitter/X, Instagram, LinkedIn, and YouTube.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Platform Setup Guides](#platform-setup-guides)
3. [Features Overview](#features-overview)
4. [API Integration](#api-integration)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Access Your Marketing Admin Panel

1. **Login to your CRM**: Navigate to `http://localhost:3000` (or your deployed URL)
2. **Go to Admin Settings**: Click on "Settings" in the sidebar under Admin section
3. **Navigate to Social Media Tab**: You'll see tabs for Social Media, Marketing Campaigns, and Analytics

### Basic Configuration Steps

1. **Enable Platforms**: Toggle on the platforms you want to use
2. **Add API Credentials**: Fill in the required fields for each platform
3. **Test Connection**: Save settings and verify connectivity
4. **Start Marketing**: Create campaigns and schedule posts

---

## 🔧 Platform Setup Guides

### 📘 Facebook Setup

#### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App" → Choose "Business" type
3. Fill in app details and create the app

#### Step 2: Get App Credentials
1. In your app dashboard, note down:
   - **App ID**: Found on the app dashboard
   - **App Secret**: Go to Settings → Basic

#### Step 3: Setup Facebook Login & Pages API
1. Add "Facebook Login" and "Pages API" products
2. Configure OAuth redirect URIs
3. Add required permissions: `pages_manage_posts`, `pages_read_engagement`

#### Step 4: Get Access Tokens
1. Use Facebook Graph API Explorer
2. Generate User Access Token with required permissions
3. Exchange for Long-lived Page Access Token

#### Step 5: Configure in CRM
```
App ID: [Your App ID]
App Secret: [Your App Secret]  
Access Token: [Long-lived Page Access Token]
Page ID: [Your Business Page ID]
```

---

### 🐦 Twitter/X Setup

#### Step 1: Create Twitter Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for a developer account
3. Create a new app project

#### Step 2: Get API Credentials
1. In your app dashboard, get:
   - **API Key**: From "Keys and tokens" tab
   - **API Secret**: From "Keys and tokens" tab

#### Step 3: Generate Access Tokens
1. In "Keys and tokens" tab, generate:
   - **Access Token**: For your account
   - **Access Token Secret**: For your account

#### Step 4: Configure in CRM
```
API Key: [Your API Key]
API Secret: [Your API Secret]
Access Token: [Your Access Token]
Access Token Secret: [Your Access Token Secret]
```

---

### 📷 Instagram Setup

#### Step 1: Instagram Business Account
1. Convert your Instagram account to a Business account
2. Connect it to a Facebook Page

#### Step 2: Use Facebook App
1. Use the same Facebook app created earlier
2. Add Instagram Basic Display API

#### Step 3: Get Instagram Credentials
1. **App ID**: Same as Facebook App ID
2. **App Secret**: Same as Facebook App Secret
3. **Access Token**: Generate Instagram User Access Token

#### Step 4: Configure in CRM
```
App ID: [Facebook App ID]
App Secret: [Facebook App Secret]
Access Token: [Instagram User Access Token]
```

---

### 💼 LinkedIn Setup

#### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developers](https://developer.linkedin.com/)
2. Create a new app
3. Associate with a LinkedIn Company Page

#### Step 2: Configure App Settings
1. Add "Share on LinkedIn" and "Marketing Developer Platform" products
2. Set up OAuth 2.0 redirect URLs

#### Step 3: Get Credentials
1. **Client ID**: From app settings
2. **Client Secret**: From app settings

#### Step 4: Generate Access Token
1. Use LinkedIn OAuth 2.0 flow
2. Get access token with required scopes: `w_member_social`, `r_organization_social`

#### Step 5: Configure in CRM
```
Client ID: [Your Client ID]
Client Secret: [Your Client Secret]
Access Token: [Your Access Token]
```

---

### 📺 YouTube Setup

#### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3

#### Step 2: Create Credentials
1. Create API Key for public data access
2. Create OAuth 2.0 Client ID for authenticated requests

#### Step 3: YouTube Channel
1. Get your Channel ID from YouTube Studio
2. Ensure you have upload permissions

#### Step 4: Configure in CRM
```
API Key: [Your YouTube API Key]
Client ID: [OAuth Client ID]
Client Secret: [OAuth Client Secret]
Channel ID: [Your YouTube Channel ID]
```

---

## 🎯 Features Overview

### 📊 Marketing Dashboard (`/marketing`)

**Key Features:**
- **Social Media Metrics**: Followers, engagement rates, reach
- **Recent Posts**: View and manage your latest social media posts
- **Quick Post**: Create and schedule posts across multiple platforms
- **Analytics Overview**: Performance metrics and insights

**Quick Actions:**
- Create instant posts across all connected platforms
- Schedule future posts
- View engagement metrics
- Monitor campaign performance

### ⚙️ Admin Settings (`/admin/settings`)

#### Social Media Tab
- **Platform Configuration**: Enable/disable each platform
- **API Credentials**: Secure storage of authentication tokens
- **Auto-posting**: Enable automatic posting of new content
- **Connection Status**: Real-time verification of platform connectivity

#### Marketing Campaigns Tab
- **Campaign Creation**: Set up targeted marketing campaigns
- **Budget Management**: Define and track campaign spending
- **Audience Targeting**: Configure target demographics
- **Performance Tracking**: Monitor campaign ROI and metrics

#### Analytics Tab
- **Cross-platform Analytics**: Unified view of all social media metrics
- **Custom Reports**: Generate performance reports
- **Trend Analysis**: Track growth and engagement over time
- **Export Data**: Download analytics for external reporting

---

## 🔌 API Integration

### Backend Endpoints

The marketing system provides comprehensive REST API endpoints:

```
POST /api/marketing/platforms/{platform}/configure
GET  /api/marketing/platforms
POST /api/marketing/posts
GET  /api/marketing/posts
GET  /api/marketing/analytics
POST /api/marketing/campaigns
GET  /api/marketing/campaigns
PUT  /api/marketing/campaigns/{campaign_id}
DELETE /api/marketing/campaigns/{campaign_id}
```

### Example API Usage

#### Configure a Platform
```javascript
import { marketingApi } from './services/api';

// Configure Facebook
const facebookConfig = {
  enabled: true,
  appId: 'your_app_id',
  appSecret: 'your_app_secret',
  accessToken: 'your_access_token',
  pageId: 'your_page_id',
  autoPost: true
};

await marketingApi.configurePlatform('facebook', facebookConfig);
```

#### Create a Social Media Post
```javascript
// Create and schedule a post
const post = await marketingApi.createPost(
  'Check out our latest granite installation! 🏠✨',
  ['facebook', 'instagram', 'twitter'],
  '2024-12-25T10:00:00Z' // Optional schedule time
);
```

#### Get Analytics
```javascript
// Get analytics for all platforms
const allAnalytics = await marketingApi.getAnalytics();

// Get analytics for specific platform
const facebookAnalytics = await marketingApi.getAnalytics('facebook', 30);
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. "Invalid Credentials" Error
- **Facebook**: Ensure App Secret is correct and access token hasn't expired
- **Twitter**: Check API keys and ensure app has proper permissions
- **Instagram**: Verify business account is connected to Facebook page
- **LinkedIn**: Confirm OAuth redirect URLs match your domain
- **YouTube**: Check API key restrictions and quota limits

#### 2. "Permission Denied" Error
- Verify all required permissions are granted during OAuth flow
- Check if tokens have expired and need refresh
- Ensure business accounts have proper posting permissions

#### 3. Posts Not Publishing
- Check platform-specific posting guidelines and limits
- Verify content meets platform requirements (character limits, media formats)
- Ensure scheduled time is in the future
- Check API rate limits

#### 4. Analytics Not Loading
- Verify platform connections are active
- Check if analytics permissions are granted
- Ensure business/professional accounts are being used

### Getting Help

1. **Check Platform Status**: Verify if social media platforms are experiencing outages
2. **Review API Documentation**: Each platform has specific requirements and limitations
3. **Test Connections**: Use the "Test Connection" feature in admin settings
4. **Check Logs**: Backend logs will show detailed error messages

---

## 🎉 Next Steps

1. **Configure Your First Platform**: Start with one platform to test the setup
2. **Create Test Posts**: Try creating and scheduling posts
3. **Monitor Analytics**: Review performance data and insights
4. **Scale Up**: Add more platforms and create marketing campaigns
5. **Automate**: Set up auto-posting and scheduled campaigns

---

## 📞 Support

For additional help with setup or troubleshooting:
- Check the platform-specific documentation links above
- Review error messages in the browser console
- Verify all credentials are entered correctly
- Test API endpoints directly if needed

Happy Marketing! 🚀
