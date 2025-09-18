# BrandMonkey Server

A Node.js backend server for the BrandMonkey application with MongoDB integration.

## Features

- RESTful API endpoints
- MongoDB database integration
- JWT authentication
- File upload handling with AWS S3
- Email notifications with SendGrid
- Cron job scheduling
- CORS enabled
- Security middleware with Helmet

## Docker Setup

### Prerequisites

- Docker and Docker Compose installed on your system
- Git (to clone the repository)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd brandmonkey-server
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit the `.env` file with your actual configuration values.

3. **Start the application with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - API Server: http://localhost:8800
   - MongoDB Express (Database UI): http://localhost:8081
     - Username: admin
     - Password: admin123

### Docker Services

The Docker Compose setup includes:

- **brandmonkey-server**: Main Node.js application
- **brandmonkey-mongodb**: MongoDB database
- **brandmonkey-mongo-express**: Web-based MongoDB admin interface

### Environment Variables

Copy `env.example` to `.env` and configure the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=8800

# Database Configuration
MONGODB_URI=mongodb://admin:password123@mongodb:27017/brandmonkey?authSource=admin

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=your_email@example.com

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
AWS_REGION=your_aws_region_here
S3_BUCKET_NAME=your_s3_bucket_name_here
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start services
docker-compose up --build -d

# Remove all containers and volumes
docker-compose down -v
```

## Development Setup (Without Docker)

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v7.0 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Update the `.env` file with your configuration.

3. **Start MongoDB**
   Make sure MongoDB is running on your system.

4. **Start the development server**
   ```bash
   npm run nodemon
   ```

## API Endpoints

The server provides the following main route groups:

- `/auth` - Authentication routes
- `/admin` - Admin management routes
- `/employee` - Employee management routes
- `/notes` - Notes management routes
- `/download-csv` - CSV download routes
- `/tickets` - Ticket management routes
- `/dashboard` - Dashboard data routes

## Database

The application uses MongoDB with the following main collections:

- Users (employees, admins)
- Clients
- Activities
- Notes
- Tickets
- Client Performance
- Employee Allocation

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Helmet for security headers
- Input validation with express-validator

## File Uploads

The application supports file uploads with:
- Multer for handling multipart/form-data
- AWS S3 integration for cloud storage
- Image processing with Sharp

## Cron Jobs

The application includes scheduled tasks for:
- Monthly data cleanup
- Email notifications
- Performance monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the ISC License.