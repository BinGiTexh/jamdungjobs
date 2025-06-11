# Job Platform Template

A flexible and customizable job board platform that can be easily adapted for different regions and markets.

## Quick Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/job-platform-template.git
   cd job-platform-template
   ```

2. Run the setup script with your region's details:
   ```bash
   ./scripts/setup-platform.sh "Caribbean" "JMD" "America/Kingston" "en"
   ```

3. Verify the installation:
   ```bash
   ./scripts/health-check.sh
   ```

4. Access your job platform:
   - Frontend: http://localhost:3000
   - API: http://localhost:5000
   - pgAdmin: http://localhost:5050

## Features

- Region-specific customization
- User authentication and roles (Job Seekers, Employers)
- Job posting and management
- Advanced job search and filtering
- Skill matching and recommendations
- Application tracking
- Resume parsing and handling
- Multiple currency support
- Quick apply functionality
- Responsive design
- Multi-language support
- Docker-based development and deployment

## Technical Stack

### Frontend
- React with Material-UI
- React Router for navigation
- Axios for API communication
- Responsive design components

### Backend
- Node.js & Express
- PostgreSQL database
- Prisma ORM
- JWT Authentication
- Resume parsing service

### Infrastructure
- Docker containerization
- Docker Compose for orchestration
- Nginx for production deployment
- Health monitoring

## Development

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- Git

### Getting Started

1. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

2. Configure your environment variables in `.env`

3. Start the development environment:
   ```bash
   docker compose up -d
   ```

4. Monitor services:
   ```bash
   ./scripts/health-check.sh
   docker compose logs -f
   ```

### Testing
```bash
# Frontend tests
cd packages/frontend && npm test

# Backend tests
cd packages/api && npm test
```

## Configuration

### Region Settings
Update specific settings for your region:
```bash
./scripts/update-region.sh caribbean currency USD
```

Available fields:
- currency
- timezone
- language

### Customization

1. Region-specific configuration:
   - API: `packages/api/config/<region>.json`
   - Frontend: `packages/frontend/src/config/<region>.js`

2. Theme customization:
   - Update colors in your region's frontend config
   - Modify component styles in `packages/frontend/src/styles`

3. Feature toggles:
   - Enable/disable features in your region's API config

## Production Deployment

1. Build production images:
   ```bash
   docker compose -f docker/production/docker-compose.yml build
   ```

2. Deploy:
   ```bash
   docker compose -f docker/production/docker-compose.yml up -d
   ```

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Customization Guide](docs/CUSTOMIZATION.md)

## Support and Contributing

### Support
For support and questions, please open an issue in the GitHub repository.

### Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
