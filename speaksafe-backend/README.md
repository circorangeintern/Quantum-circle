# 🛡️ SpeakSafe Backend

> A secure, anonymous incident reporting system for boarding schools and educational institutions.

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

---

## 📖 Overview

SpeakSafe Backend powers the **SpeakSafe** platform—an anonymous reporting system designed to help students safely report incidents such as bullying, harassment, abuse, discrimination, and safety concerns while protecting their identity.

The backend is built with scalability, security, maintainability, and developer experience in mind.

---

## ✨ Features

- 🔒 Anonymous report submission
- 👤 Secure authentication & authorization
- 📝 Incident management
- 📷 Photo upload support
- ☁️ Cloudinary integration
- 🛡️ Input validation using Zod
- 🚦 Rate limiting
- 🍪 JWT Authentication with HTTP-only cookies
- 📊 Structured logging
- 🧪 Unit & Integration testing
- 📚 Swagger/OpenAPI support (planned)
- ⚡ Feature-based architecture (DDD-inspired)

---

# 🏗 Tech Stack

| Category         | Technology       |
| ---------------- | ---------------- |
| Runtime          | Node.js 22+      |
| Language         | TypeScript       |
| Framework        | Express.js       |
| Database         | MongoDB          |
| ODM              | Mongoose         |
| Authentication   | JWT              |
| Validation       | Zod              |
| Password Hashing | bcrypt           |
| Image Storage    | Cloudinary       |
| Testing          | Jest + Supertest |
| Linting          | ESLint           |
| Formatting       | Prettier         |

---

# 📁 Project Structure

```text
src/
├── core/
│   ├── config/
│   ├── constants/
│   ├── errors/
│   ├── middlewares/
│   ├── models/
│   ├── types/
│   └── utils/
│
├── features/
│   ├── auth/
│   ├── reports/
│   └── ...
│
├── app.ts
└── server.ts

tests/
├── integration/
├── unit/
└── fixtures/
```

---

# 🚀 Getting Started

## Prerequisites

Before you begin, ensure you have installed:

- Node.js 22+
- npm 10+
- MongoDB 6+
- Git

---

## Clone the Repository

```bash
git clone https://github.com/circorangeintern/Quantum-circle/

cd speaksafe-backend
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Copy the example environment file.

```bash
cp .env.example .env
```

Configure the values inside `.env`.

Example:

```env
PORT=5000

NODE_ENV=development

MONGODB_URI=

JWT_SECRET=

JWT_EXPIRES_IN=15m

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---

## Run Development Server

```bash
npm run dev
```

Server starts at

```
http://localhost:5000
```

---

# 📦 Available Scripts

| Command                  | Description                   |
| ------------------------ | ----------------------------- |
| npm run dev              | Start development server      |
| npm run build            | Compile TypeScript            |
| npm start                | Run production server         |
| npm test                 | Run all tests                 |
| npm run test:watch       | Watch tests                   |
| npm run test:integration | Integration tests             |
| npm run test:unit        | Unit tests                    |
| npm run lint             | Run ESLint                    |
| npm run lint:fix         | Automatically fix lint issues |
| npm run format           | Format code                   |
| npm run clean            | Remove build files            |

---

# 🧪 Testing

Run all tests

```bash
npm test
```

Run unit tests

```bash
npm run test:unit
```

Run integration tests

```bash
npm run test:integration
```

Run coverage

```bash
npm test -- --coverage
```

---

# 🔐 Security

SpeakSafe follows security best practices including:

- HTTP-only authentication cookies
- JWT authentication
- Input validation
- Request sanitization
- Rate limiting
- Password hashing with bcrypt
- Environment variable management

For more information, see the **Security Policy**.

---

# 📚 Documentation

| Document           | Description          |
| ------------------ | -------------------- |
| CONTRIBUTING.md    | Development guide    |
| SECURITY.md        | Security policy      |
| CHANGELOG.md       | Version history      |
| CODE_OF_CONDUCT.md | Community guidelines |

---

# 🌱 Branch Strategy

We follow a Git Flow inspired workflow.

```
main
│
develop
├── feature/*
├── bugfix/*
├── hotfix/*
└── release/*
```

---

# 💻 Development Workflow

1. Create or pick a Jira issue
2. Create a feature branch
3. Implement your changes
4. Write or update tests
5. Run linting and formatting
6. Open a Pull Request
7. Address review feedback
8. Merge after approval

---

# 📖 API Documentation

Swagger/OpenAPI documentation will be available after the first public release.

---

# 🤝 Contributing

We welcome contributions from everyone.

Please read

**➡️ CONTRIBUTING.md**

before opening an issue or Pull Request.

---

# 📜 Code of Conduct

This project follows a Code of Conduct to ensure a welcoming environment for all contributors.

Please read

**➡️ CODE_OF_CONDUCT.md**

---

# 🔒 Security

If you discover a security vulnerability, **please do not create a public GitHub issue.**

Instead, follow the instructions in

**➡️ SECURITY.md**

---

# 🗺 Roadmap

- [ ] Authentication
- [ ] Anonymous Report Submission
- [ ] File Uploads
- [ ] Admin Dashboard APIs
- [ ] Email Notifications
- [ ] Swagger Documentation
- [ ] Docker Support
- [ ] CI/CD Pipeline
- [ ] Production Deployment

---

# 📄 License

This project is licensed under the MIT License.

See the **LICENSE** file for more information.

---

# 🙏 Acknowledgements

Developed by **Diebere** and the **Quantum Circle Team** under the **Circo Orange Internship Program**.

Special thanks to everyone contributing to making schools safer through technology.

---

⭐ If you find this project useful, consider giving it a star on GitHub.
