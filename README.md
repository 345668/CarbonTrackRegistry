# Radical Zero Carbon Registry Platform

A cutting-edge carbon registry platform that revolutionizes carbon offset project management through comprehensive digital tools and advanced verification processes.

![Carbon Registry Platform](https://raw.githubusercontent.com/yourusername/carbon-registry/main/generated-icon.png)

## About

The Carbon Registry Platform provides a comprehensive solution for registering, verifying, and tracking carbon offset projects and credits. It helps combat climate change by supporting sustainable initiatives and monitoring their impact.

### Key Features

- **Project Management**: Register and monitor carbon offset projects with detailed tracking
- **Verification System**: Multi-stage verification process with document management
- **Carbon Credit Lifecycle**: Complete tracking of credit issuance, transfers, and retirements
- **Blockchain Integration**: Immutable transaction recording for credit operations
- **Paris Agreement Compliance**: Corresponding adjustment tracking for international transfers
- **Interactive Maps**: Geospatial visualization of project locations and impacts
- **Certificate System**: PDF generation with QR codes for verification
- **External API**: Standardized endpoints for third-party integration
- **Advanced Analytics**: Data visualization and reporting tools

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn UI components
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Passport.js
- **Maps**: Mapbox integration
- **PDF Generation**: PDFKit for certificate creation
- **Data Visualization**: recharts, d3.js
- **API Documentation**: Built-in interactive documentation

## Getting Started

### Prerequisites

- Node.js v20 or later
- PostgreSQL database
- Mapbox API key (optional for map features)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/carbon-registry.git
   cd carbon-registry
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/carbon_registry
   SESSION_SECRET=your_session_secret
   MAPBOX_ACCESS_TOKEN=your_mapbox_token
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Seed initial data (optional):
   ```bash
   npx tsx server/seed.ts
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open your browser to `http://localhost:5000`

## Deployment

For production deployment, see [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md).

## Project Structure

```
carbon-registry/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Application pages
│   │   └── types/          # TypeScript type definitions
├── server/                 # Backend Express application
│   ├── routes/             # API route definitions
│   ├── utils/              # Server utility functions
│   ├── db.ts               # Database connection
│   └── index.ts            # Server entry point
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Database schema definitions
└── public/                 # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Replit](https://replit.com)
- Maps powered by [Mapbox](https://mapbox.com)
- UI components from [shadcn/ui](https://ui.shadcn.com/)