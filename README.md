# SIWE Authentication Project

A comprehensive authentication system that leverages Sign-In With Ethereum (SIWE) protocol for Web3 authentication, combining the security of wallet-based authentication with modern token-based session management.

## Project Overview

This project demonstrates a complete authentication flow using:

- **NestJS backend** with JWT token authentication
- **React frontend** with Ethereum wallet integration
- **Automatic token refresh** mechanism for seamless user experience
- **HTTP-only cookies** for secure refresh token storage

## Project Structure

- `/siwe-auth-backend`: NestJS server implementing the authentication API
- `/siwe-auth-frontend`: React application with wallet connection and authentication UI

### Authentication

- Sign in with Ethereum wallet (Metamask)
- JWT-based authentication with short-lived access tokens (30 minutes)
- Secure HTTP-only cookies for refresh tokens
- Automatic background token refresh mechanism
- Single-use refresh tokens for enhanced security

### Security Features

- SameSite cookie protection
- CORS configuration for secure cross-origin requests
- Separated token storage (access token in localStorage, refresh token in HTTP-only cookies)
- Protected API endpoints using JWT Guards

### User Experience

- Seamless authentication without requiring manual token refresh
- Clean error handling and user feedback
- Test authentication endpoint for verification

## Authentication Flow

1. **Initial Connection**: User connects their Ethereum wallet
2. **Nonce Generation**: Backend generates a unique nonce
3. **Message Signing**: User signs a SIWE message containing the nonce with their wallet
4. **Verification**: Backend verifies the signature and issues tokens
5. **Session Management**: Frontend stores access token and uses automatic refresh
6. **Protected Resources**: Access protected resources using the access token

## Getting Started

### Backend Setup

```bash
cd siwe-auth-backend
npm install
npm run start:dev
```

The server will be available at `http://localhost:3000`.

### Frontend Setup

```bash
cd siwe-auth-frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## API Endpoints

### Authentication Endpoints

- `POST /auth/nonce` - Generate a nonce for SIWE message signing
- `POST /auth/siwe` - Verify SIWE message and issue tokens
- `POST /auth/refresh` - Refresh access token using refresh token
- `POST /auth/logout` - Invalidate refresh token and log out
- `GET /auth/test-auth` - Protected endpoint for testing authentication

## Technologies Used

- **Backend**: NestJS, JWT, SIWE library, Express
- **Frontend**: React, wagmi, viem, TypeScript
- **Authentication**: Sign-In With Ethereum (SIWE)

## Security Considerations

- In production, enable `secure: true` for cookies when using HTTPS
- Consider adjusting token expiration times based on security requirements
- Implement rate limiting for authentication endpoints

## License

MIT
