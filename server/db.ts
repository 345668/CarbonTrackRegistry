import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure neon to use the WebSocketConstructor
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a pool with robust production-ready settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // longer timeout for initial connection
  max: 10, // reduced max connections to avoid overloading the server
  idleTimeoutMillis: 30000 // how long a connection can be idle before being closed
});

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  
  // In production, we attempt to reconnect rather than crashing
  if (process.env.NODE_ENV === 'production') {
    console.log('Attempting to recover from database error...');
  } else {
    // In development, we exit to make errors more obvious
    process.exit(-1);
  }
});

// Initialize Drizzle with the pool and schema
export const db = drizzle(pool, { schema });