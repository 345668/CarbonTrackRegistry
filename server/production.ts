/**
 * Production server configuration
 */

import { Express } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

/**
 * Apply production-specific middleware and configurations
 */
export function configureProductionServer(app: Express) {
  console.log("🔒 Configuring production security measures");
  
  // Apply helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https://*.mapbox.com"],
          connectSrc: ["'self'", "https://*.mapbox.com"]
        }
      }
    })
  );
  
  // Rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false
  });
  
  // Apply rate limiting to API routes
  app.use("/api/", apiLimiter);
  
  // Trust proxy if behind a load balancer
  app.set('trust proxy', 1);
  
  // Additional production configurations can be added here
}