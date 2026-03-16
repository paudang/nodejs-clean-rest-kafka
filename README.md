# nodejs-clean-rest-kafka

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![License](https://img.shields.io/badge/License-ISC-blue.svg)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)

A production-ready Node.js microservice generated with **Clean Architecture** and **MySQL**.
This project comes pre-configured with industry-standard tooling for **Code Quality**, **Testing**, and **Security**.

## 🚀 Key Features

-   **Architecture**: Clean Architecture (Domain, UseCases, Infrastructure).
-   **Database**: MySQL with **Flyway** migrations.
-   **Security**: Helmet, CORS, Rate Limiting, HPP.
-   **Quality**: Eslint, Prettier, Husky, Lint-Staged.
-   **Testing**: Jest (Unit & Integration).
-   **DevOps**: Multi-stage Docker build, CI/CD ready.

## 🔄 CI/CD Pipeline
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/yourusername/nodejs-clean-rest-kafka/ci.yml?branch=main)
This project includes a **GitHub Actions** workflow located in `.github/workflows/ci.yml`.
It automatically runs:
-   Linting
-   Tests
-   Builds

## 🛠️ Getting Started

### 1. Prerequisites
-   Node.js (v18+)
-   Docker & Docker Compose

### 2. Quick Start
```bash
# Initialize Git (Required for Husky)
git init

# Install dependencies
npm install

# Setup Git Hooks (Husky)
npm run prepare

# Start Infrastructure (DB, etc.)
docker-compose up -d

# Run Development Server
npm run dev
```

### 3. Development Standards
Ensure your code meets quality standards before committing:

```bash
# Run Linter
npm run lint

# Run Tests
npm test

# Format Code
npm run format
```

## 📂 Project Structure

The project follows **Clean Architecture** principles.
Microservices communication handled via **Kafka**.

## 📡 Testing Kafka Asynchronous Flow
This project demonstrates a production-ready Kafka flow:
1. **Producer**: When a user is created via the API, a `USER_CREATED` event is sent to `user-topic`.
2. **Consumer**: `WelcomeEmailConsumer` listens to `user-topic` and simulates sending an email.

### How to verify:
1. Ensure infrastructure is running: `docker-compose up -d db zookeeper kafka`
2. Start the app: `npm run dev`
3. Trigger an event by creating a user (via Postman or curl):
   ```bash
   curl -X POST http://localhost:3000/api/users \
     -H "Content-Type: application/json" \
     -d '{"name": "Kafka Tester", "email": "kafka@example.com"}'
   ```
4. Observe the logs:
   ```text
   [Kafka] Producer: Sent USER_CREATED event for 'kafka@example.com'
   [Kafka] Consumer: Received USER_CREATED. 
   [Kafka] Consumer: 📧 Sending welcome email to 'kafka@example.com'... Done!
   ```


## 📝 Logging
This project uses **Winston** for structured logging.
- **Development**: Logs are printed to the console.
- **Production**: Logs are saved to files:
  - `error.log`: Only error level logs.
  - `combined.log`: All logs.

## 🐳 Docker Deployment
This project uses a **Multi-Stage Dockerfile** for optimized production images.

### 1. Running Locally (Development)
To run the Node.js application locally while using Docker for the infrastructure (Database, Redis, Kafka, etc.):

```bash
# Start infrastructure
docker-compose up -d db zookeeper kafka

# Start the application
npm run dev
```

### 2. Running the App Container with Compose Infrastructure
If you want to run the application itself inside a Docker container while connecting to the infrastructure managed by your `docker-compose.yml`:

```bash
# First, ensure your infrastructure is running
docker-compose up -d

# Build Production Image
docker build -t nodejs-clean-rest-kafka .

# Run Container (attached to the compose network)
docker run -p 3000:3000 --network nodejs-clean-rest-kafka_default \
  -e DB_HOST=db \
  -e KAFKA_BROKER=kafka:29092 \
  nodejs-clean-rest-kafka
```

## 🚀 PM2 Deployment (VPS/EC2)
This project is pre-configured for direct deployment to a VPS/EC2 instance using **PM2** (via `ecosystem.config.js`).
1. Install dependencies
```bash
npm install
```
2. **Start Infrastructure (DB, Redis, Kafka, etc.) in the background**
*(This specifically starts the background services without running the application inside Docker, allowing PM2 to handle it).*
```bash
docker-compose up -d db zookeeper kafka
```
3. **Wait 5-10s** for the database to fully initialize.
4. **Deploy the App using PM2 in Cluster Mode**
```bash
npm run build
npm run deploy
```
5. **Check logs**
```bash
npx pm2 logs
```
6. Stop and remove the PM2 application
```bash
npx pm2 delete nodejs-clean-rest-kafka
```
7. Stop and remove the Docker infrastructure
```bash
docker-compose down
```

## 🔒 Security Features
-   **Helmet**: Sets secure HTTP headers.
-   **CORS**: Configured for cross-origin requests.
-   **Rate Limiting**: Protects against DDoS / Brute-force.
-   **HPP**: Prevents HTTP Parameter Pollution attacks.


## 🤖 AI-Native Development

This project is "AI-Ready" out of the box. We have pre-configured industry-leading AI context files to bridge the gap between "Generated Code" and "AI-Assisted Development."

- **Magic Defaults**: We've automatically tailored your AI context to focus on **nodejs-clean-rest-kafka** and its specific architectural stack (Clean Architecture, MySQL, etc.).
- **Use Cursor?** We've configured **`.cursorrules`** at the root. It enforces project standards (70% coverage, MVC/Clean) directly within the editor. 
  - *Pro-tip*: You can customize the `Project Goal` placeholder in `.cursorrules` to help the AI understand your specific business logic!
- **Use ChatGPT/Gemini/Claude?** Check the **`prompts/`** directory. It contains highly-specialized Agent Skill templates. You can copy-paste these into any LLM to give it a "Senior Developer" understanding of your codebase immediately.
