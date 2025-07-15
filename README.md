# BubbleGPT Full Truck Load - Logistics Management System

A cutting-edge AI-powered logistics management platform that transforms transportation workflows through intelligent optimization and real-time insights.

## 🚀 Features

### Core Functionality
- **Advanced AI-driven backhaul optimization** with dynamic European route suggestions
- **Comprehensive resource allocation** and revenue prediction tools
- **Intelligent load management** with multi-region support
- **Real-time dashboard** with KPI monitoring and analytics
- **Journey milestone tracking** with detailed delivery timelines
- **Integrated notepad system** for operational documentation

### AI Integration
- **Custom AI chatbot** with business-specific explanations
- **AI-powered priority suggestions** based on coordinator feedback
- **Resource swap recommendations** from Dynamic feedback Notepad
- **Acceptance/revert system** with incentive point tracking
- **Context-aware tooltips** explaining AI suggestion types

### API Infrastructure
- **RESTful API** with comprehensive CRUD operations
- **External API endpoints** for third-party integrations
- **Real-time data synchronization** across all components
- **CORS-enabled** for cross-origin access

## 🏗️ Architecture

### Frontend Architecture
```
React.js + TypeScript
├── Components/
│   ├── Dashboard (Main interface)
│   ├── CustomerLoadTable (Primary data management)
│   ├── AIChatbot (AI interaction interface)
│   ├── BackhaulOptimizer (Route optimization)
│   ├── FleetStatus (Truck management)
│   └── UI Components (Shadcn/ui)
├── State Management/
│   ├── TanStack React Query (Server state)
│   ├── React Hook Form (Form handling)
│   └── Zustand (Local state)
└── Styling/
    ├── Tailwind CSS (Utility-first styling)
    └── CSS Custom Properties (Theming)
```

### Backend Architecture
```
Node.js + Express.js
├── API Routes/
│   ├── Customer Loads (/api/customer-loads)
│   ├── Trucks (/api/trucks)
│   ├── Statistics (/api/stats)
│   ├── Notepad (/api/notepad)
│   ├── Journey Milestones (/api/journey-milestones)
│   └── External API (/api/external/*)
├── Storage Layer/
│   ├── Abstract Interface (IStorage)
│   ├── Memory Storage (Current)
│   └── Database Support (PostgreSQL ready)
└── AI Integration/
    ├── OpenAI API (Configured)
    └── Custom Business Logic
```

### Database Design
```
PostgreSQL Schema (Drizzle ORM)
├── customer_loads
│   ├── Core shipment data
│   ├── AI suggestion fields
│   ├── Priority and resource tracking
│   └── Incentive point system
├── trucks
│   ├── Fleet management
│   └── Status tracking
├── journey_milestones
│   ├── Delivery progression
│   └── Timeline tracking
├── notepad
│   ├── Operational notes
│   └── Dynamic feedback
└── users
    ├── Authentication ready
    └── Role-based access
```

## 🛠️ Technology Stack

### Core Technologies
- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (with Drizzle ORM)
- **AI**: OpenAI GPT-4o integration
- **Styling**: Tailwind CSS, Shadcn/ui
- **State Management**: TanStack React Query

### Development Tools
- **Build Tool**: Vite (Fast development server)
- **Type Safety**: TypeScript throughout
- **Code Quality**: ESLint, Prettier
- **Package Manager**: npm
- **Development Server**: Hot reloading enabled

### UI Components
- **Component Library**: Shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod validation
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA-compliant components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL (for production)

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd bubblegpt-logistics

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Variables
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Database Configuration (for production)
DATABASE_URL=postgresql://user:password@localhost:5432/logistics_db

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 📦 Deployment Options

### 1. Replit Deployment (Recommended)
```bash
# Already configured for Replit
# Simply click "Run" or use the deploy button
npm run dev
```

### 2. Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### 3. Netlify Deployment
```bash
# Build the application
npm run build

# Deploy to Netlify
# Upload the dist/ folder to Netlify
```

