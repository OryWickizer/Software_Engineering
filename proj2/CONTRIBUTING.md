# Contributing to EcoBites

Thank you for your interest in contributing to EcoBites! We welcome contributions from the community to help make sustainable food delivery a reality.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## How to Contribute

### Reporting Issues

- Use GitHub Issues to report bugs or request features
- Provide detailed steps to reproduce bugs
- Include environment details (OS, Node.js version, browser)
- For security issues, please email ory.wickizer@gmail.com instead of creating a public issue

### Development Workflow

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** from `main`
4. **Make your changes** following our coding standards
5. **Run tests** to ensure everything works
6. **Commit your changes** with clear, descriptive messages
7. **Push to your fork** and **create a pull request**

### Setting Up Development Environment

Follow the [installation guide](INSTALL.md) to set up the project locally.

## Coding Standards

### General Guidelines

- Write clear, readable, and maintainable code
- Add comments for complex logic
- Keep functions small and focused on a single responsibility
- Use meaningful variable and function names
- Follow the existing code style in the project

### JavaScript/React Standards

- Use modern ES6+ features
- Prefer `const` over `let` when possible
- Use arrow functions for callbacks
- Destructure objects and arrays appropriately
- Handle errors gracefully with try/catch or proper error boundaries

### Backend (Node.js/Express)

- Use async/await for asynchronous operations
- Validate input data thoroughly
- Implement proper error handling and logging
- Follow RESTful API conventions
- Use meaningful HTTP status codes

### Frontend (React)

- Use functional components with hooks
- Keep components small and reusable
- Manage state appropriately (local vs global)
- Use proper TypeScript types (where applicable)
- Implement accessibility features (ARIA labels, keyboard navigation)

### Testing

- Write unit tests for new functions and components
- Write integration tests for API endpoints
- Aim for good test coverage (>80%)
- Use descriptive test names
- Test both success and error scenarios

### Commit Messages

Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add JWT token refresh functionality
fix(order): resolve duplicate order creation bug
docs(readme): update installation instructions
```

### Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed
- Request review from maintainers

### Code Review Process

1. Automated checks (linting, tests) must pass
2. At least one maintainer review required
3. Address review feedback promptly
4. Maintainers will merge approved PRs

## Project Structure

```
proj2/
├── Ecobites/
│   ├── client/          # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── api/
│   │   │   └── ...
│   │   ├── tests/
│   │   └── ...
│   └── server/          # Express backend
│       ├── src/
│       │   ├── controllers/
│       │   ├── models/
│       │   ├── routes/
│       │   └── ...
│       ├── tests/
│       └── ...
├── docs/                # Documentation
├── .gitignore
├── README.md
├── INSTALL.md
├── LICENSE.md
└── ...
```

## Tools and Technologies

### Required
- Node.js 18+
- npm 8+
- MongoDB
- Git

### Recommended
- VS Code with ESLint and Prettier extensions
- Postman or similar for API testing
- MongoDB Compass for database management

## Getting Help

- Check existing issues and documentation first
- Join our community discussions
- Contact maintainers for guidance

## Recognition

Contributors will be recognized in the project README and release notes. Significant contributions may lead to maintainer status.

Thank you for helping make EcoBites better! 🌱🍽️
