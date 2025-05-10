# Carbon Registry Deployment Checklist

Use this checklist to ensure a smooth deployment of the Carbon Registry application.

## Pre-deployment Checks

- [ ] **Environment Variables**: Ensure all required environment variables are set:
  - `DATABASE_URL`: PostgreSQL connection string
  - `SESSION_SECRET`: Secret for session encryption
  - `MAPBOX_ACCESS_TOKEN`: For map functionality 
  - `NODE_ENV=production`: For production mode

- [ ] **Database**: 
  - [ ] PostgreSQL database is provisioned and accessible
  - [ ] Database schema is pushed using `npm run db:push`
  - [ ] Initial data is seeded (only for first deployment)

- [ ] **Build**: 
  - [ ] Application builds successfully with `npm run build`
  - [ ] All static assets are included in the build

## Deployment Steps

1. **Prepare the environment**:
   - Install Node.js v20 or later
   - Configure environment variables
   - Ensure PostgreSQL is running and accessible

2. **Clone and build the application**:
   ```bash
   # Clone the repository (if deploying from source)
   git clone <repository-url>
   cd carbon-registry
   
   # Install dependencies
   npm install
   
   # Build the application
   npm run build
   ```

3. **Initialize the database** (first deployment only):
   ```bash
   # Push the schema to the database
   npm run db:push
   
   # Seed initial data
   npx tsx server/seed.ts
   ```

4. **Start the application**:
   ```bash
   # Start the production server
   ./start-production.sh
   ```

## Post-deployment Checks

- [ ] Application is accessible through the designated URL
- [ ] Health check endpoint (`/health`) returns status 200
- [ ] Login functionality works correctly
- [ ] Dashboard and main features load properly
- [ ] API endpoints are responding correctly
- [ ] Map functionality works (if Mapbox token is provided)

## Production Monitoring

- [ ] Set up application monitoring (e.g., logs, error tracking)
- [ ] Configure automatic backups for the database
- [ ] Set up alerts for critical errors or performance issues
- [ ] Configure regular health check monitoring

## Replit-specific Deployment

When deploying on Replit:

1. Click the "Deploy" button in the Replit interface
2. Ensure the build command is set to `npm run build`
3. Set the run command to `./start-production.sh`
4. Configure secrets in the Replit secrets panel for all environment variables
5. After deployment, verify the application is running correctly

## Troubleshooting Common Issues

- **Database connection errors**: 
  - Verify DATABASE_URL is correct
  - Check that the database is accessible from the server
  - Ensure database user has appropriate permissions

- **Build errors**: 
  - Check for dependency issues
  - Verify Node.js version compatibility
  - Ensure enough memory is available for the build process

- **Application startup errors**:
  - Check server logs for detailed error messages
  - Verify all required environment variables are set
  - Ensure the build files are in the expected location

For any persistent issues, refer to the error logs and contact support at support@radicalzero.com.