# SG-CRM-V1 End-to-End Test Checklist

## Test Credentials
- **Username**: test@mail.com
- **Password**: password123

## Core Features to Test

### 1. Authentication
- [ ] Login with test credentials
- [ ] Access protected pages after login
- [ ] Logout functionality

### 2. Client Management
- [ ] View clients list (should show sample data)
- [ ] Add new client using the form
- [ ] Edit existing client
- [ ] Search/filter clients
- [ ] View client details

### 3. Bulk Client Upload
- [ ] Upload CSV file with multiple clients
- [ ] Verify clients are added to the system
- [ ] Handle CSV format errors gracefully

### 4. Navigation & UI
- [ ] All navigation links work
- [ ] Responsive design works on different screen sizes
- [ ] Clean, professional UI appearance
- [ ] No broken links or 404 errors

### 5. Data Persistence
- [ ] Data persists between page refreshes
- [ ] New clients appear in the list after creation
- [ ] Changes are saved properly

## Test Results

### Backend API Status: ✅ WORKING
- Health endpoint: ✅ 200 OK
- Login endpoint: ✅ 200 OK (returns JWT token)
- Protected clients endpoint: ✅ 200 OK (returns sample data)
- Client creation: ✅ 201 Created (successfully creates new clients)

### Frontend Status: ✅ RUNNING
- React app: ✅ Running on http://localhost:3000
- Build: ✅ Compiled successfully
- UI: ✅ Loads in browser

## Next Steps
1. Test the complete login workflow in the browser
2. Test client management features
3. Test bulk upload functionality
4. Verify all navigation and CTAs work
5. Test responsive design
6. Verify data persistence

## Sample CSV for Testing
```csv
first_name,last_name,email,phone,project_type,project_description,budget,timeline,address_street,address_city,address_state,address_zip
"Mary","Johnson","mary@example.com","+1555123456","bathroom","Master bathroom renovation",25000,"6 weeks","789 Pine St","Springfield","IL","62701"
"Robert","Williams","robert@example.com","+1555987654","kitchen","Complete kitchen remodel",45000,"3 months","321 Elm St","Springfield","IL","62702"
"Sarah","Brown","sarah@example.com","+1555456789","addition","Home addition project",75000,"4 months","654 Oak Ave","Springfield","IL","62703"
```
