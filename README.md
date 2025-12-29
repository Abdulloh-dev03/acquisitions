# 🚀 Acquisitions API

![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Express](https://img.shields.io/badge/Express-5.x-white?style=for-the-badge&logo=express&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)

A robust, production-ready backend API built with **Node.js**, **Express**, and **TypeScript**. This project features a modern stack including **Drizzle ORM** with **Neon Database**, comprehensive security with **Arcjet**, and a fully automated CI/CD pipeline using **GitHub Actions**.

---

## ✨ Features

- **🔐 Secure Authentication**: JWT-based authentication with `bcrypt` password hashing.
- **🛡️ Advanced Security**: Integrated `helmet`, `cors`, and **Arcjet** for rate limiting and bot protection.
- **🗄️ Modern Database**: managed via **Drizzle ORM** connected to **Neon Serverless Postgres**.
- **📝 Input Validation**: Request validation using **Zod**.
- **🔍 Logging**: Structured logging with `winston` and HTTP request logging with `morgan`.
- **🐳 Dockerized**: Fully containerized for development and production environments.
- **⚙️ CI/CD**: Automated execution of linting, formatting, testing, and Docker builds via GitHub Actions.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Neon](https://neon.tech/) (PostgreSQL)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/)
- **Security**: [Arcjet](https://arcjet.com/) & [Helmet](https://helmetjs.github.io/)
- **Testing**: [Jest](https://jestjs.io/) & [Supertest](https://github.com/ladjs/supertest)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+)
- npm
- Docker (optional, for containerized run)

### 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Abdulloh-dev03/acquisitions.git
   cd acquisitions
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory based on the `.env.example` (if available) or use the following template:

   ```env
   # Server
   PORT=3000
   NODE_ENV=development

   # Database (Neon)
   DATABASE_URL=postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require

   # Authentication
   JWT_SECRET=your_super_secret_key

   # Arcjet Security
   ARCJET_KEY=your_arcjet_key
   ```

### 🏃‍♂️ Running the App

**Development Mode**

```bash
npm run dev
```

**Production Build**

```bash
npm run build
npm start
```

### 🐳 Docker Support

**Run with Docker Compose (Dev)**

```bash
npm run dev:docker
```

**Build & Run Production Container**

```bash
npm run prod:docker
```

---

## 🧪 Testing

Run the comprehensive test suite to ensure system stability.

```bash
# Run unit and integration tests
npm test

# Check code coverage
npm test -- --coverage
```

---

## 📜 Scripts

| Script                | Description                              |
| :-------------------- | :--------------------------------------- |
| `npm run dev`         | Starts the server in watch mode          |
| `npm run build`       | Compiles TypeScript to JavaScript (dist) |
| `npm start`           | Runs the compiled application            |
| `npm run lint`        | Runs ESLint to check for code issues     |
| `npm run format`      | Formats code using Prettier              |
| `npm run db:generate` | Generates Drizzle migrations             |
| `npm run db:migrate`  | Applies Drizzle migrations to the DB     |

---

## 📂 Project Structure

```
src/
├── config/         # Configuration files (DB, Logger, Arcjet)
├── controllers/    # API Controllers
├── middlewares/    # Express Middlewares (Auth, Security)
├── models/         # Database Models & Schemas
├── routes/         # API Routes (Auth, Users)
├── services/       # Business Logic
├── utils/          # Utility functions
├── validations/    # Zod schemas
├── app.ts          # Express App Setup
└── server.ts       # Server Entry Point
```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📚 Tutorial

This project was built following this [YouTube tutorial](https://youtu.be/H5FAxTBuNM8?si=5axZ2-mPLWohGNPD).

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
