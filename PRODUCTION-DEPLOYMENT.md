# Radical Zero Carbon Registry - Production Deployment Guide

This guide explains how to deploy the Carbon Registry application to production.

## Prerequisites

- Node.js v20 or later
- PostgreSQL database
- Environment variables properly configured

## Environment Variables

The following environment variables must be set in your production environment:

- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Secret string for session encryption (required)
- `EXTERNAL_API_KEY`: API key for external service access (required)
- `MAPBOX_ACCESS_TOKEN`: Token for map functionality (optional)
- `NODE_ENV`: Set to "production" for production mode

## Deployment Steps

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Prepare static files** (ensures client-side routing works properly):
   ```bash
   ./prepare-static-files.sh
   ```

3. **Initialize the database**:
   ```bash
   npm run db:push
   ```

4. **Seed the database** (first time only):
   ```bash
   npx tsx server/seed.ts
   ```

5. **Start the production server**:
   ```bash
   ./start-production.sh
   ```

## Production Considerations

- **SSL**: In production, always use HTTPS with proper certificates
- **Security**: Implement rate limiting and other security measures
- **Monitoring**: Set up application monitoring and error tracking
- **Backups**: Set up regular database backups
- **Scaling**: Consider load balancing for high traffic scenarios

## Application Architecture

The application consists of:

- **Frontend**: React with TailwindCSS and shadcn UI components
- **Backend**: Express.js REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Passport.js

## Maintenance

- Regularly update dependencies with `npm update`
- Monitor database performance and growth
- Review application logs for errors or unusual patterns

## Troubleshooting

If you encounter issues in production:

1. Check application logs for errors
2. Verify all environment variables are correctly set
3. Ensure the database is accessible and properly configured
4. Check server resources (CPU, memory, disk space)

### Common Issues

- **"Not Found" errors when accessing routes**:
  ```bash
  # Check if static files exist in the dist/public directory
  ls -la dist/public/
  
  # If missing, run the prepare-static-files script
  ./prepare-static-files.sh
  
  # Restart the application
  ./start-production.sh
  ```

- **Database connection issues**:
  ```bash
  # Test database connection
  npx tsx -e "import { pool } from './server/db.ts'; async function test() { try { await pool.query('SELECT NOW()'); console.log('Database connection successful'); } catch (e) { console.error('Database connection failed:', e); } } test();"
  ```

- **Memory store warnings**:
  These warnings are expected in development but should be addressed in production by using a persistent session store like connect-pg-simple.

For critical issues, contact the development team at contact@radicalzero.com