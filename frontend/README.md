# CRM & Estimating Frontend

React-based frontend for the CRM and Estimating application.

## Features

- **Modern React**: Built with React 18 and functional components
- **Material-UI**: Professional, responsive design
- **Authentication**: Secure login and registration
- **Vendor Management**: Comprehensive vendor database
- **Estimates & Contracts**: Create and manage business documents
- **Payment Processing**: Stripe integration for secure payments
- **File Upload**: Drag-and-drop file uploads with preview
- **Real-time Updates**: Live data synchronization

## Technology Stack

- React 18
- Material-UI (MUI)
- React Router for navigation
- React Query for data fetching
- React Hook Form for form management
- Stripe Elements for payments
- Axios for API calls

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   # Create .env file
   REACT_APP_API_URL=http://localhost:8000/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   ```

3. Start development server:
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (not recommended)

## Project Structure

```
src/
├── App.jsx              # Main application component
├── index.js             # Application entry point
├── contexts/            # React contexts
│   └── AuthContext.js   # Authentication context
├── components/          # Reusable components
│   └── Layout/          # Layout components
│       ├── Navbar.jsx   # Top navigation
│       └── Sidebar.jsx  # Side navigation
├── pages/               # Page components
│   ├── Login.jsx        # Login/register page
│   ├── Dashboard.jsx    # Dashboard overview
│   ├── Vendors.jsx      # Vendor management
│   ├── Estimates.jsx    # Estimate management
│   ├── Contracts.jsx    # Contract management
│   └── Payments.jsx     # Payment processing
└── services/            # API services
    └── api.js           # Axios configuration
```

## Key Features

### Authentication
- JWT-based authentication
- Login and registration forms
- Protected routes
- User session management

### Vendor Management
- Add, edit, and delete vendors
- Search and filter functionality
- Contact information management
- Document uploads

### Estimates
- Create professional estimates
- Line item management
- PDF generation
- Email sending
- Status tracking

### Contracts
- Convert estimates to contracts
- Electronic signatures
- Payment tracking
- PDF generation

### Payments
- Stripe integration
- Secure payment processing
- Payment history
- Revenue tracking

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API URL |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

## Build and Deployment

1. Build for production:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to your hosting service:
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Any static hosting service

3. Configure environment variables on your hosting platform

## Development Guidelines

- Use functional components with hooks
- Follow Material-UI design patterns
- Use React Query for server state
- Implement proper error handling
- Add loading states for better UX
- Use TypeScript for better type safety (future enhancement)

## Testing

Run tests with:
```bash
npm test
```

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Submit pull requests for review
