# Overview

Club Rank is a comprehensive club management and competition platform built with React, TypeScript, and Express.js. Originally Match Point (a tennis partner matching app), it has been transformed into a complete club management MVP that serves tennis clubs with advanced features for competition management, member coordination, and analytics.

The platform provides club identity customization, automated bracket generation, member management, inter-club competitions, and detailed analytics. It features a mobile-first design using Tailwind CSS and shadcn/ui components, delivering a native-like experience for club administrators and members.

**MVP Transformation Complete (4 Phases):**
- **Phase 1**: Service rebranding to "Club Rank" with shield emblem logo and navigation restructure (내 클럽/개인 매칭/랭킹/커뮤니티/내 정보)
- **Phase 2**: Database expansion with club management schemas and gameFormat support for 5 match types
- **Phase 3**: Core club features including identity customization, management dashboard, automated bracket generation, and analytics
- **Phase 4**: Personal records enhancement and location-based matching optimization

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context for auth state, TanStack React Query for server state
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful API with `/api` prefix
- **Storage Interface**: Abstracted storage layer with in-memory implementation
- **Development**: Hot module replacement via Vite middleware

## Authentication & User Management
- **Primary Auth**: Firebase Authentication with Google OAuth
- **User Profiles**: Custom user data stored in Firestore
- **Session Management**: Firebase handles auth state persistence
- **Profile Setup**: Multi-step onboarding for tennis-specific data (NTRP, region, availability)

## Database Schema
- **Users Table**: Comprehensive player profiles including tennis skill level (NTRP), region, age, bio, available times, and ranking stats (points, wins, losses)
- **Matches Table**: Match requests with status tracking (pending, accepted, rejected, completed), scheduling, and point costs
- **Chats Table**: Real-time messaging system linked to matches
- **Posts Table**: Community features for user-generated content

## Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Configured for Neon serverless PostgreSQL
- **Migrations**: Automated schema management via drizzle-kit
- **Validation**: Zod schemas for type-safe data validation

## Mobile-First Design
- **Responsive**: Tailwind CSS with mobile breakpoints
- **PWA-Ready**: Service worker configuration for offline capability
- **Touch Optimization**: Touch-friendly UI components and gestures
- **Performance**: Optimized bundle splitting and lazy loading

## Real-Time Features
- **Chat System**: Firestore real-time listeners for instant messaging
- **Match Notifications**: Live updates for match requests and status changes
- **Presence Indicators**: Online/offline status for active users

## Points & Ranking System
- **Match Economics**: Points-based system for match requests (50 points per match)
- **Skill Tracking**: Win/loss records and performance metrics
- **Leaderboards**: Ranking system based on points and performance
- **Gamification**: Achievement system to encourage participation

# External Dependencies

## Firebase Services
- **Firebase Auth**: Google OAuth integration for user authentication
- **Firestore**: NoSQL database for real-time data and user profiles
- **Firebase Storage**: File uploads for profile pictures and media
- **Firebase Hosting**: Configured for production deployment

## Database & ORM
- **Neon Database**: Serverless PostgreSQL for production data
- **Drizzle ORM**: Type-safe database queries and migrations
- **Connection Pooling**: Built-in connection management for serverless environments

## UI & Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **shadcn/ui**: Pre-built component library with consistent styling
- **Lucide React**: Icon system with tree-shaking support

## Development & Build Tools
- **Vite**: Fast build tool with HMR and optimized production builds
- **TypeScript**: Static type checking across frontend and backend
- **ESLint**: Code quality and consistency enforcement
- **PostCSS**: CSS processing with Tailwind integration

## Third-Party Integrations
- **Google Fonts**: Inter font family for modern typography
- **Font Awesome**: Icon library for enhanced UI elements
- **React Hook Form**: Efficient form handling with validation
- **Date-fns**: Lightweight date manipulation library

## Deployment & Production
- **Replit Integration**: Development environment optimizations
- **Environment Variables**: Secure configuration management
- **Build Optimization**: Code splitting and asset optimization
- **Error Handling**: Comprehensive error boundaries and logging