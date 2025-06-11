# JamDung Jobs

## Development Setup

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/jamdungjobs.git
   cd jamdungjobs
   ```

2. Run the development setup script:
   ```bash
   chmod +x dev-setup.sh
   ./dev-setup.sh
   ```

The setup script will:
- Check for required dependencies
- Set up development environment files
- Start the development containers
- Initialize the database
- Provide access URLs and helpful commands

### Development URLs

- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Health: http://localhost:3000/health
- Database: postgresql://localhost:5432

### Useful Commands

- View logs:
  ```bash
  docker compose -f docker-compose.dev.yml logs -f
  ```

- Restart a service:
  ```bash
  docker compose -f docker-compose.dev.yml restart [service]
  ```

- Stop the environment:
  ```bash
  docker compose -f docker-compose.dev.yml down
  ```

- Clean restart:
  ```bash
  ./dev-setup.sh --clean
  ```

### Development Features

- Hot reloading for both frontend and backend
- Source maps for debugging
- Health monitoring
- Database migrations
- Development optimizations

### Troubleshooting

If you encounter any issues:

1. Check the logs:
   ```bash
   docker compose -f docker-compose.dev.yml logs
   ```

2. Verify service health:
   ```bash
   curl http://localhost:3000/health
   ```

3. Clean restart:
   ```bash
   ./dev-setup.sh --clean
   ```

For more information, check the logs in the `logs/` directory.

# JamdungJobs 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, responsive job board platform built with a microservices architecture. JamdungJobs helps connect talented professionals with exciting career opportunities.

## 🌟 Features

- **Responsive Design**: Works seamlessly across all devices
- **Real-time Job Listings**: Latest opportunities at your fingertips
- **User Authentication**: Secure access for job seekers and employers
- **Modern Tech Stack**: Built with cutting-edge technologies

### Benefits

- **Single Codebase**: Manage one codebase instead of separate mobile and desktop versions
- **Cost-Effective**: Hosting one website is cheaper than multiple versions
- **SEO-Friendly**: Search engines prefer responsive sites over separate mobile sites
- **Easier Maintenance**: Changes automatically apply to all device sizes

## 🏗 Architecture

The project consists of several key components:

- **Frontend**: React-based web interface (`web-frontend`)
- **Backend API**: Node.js REST API service (`backend`)
- **Development Environment**: Local development setup (`local-dev`)
- **Infrastructure**: Terraform configurations for AWS deployment (`terraform`)

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v20 LTS or higher)
- MongoDB

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/BinGiTexh/jamdungjobs.git
   cd jamdungjobs
   ```

2. Start the development environment:
   ```bash
   cd local-dev
   docker-compose up
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:3001

## 💻 Development

### Project Structure

- `/web-frontend`: React-based web interface
- `/backend`: Node.js API service
- `/local-dev`: Development environment configuration
- `/terraform`: Infrastructure as Code
- `/frontend`: Mobile-optimized frontend (in development)

## 📦 Deployment

### Cost Optimization

Since the same code serves all devices, you can optimize AWS costs by:

- **Efficient Caching**: Set long cache times for static assets with CloudFront
- **Image Optimization**: Serve different image sizes based on device with srcset
- **Code Splitting**: Only load the JavaScript needed for the current view

### Infrastructure

The application is designed to be deployed on AWS using Terraform for infrastructure management.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔧 Support

For support, please open an issue in the GitHub repository.

---
Built with ❤️ by BingiTech
