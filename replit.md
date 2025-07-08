# LogiFlow - Customer Load Management System

## Overview

LogiFlow is a web-based logistics dashboard application built for managing customer loads and fleet operations. The system provides a comprehensive interface for tracking shipments, managing truck assignments, and maintaining operational notes through an integrated notepad system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with JSON responses
- **Data Storage**: File-based JSON storage for prototyping phase
- **Database ORM**: Drizzle ORM configured for PostgreSQL (ready for future migration)
- **Validation**: Zod schemas for type-safe data validation

### Database Design
The system uses Drizzle ORM with PostgreSQL schema definitions but currently operates with JSON file storage. Key entities include:
- **Customer Loads**: Core shipment tracking with fields for customer info, resources, priority, and remarks
- **Trucks**: Fleet management with status tracking (available, busy, maintenance)
- **Notepad**: Integrated note-taking system for operational documentation
- **Users**: User management system (prepared for future authentication)

## Key Components

### Dashboard Components
- **DashboardStats**: Real-time metrics and KPI display
- **CustomerLoadTable**: Interactive table for managing shipments with search and filtering
- **FleetStatus**: Truck availability and status monitoring
- **LogisticsNotepad**: Integrated note-taking with auto-save functionality
- **AddCustomerModal**: Form-based customer load creation

### Data Management
- **Storage Layer**: Abstracted storage interface supporting both JSON file and database backends
- **API Routes**: RESTful endpoints for CRUD operations on all entities
- **Real-time Updates**: React Query for optimistic updates and cache invalidation

### UI System
- **Design System**: Shadcn/ui components with consistent styling
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Theme Support**: CSS custom properties for easy theme customization
- **Accessibility**: ARIA-compliant components from Radix UI

## Data Flow

1. **Client Requests**: Frontend makes HTTP requests to Express API endpoints
2. **API Processing**: Express routes handle requests with Zod validation
3. **Storage Operations**: Abstract storage layer manages data persistence
4. **Response Handling**: JSON responses with proper error handling
5. **State Updates**: React Query manages client-side cache and UI updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connectivity (prepared for PostgreSQL)
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Runtime type checking and validation

### UI Dependencies
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Variant-based component styling
- **lucide-react**: Icon library

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite dev server with Express middleware
- **File Watching**: Automatic TypeScript compilation
- **Development Tools**: Runtime error overlay and debugging support

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild bundles Express server for Node.js
- **Static Serving**: Express serves built frontend assets
- **Environment**: Configured for Replit deployment with proper asset handling

### Data Persistence
- **Current**: JSON file storage for rapid prototyping
- **Future**: PostgreSQL database with Drizzle ORM migrations
- **Migration Path**: Abstract storage interface allows seamless backend switching

## Recent Changes

### July 8, 2025 - Milestone Tracking System
- **Enhanced Delivery Schema**: Updated customer load schema with separate start/end dates and times for multi-day deliveries
- **Journey Milestone System**: Created comprehensive milestone tracking with starting/ending points, dates, times, and break tracking
- **Expandable Journey Details**: Added clickable truck resources in table to unfold detailed milestone information
- **Delivery Range Display**: Added prominent delivery range display at top of dashboard showing duration and time windows
- **API Routes for Milestones**: Created full CRUD API endpoints for journey milestone management
- **Sample Journey Data**: Added realistic multi-day journey with milestone progression

### New Data Model Features:
- `deliveryStartDate` and `deliveryEndDate` for multi-day deliveries
- `deliveryStartTime` and `deliveryEndTime` for precise scheduling
- `journeyMilestones` table with sequence tracking, locations, times, and break periods
- Enhanced external API endpoints with new field names

### New Components:
- `DeliveryRangeDisplay` - Shows delivery duration and schedule at dashboard top
- `JourneyMilestones` - Expandable table showing detailed milestone progress
- Enhanced `CustomerLoadTable` with collapsible milestone details
- Updated form fields for start/end date selection

### API Enhancements:
- `/api/journey-milestones/:customerLoadId` - Get milestones for specific load
- `/api/journey-milestones` - Create, update, delete milestone entries
- Updated external API endpoints to support new delivery date structure

The application is designed with scalability in mind, using a modular architecture that can easily transition from file-based storage to a full database system as requirements grow.