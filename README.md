# 🚀 Monorepo Development & Deployment System

## Overview
This repository provides a complete system for developing, testing, and deploying microservices within a monorepo. It includes:
- Development and production environments
- A robust CI/CD pipeline
- Kubernetes manifests for deployment
- Automated Dockerfile management
- Comprehensive infrastructure automation

## 📌 CI/CD Workflow Triggers
The pipeline is triggered on:
- A push to the `main` branch.

## 🏗️ System Workflow
### 1️⃣ Detect Changes
- Checks out the repository.
- Identifies which backend microservices have changed using Git.
- Outputs a JSON array of modified services for further processing.

### 2️⃣ Build & Test
- Checks out the repository.
- Sets up the Node.js environment (version 22).
- Installs dependencies, including `turbo`.
- Configures environment variables.
- Creates a Docker network if it doesn’t exist.
- Starts essential services using `docker-compose.resources.yaml`.
- Verifies running containers and logs debug information upon failure.
- Builds services using TurboRepo and runs them in development mode.
- Waits for all services to be up before running tests.
- Executes unit tests in `/packages/test`.
- Cleans up Docker resources post-testing.
- Builds Docker images for changed services.
- Deploys Docker containers using `docker-compose.yaml`.
- Runs additional verification, debugging, and testing.
- Formats detected services for Docker tagging.
- Logs in to Docker Hub.
- Tags and pushes images to Docker Hub with the commit SHA.

## 🌐 Deployment
This system is deployed using **CIVO Cloud** and Kubernetes. Deployment manifests are available in the `infra/k8s` directory.

### Deployment Architecture
![Deployment Architecture](./docs/deployment.png)

## 🚀 Running Services & Dependencies
### Network Setup
```sh
docker network create main_network || true
```
### Development Setup
If running in a development environment:
1. Initialize environment variables:
   ```sh
   script/start.sh
   ```
2. Build all images:
   ```sh
   script/build_service.sh
   ```

### Running Services
This system allows running individual services or the entire project:
#### Running All Services
```sh
docker compose -f 'docker/common/docker-compose.yaml' up -d --build
docker compose -f 'docker/docker-compose.yaml' up -d --build
```
#### Running a Specific Service (e.g., `auth`)
##### Without Docker:
```sh
docker compose -f 'docker/common/docker-compose.yaml' up -d --build
docker compose -f 'docker/auth/docker-compose.resources.yaml' up -d --build
```
Then, run Turbo build and development mode:
```bash
npm install && turbo build && turbo dev
```
##### With Docker:
```sh
docker compose -f 'docker/common/docker-compose.yaml' up -d --build
docker compose -f 'docker/auth/docker-compose.yaml' up -d --build
```

## 🔍 Testing API Endpoints
### Register a New User
**Request:**
```sh
curl -X POST http://localhost:5001/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}'
```

## 🛠️ Setup Instructions
### Environment Variables
Ensure the following secrets are configured in GitHub Actions:
- `DOCKER_USERNAME`: Docker Hub username.
- `DOCKER_PASSWORD`: Docker Hub password.

### Required Scripts
- `scripts/start.sh`: Initializes the environment.
- `scripts/checkservice.sh`: Waits for all services to be up.
- `scripts/build_images.sh`: Builds Docker images.
- `scripts/tag_images.sh`: Tags and pushes Docker images.

## 🚀 Running the System Locally
To run the system locally:
1. Clone the repository.
2. Install dependencies:
   ```sh
   npm install -g turbo && npm install
   ```
3. Create and start necessary Docker resources:
   ```sh
   docker network create main_network || true
   docker compose -f 'docker/common/docker-compose.yaml' up -d --build
   docker compose -f 'docker/docker-compose.yaml' up -d --build --wait
   ```
4. Run tests:
   ```sh
   cd packages/test
   npm run test
   ```
5. Build and deploy images:
   ```sh
   cd scripts/
   ./build_images.sh
   ./tag_images.sh <DOCKER_USERNAME> <GIT_SHA> <SERVICES_LIST>
   ```

## 📜 License
This project is licensed under the MIT License.

## 💡 Contributions
Feel free to open an issue or submit a pull request for any improvements!

