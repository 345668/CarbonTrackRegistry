# Radical Zero Carbon Registry Platform

A cutting-edge carbon registry platform that revolutionizes carbon offset project management through comprehensive digital tools and advanced verification processes.

## Key Features

- **Project Registration & Management**: Track the complete lifecycle of carbon offset projects.
- **Third-Party Verification System**: Robust verification workflow with document uploads, stage tracking, and comments.
- **Carbon Credit Management**: Issue, transfer, and retire carbon credits with full audit trails.
- **Real-time Monitoring**: Track the status of projects, verifications, and credits dynamically.
- **Stakeholder Collaboration**: Connect developers, verifiers, standards bodies, and end users.

## Technical Stack

- **Frontend**: React with TypeScript
- **Backend**: Express.js API server
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **Real-time Updates**: WebSocket for live data
- **UI Components**: Shadcn UI + TailwindCSS
- **State Management**: TanStack Query
- **Routing**: Wouter

## Carbon Credit Lifecycle

The platform supports the full carbon credit lifecycle:

1. **Issuance**: Credits are issued after project verification
2. **Tracking**: Monitor available credits by project, vintage, and owner
3. **Transfer**: Transfer credits between accounts with purpose documentation
4. **Retirement**: Permanently retire credits with beneficiary and purpose recording
5. **Reporting**: Transparent public tracking of all credit transactions

## Verification System

Our advanced verification system includes:

- Multi-stage verification process with customizable requirements
- Document upload and management for verification evidence
- Internal and external comment systems for verifier feedback
- Stage completion tracking with approval workflows
- Third-party verifier integration

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Create database schema (if using PostgreSQL)
npm run db:push
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `MAPBOX_ACCESS_TOKEN`: Token for the map visualization features
- `SESSION_SECRET`: Secret for securing user sessions

## License

© 2023 Radical Zero GmbH - All Rights Reserved