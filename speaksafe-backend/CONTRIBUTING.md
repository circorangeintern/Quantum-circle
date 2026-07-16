# Contributing to SpeakSafe Backend

First off, thank you for taking the time to contribute! ❤️

Whether you're fixing a bug, improving documentation, proposing a new feature, or submitting your first pull request, your contributions are greatly appreciated.

Please read this guide before making any contributions.

---

# 📑 Table of Contents

- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development Workflow](#-development-workflow)
- [Git Workflow](#-git-workflow)
- [Branch Naming Convention](#-branch-naming-convention)
- [Commit Message Convention](#-commit-message-convention)
- [Pull Request Process](#-pull-request-process)
- [Code Style Guide](#-code-style-guide)
- [Testing Requirements](#-testing-requirements)
- [Documentation](#-documentation)
- [Performance Guidelines](#-performance-guidelines)
- [Review Process](#-review-process)
- [Release Process](#-release-process)
- [Need Help?](#-need-help)

---

# 🚀 Getting Started

## Prerequisites

Before contributing, ensure you have:

- Node.js 22+
- npm 10+
- MongoDB 6+
- Git

Clone the repository:

```bash
git clone https://github.com/circorangeintern/Quantum-circle/

cd speaksafe-backend
```

Install dependencies:

```bash
npm install
```

Copy environment variables:

```bash
cp .env.example .env
```

Configure your `.env` file.

Start the development server:

```bash
npm run dev
```

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

# 💻 Development Workflow

## 1. Pick a Ticket

Every contribution should be associated with a Jira issue.

Example:

```
SP-15
```

Assign the issue to yourself before starting work.

---

## 2. Create a Branch

Feature

```bash
git checkout -b feature/SP-15-report-submission
```

Bug Fix

```bash
git checkout -b bugfix/SP-23-rate-limit
```

Hotfix

```bash
git checkout -b hotfix/SP-30-auth-cookie
```

---

## 3. Develop

Useful commands:

```bash
npm run dev

npm test

npm run lint

npm run lint:fix

npm run format
```

---

## 4. Commit

We use **Conventional Commits**.

Example:

```text
feat(reports): implement report submission endpoint

- Add report validation
- Upload evidence to Cloudinary
- Generate unique reference code

Refs: SP-15
```

Push your branch:

```bash
git push origin feature/SP-15-report-submission
```

---

## 5. Open a Pull Request

Every Pull Request should include:

- A clear description
- Linked Jira issue
- Testing evidence
- Updated documentation (if applicable)

Request a review before merging.

---

# 🌱 Git Workflow

```text
main
│
develop
├── feature/*
├── bugfix/*
├── hotfix/*
└── release/*
```

---

# 🌿 Branch Naming Convention

| Type    | Format                    | Example                         |
| ------- | ------------------------- | ------------------------------- |
| Feature | feature/SP-XX-description | feature/SP-15-report-submission |
| Bug Fix | bugfix/SP-XX-description  | bugfix/SP-23-rate-limit         |
| Hotfix  | hotfix/SP-XX-description  | hotfix/SP-30-cookie-fix         |
| Release | release/vX.X.X            | release/v1.0.0                  |

---

# ✍ Commit Message Convention

We follow the **Conventional Commits** specification.

## Types

- feat
- fix
- docs
- style
- refactor
- perf
- test
- build
- ci
- chore

Example:

```text
feat(auth): implement login endpoint

- Add JWT generation
- Add HTTP-only cookies
- Add login validation

Refs: SP-15
```

---

# 🔀 Pull Request Process

## Before opening a PR

Ensure:

- [ ] Project builds successfully
- [ ] Tests pass
- [ ] Linting passes
- [ ] Code is formatted
- [ ] Documentation updated
- [ ] No sensitive information committed

---

## Pull Request Template

```markdown
## Description

## Related Issue

Closes: SP-XX

## Type of Change

- [ ] Feature
- [ ] Bug Fix
- [ ] Documentation
- [ ] Refactor
- [ ] Performance
- [ ] Tests

## Testing

- [ ] Unit Tests
- [ ] Integration Tests

## Checklist

- [ ] Builds successfully
- [ ] Tests pass
- [ ] Lint passes
- [ ] Documentation updated
```

---

# 📏 Code Style Guide

## General Rules

- Use TypeScript strict mode.
- Prefer interfaces and types over `any`.
- Keep functions focused and small.
- Write self-documenting code.
- Avoid duplicated logic.

---

## Naming Convention

| Item       | Convention       |
| ---------- | ---------------- |
| Files      | kebab-case       |
| Classes    | PascalCase       |
| Interfaces | PascalCase       |
| Types      | PascalCase       |
| Functions  | camelCase        |
| Variables  | camelCase        |
| Constants  | UPPER_SNAKE_CASE |

---

## Error Handling

Always throw meaningful errors.

Example:

```ts
throw new ApiError(404, "Report not found");
```

Never silently swallow exceptions.

---

# 🧪 Testing Requirements

Every feature should include tests.

Run all tests:

```bash
npm test
```

Run unit tests:

```bash
npm run test:unit
```

Run integration tests:

```bash
npm run test:integration
```

Run coverage:

```bash
npm test -- --coverage
```

### Testing Principles

- Test happy paths
- Test validation failures
- Test edge cases
- Test authorization
- Test error handling

Aim for **80% or higher** coverage.

---

# 📚 Documentation

When your changes affect functionality, update:

- README.md
- API documentation
- Environment variables
- Examples
- CHANGELOG.md (for release-related changes)

Document all public APIs using JSDoc where appropriate.

---

# ⚡ Performance Guidelines

Keep the application efficient by following these practices:

- Use MongoDB indexes where appropriate.
- Avoid N+1 database queries.
- Use pagination for list endpoints.
- Limit response payload sizes.
- Cache frequently accessed data when beneficial.
- Use `lean()` for read-only Mongoose queries where applicable.

---

# 👀 Review Process

Every Pull Request is reviewed for:

- Functionality
- Readability
- Maintainability
- Security
- Performance
- Testing
- Documentation

Constructive feedback is encouraged and expected.

---

# 🚀 Release Process

We follow **Semantic Versioning**.

| Version | Meaning          |
| ------- | ---------------- |
| MAJOR   | Breaking changes |
| MINOR   | New features     |
| PATCH   | Bug fixes        |

Before a release:

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version bumped
- [ ] Release approved

---

# 🤝 Community Standards

Please read our **CODE_OF_CONDUCT.md** before participating in the project.

---

# 🔒 Security

If you discover a security vulnerability, **do not open a public GitHub issue**.

Instead, follow the reporting instructions in **SECURITY.md**.

---

# ❓ Need Help?

If you have questions or need assistance:

- 📖 Read the project documentation.
- 🐛 Search existing GitHub issues.
- 💬 Contact the project maintainers.

---

Thank you for helping make **SpeakSafe** better and safer for everyone. ❤️
