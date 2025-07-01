# JWT (JSON Web Token) Explained

## What is JWT?
JWT is a secure method for transmitting information between your frontend and backend. Think of it as a **digital ID card** for your users.

## How It Works in Your CRM:

### 1. **User Login Process:**
```
1. User enters username/password
2. Backend verifies credentials
3. Backend creates a JWT token (like a temporary ID card)
4. Frontend stores this token
5. Every request to backend includes this token
6. Backend verifies token is valid before allowing access
```

### 2. **Token Structure:**
A JWT has 3 parts separated by dots:
```
header.payload.signature
```

**Example JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImpvmgiYuimwC6-_tM4kLs8
```

### 3. **What's Inside Your JWT:**
```json
{
  "user_id": 1,
  "username": "josh",
  "role": "admin",
  "company": "Surprise Granite",
  "exp": 1625097600  // Expiration time
}
```

## Why JWT for Your CRM?

✅ **Security**: Can't be faked or modified
✅ **Stateless**: No need to store sessions on server
✅ **Mobile Friendly**: Works great with mobile apps
✅ **Scalable**: Easy to add multiple servers later
✅ **Expiration**: Tokens automatically expire for security

## Your .env JWT Settings:
```bash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d  # Token expires in 7 days
```

## Security Best Practices:
1. **Use a strong JWT_SECRET** (change the placeholder!)
2. **Set reasonable expiration times** (7 days is good)
3. **Use HTTPS in production** (protects token in transit)
4. **Don't store sensitive data in JWT** (just user ID, role, etc.)

## For Your Business:
- When you log into the CRM, JWT keeps you logged in
- When your team accesses customer data, JWT verifies they're authorized
- When the mobile app is built, JWT will authenticate contractors in the field
- JWT replaces the need for complex session management

**Bottom Line:** JWT is what keeps your CRM secure and lets multiple users access it safely!
