# BubbleGPT Full Truck Load - Logistics Management System

## Overview

BubbleGPT Full Truck Load is a web-based logistics dashboard application built for managing customer loads and fleet operations. The system provides a comprehensive interface for tracking shipments, managing truck assignments, and maintaining operational notes through an integrated notepad system.

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

### July 9, 2025 - AI-Suggested Priority Changes & Accept/Revert Functionality
- **Priority Suggestions**: Added `remarkPriority` field to schema for AI-suggested priority changes
- **Accept/Revert Buttons**: Implemented accept buttons that change to revert buttons after acceptance
- **Undo Mechanism**: Complete undo/revert capability for both resource and priority suggestions
- **Visual State Indicators**: Blue accept buttons (Check icon) change to orange revert buttons (Undo2 icon)
- **Original State Storage**: Stores original priority in remark field for reliable revert functionality
- **Dual-Direction Flow**: Accept → Revert → Accept cycle with proper state management
- **Enhanced UI**: Actions column consolidates all AI suggestion management with clear visual feedback

### July 9, 2025 - Application Rebranding  
- **Title Update**: Changed application name from "LogiFlow Customer Load Management" to "BubbleGPT Full Truck Load"
- **Updated Documentation**: Modified API documentation, README, and HTML title to reflect new branding
- **Header Redesign**: Updated dashboard header with "BubbleGPT" as main title and "Full Truck Load" as subtitle

### July 8, 2025 - Milestone Notes & Customer Name-Based API
- **Inline Notes Editing**: Added real-time editing capability for journey milestone notes with hover-to-edit interface
- **Customer Name API Access**: Updated external API endpoints to use customer name as identifier instead of database ID
- **URL Encoding Support**: Added proper URL decoding for customer names with special characters or spaces
- **Enhanced Storage Interface**: Added `getCustomerLoadByName()` method for name-based record retrieval
- **Date Display Fix**: Resolved timezone parsing issues causing incorrect month displays in dashboard components
- **API Documentation Cleanup**: Removed duplicate documentation file and updated with milestone notes endpoints
- **Upsert Behavior**: POST requests now automatically update existing customer loads with same name instead of creating duplicates

### July 8, 2025 - Consolidated External API Implementation
- **Consolidated External API**: Implemented single-endpoint API that combines customer loads with journey milestones in unified responses
- **External API Endpoints**: Created comprehensive external API with `/api/external/customer-loads` supporting GET, POST, PUT operations
- **Journey Milestone Integration**: External API supports 1-3 optional journey milestones per customer load in a single request/response
- **Field Mapping**: Implemented proper field mapping between external API format (`sequence`, `breakHours`) and internal schema (`sequenceNumber`, `breakTime`)
- **Flexible Validation**: All fields optional except `customerName`, supporting various levels of data completeness
- **Notepad External API**: Added `/api/external/notepad` endpoints for GET and PUT operations with proper JSON responses

### Consolidated API Features:
- Single data point for customer loads including embedded journey milestones
- Consistent `{success: true/false, data: ...}` response format across all external endpoints
- CORS-enabled for cross-origin access from external systems
- Proper error handling with detailed validation messages
- Support for creating, reading, and updating customer loads with associated milestones

### External API Endpoints:
- `GET /api/external/customer-loads` - Get all loads with milestones
- `GET /api/external/customer-loads/:customerName` - Get specific load with milestones (by customer name)
- `POST /api/external/customer-loads` - Create load with optional milestones
- `PUT /api/external/customer-loads/:customerName` - Update load with optional milestone replacement (by customer name)
- `GET /api/external/notepad` - Get notepad content
- `PUT /api/external/notepad` - Update notepad content

### July 8, 2025 - Milestone Tracking System
- **Enhanced Delivery Schema**: Updated customer load schema with separate start/end dates and times for multi-day deliveries
- **Journey Milestone System**: Created comprehensive milestone tracking with starting/ending points, dates, times, and break tracking
- **Expandable Journey Details**: Added clickable truck resources in table to unfold detailed milestone information
- **Delivery Range Display**: Added prominent delivery range display at top of dashboard showing duration and time windows
- **API Routes for Milestones**: Created full CRUD API endpoints for journey milestone management
- **Sample Journey Data**: Added realistic multi-day journey with milestone progression

The application is designed with scalability in mind, using a modular architecture that can easily transition from file-based storage to a full database system as requirements grow.