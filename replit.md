# Deposit BRI - Mobile Banking Application

## Overview

Deposit BRI is a simple mobile banking application built with Flask and vanilla HTML/CSS/JavaScript. The application simulates a basic banking interface focused on deposit and savings account management for a single predefined user. It features a customer dashboard and an admin panel for account management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology**: Vanilla HTML, CSS, and JavaScript (no frontend frameworks)
- **Styling**: Bootstrap 5.3.0 for responsive design and Font Awesome for icons
- **Structure**: Three main pages - login (index.html), customer dashboard, and admin dashboard
- **Communication**: RESTful API calls to Flask backend using fetch API

### Backend Architecture
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: PostgreSQL (Neon Database online) with DATABASE_URL configuration
- **Session Management**: Flask sessions for user authentication and admin access
- **CORS**: Enabled for cross-origin API requests
- **Proxy Support**: ProxyFix middleware for deployment behind reverse proxies

## Key Components

### Database Models
- **User**: Stores customer information (username, PIN, savings balance, deposit balance, email)
- **Notification**: Manages system notifications with read/unread status
- **Popup**: Handles popup messages with active/inactive states
- **Chat**: Appears to be defined but implementation is incomplete

### Authentication System
- **Single User Login**: Hardcoded default user "Siti Aminah" with PIN "112233"
- **Admin Access**: Special admin code "011090" for administrative functions
- **Session-based**: Uses Flask sessions to maintain login state

### API Endpoints
- `/api/login`: Handles user authentication
- `/api/admin-access`: Validates admin access code
- Additional endpoints for balance management (implied from frontend code)

## Data Flow

1. **User Login**: User enters credentials → Flask validates against database → Session established
2. **Dashboard Loading**: Frontend fetches user data via API → Displays balances and status
3. **Admin Operations**: Admin enters access code → Gains elevated privileges → Can modify user balances
4. **Balance Updates**: Admin makes changes → Database updated → Frontend reflects new values

## External Dependencies

### Frontend Libraries
- Bootstrap 5.3.0 (CSS framework)
- Font Awesome 6.0.0 (icons)

### Backend Dependencies
- Flask (web framework)
- Flask-SQLAlchemy (database ORM)
- Flask-CORS (cross-origin resource sharing)
- Werkzeug (WSGI utilities)

### Email Integration
- SMTP support configured for email notifications (imported in routes.py)
- Uses standard Python email libraries (MIMEText, MIMEMultipart)

## Deployment Strategy

### Environment Configuration
- **Database**: Configurable via DATABASE_URL environment variable
- **Session Security**: SESSION_SECRET environment variable for production
- **Development**: SQLite database with file-based storage
- **Production**: Pool configuration with connection recycling and pre-ping enabled

### Security Considerations
- Session-based authentication
- PIN-based login system
- Admin access control via secret code
- CORS enabled for API access
- Proxy-aware configuration for deployment behind load balancers

### Application Structure
- **Entry Point**: main.py imports and runs the Flask app
- **Application Factory**: app.py contains main application setup and database initialization
- **Auto-initialization**: Creates default user and database tables on startup
- **Static Assets**: CSS and JavaScript files served from static directory
- **Templates**: Jinja2 templates for HTML rendering

The application follows a traditional MVC pattern with clear separation of concerns between models, views (templates), and controllers (routes). The architecture prioritizes simplicity and ease of deployment while maintaining basic security practices for a banking simulation application.

## Recent Changes

### July 28, 2025 - BRImo-Style Interface Redesign & Online Database Integration
- **Complete UI Overhaul**: Transformed the traditional banking interface to match BRImo's modern design language
- **New Header Design**: Evening gradient background (orange to purple) with BRI logo and time-based greeting message
- **Separate Balance Cards**: Two gradient cards for Tabungan (blue) and Deposito (green) with proper spacing
- **Full-Width Header**: Header extends edge-to-edge with no white space showing at top
- **Quick Menu Grid**: 8-icon grid layout (4x2) with rounded buttons for Transfer, BRIVA, E-Wallet, Pulsa/Data, Top Up, Tagihan, Setor & Tarik Tunai, and Lifestyle features
- **Search Functionality**: Added feature search bar with modern rounded design
- **Financial Summary**: "Catatan Keuanganmo" section with income/expense tracking and date period display
- **Bottom Navigation**: Fixed 5-icon navbar with central QRIS button (Home, Mutasi, QRIS, Aktivitas, Akun)
- **Online Database**: Using Neon PostgreSQL database for cloud-based data storage and multi-access capability
- **Auto-Initialization**: Database creates sample user, notifications, and popup messages automatically on first run
- **Responsive Design**: Mobile-first approach optimized for 420px max-width