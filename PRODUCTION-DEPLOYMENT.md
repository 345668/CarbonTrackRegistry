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

2. **Initialize the database**:
   ```bash
   npm run db:push
   ```

3. **Seed the database** (first time only):
   ```bash
   npx tsx server/seed.ts
   ```

4. **Start the production server**:
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

For critical issues, contact the development team at contact@radicalzero.com