### 4. Docker Deployment
```dockerfile
# Create Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### 5. Traditional VPS/Server
```bash
# On your server
git clone [repository-url]
cd bubblegpt-logistics
npm install
npm run build
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start server/index.js --name logistics-app
```

### 6. Cloud Platform Deployments

#### AWS EC2
```bash
# Launch EC2 instance
# Install Node.js and dependencies
# Clone repository and configure
# Use PM2 or similar for process management
```

#### Google Cloud Platform
```bash
# Use Google Cloud Run or App Engine
# Configure cloud SQL for PostgreSQL
# Deploy using gcloud CLI
```

#### Azure App Service
```bash
# Create App Service
# Configure database connection
# Deploy using Azure CLI or GitHub Actions
```

## 🔧 Configuration

### Database Setup
```sql
-- Create database
CREATE DATABASE logistics_db;

-- Run migrations (when using database)
npm run db:migrate
```

### API Configuration
```javascript
// server/config.js
module.exports = {
  port: process.env.PORT || 5000,
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o'
  }
};
```

## 📊 API Documentation

### Core Endpoints

#### Customer Loads
```
GET    /api/customer-loads        # Get all customer loads
POST   /api/customer-loads        # Create new customer load
PUT    /api/customer-loads/:id    # Update customer load
DELETE /api/customer-loads/:id    # Delete customer load
```

#### External API
```
GET    /api/external/customer-loads              # Get all loads with milestones
GET    /api/external/customer-loads/:name        # Get specific load by name
POST   /api/external/customer-loads              # Create load with milestones
PUT    /api/external/customer-loads/:name        # Update load by name
GET    /api/external/notepad                     # Get notepad content
PUT    /api/external/notepad                     # Update notepad content
```

#### Statistics
```
GET    /api/stats                 # Get dashboard statistics
```

#### Fleet Management
```
GET    /api/trucks                # Get all trucks
POST   /api/trucks                # Create new truck
PUT    /api/trucks/:id            # Update truck
DELETE /api/trucks/:id            # Delete truck
```

### Response Format
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customerName": "Example Corp",
    "priority": "high",
    "deliveryStatus": "pending"
  }
}
```

## 🎯 Key Features Explained

### AI Suggestion System
- **Priority Adjustments**: Based on coordinator feedback from 2 weeks ago
- **Resource Swaps**: From Dynamic feedback Notepad with license number tracking
- **Accept/Revert Flow**: Complete undo mechanism with incentive point system
- **Visual Indicators**: Blue for pending, green for accepted suggestions

### Backhaul Optimization
- **18 pickup opportunities** across Austrian locations
- **Realistic revenue calculations** and delivery scenarios
- **International destination support**
- **Dynamic route suggestions**

### Journey Milestone Tracking
- **Multi-day delivery support** with start/end dates and times
- **Expandable journey details** with progress tracking
- **Real-time status updates**
- **Milestone progression visualization**

### External API Integration
- **Unified response format** for all external endpoints
- **Customer name-based access** instead of database IDs
- **Embedded milestone data** in customer load responses
- **CORS-enabled** for third-party integrations

## 🔐 Security Considerations

### API Security
- Input validation using Zod schemas
- CORS configuration for cross-origin requests
- Environment variable protection
- Rate limiting (recommended for production)

### Data Protection
- No sensitive data in client-side code
- Secure API key management
- Database connection security
- User authentication ready (expandable)

## 📈 Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Optimistic updates with React Query
- Memoization of expensive calculations
- Lazy loading of components

### Backend
- Efficient database queries
- Connection pooling (when using database)
- Caching strategies
- Compression middleware

## 🐛 Troubleshooting

### Common Issues
1. **Port already in use**: Change PORT in .env file
2. **Database connection errors**: Check DATABASE_URL configuration
3. **OpenAI API errors**: Verify OPENAI_API_KEY in environment
4. **Build failures**: Clear node_modules and reinstall dependencies

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check logs
npm run logs
```

## 📚 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint and Prettier configured
- Consistent component structure
- Proper error handling

### Testing
```bash
# Run tests (when implemented)
npm test

# Run integration tests
npm run test:integration
```

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 🚀 Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database connection pooling
- Redis for session management
- Microservices architecture

### Monitoring
- Application performance monitoring
- Error tracking and logging
- Database performance metrics
- User analytics

## 📝 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🤝 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**BubbleGPT Full Truck Load** - Transforming logistics management through AI-powered optimization and real-time insights.