# Changelog

All notable changes to EcoBites will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive API documentation (`docs/api.md`)
- Expanded function reference in `docs/what.md`
- Release history and changelog (`CHANGELOG.md`)
- Updated README.md with new documentation links

### Documentation
- Complete API endpoint documentation with examples
- Detailed component and function descriptions
- Changelog following Keep a Changelog format

## [0.2.0] - 2024-01-XX

### Added
- Order combination feature for delivery optimization
- Eco-rewards system with packaging preferences
- Driver incentives based on vehicle type
- Order status tracking with history
- Real-time order updates

### Changed
- Enhanced order management with status workflows
- Improved user experience with eco-rewards feedback

## [0.1.0] - 2024-01-XX

### Added
- Basic user authentication (register/login)
- Role-based access control (customer/restaurant/driver)
- Restaurant and menu management
- Order placement system
- Initial API endpoints
- Frontend React application structure
- Backend Express.js API with MongoDB
- Unit and integration tests
- CI/CD pipeline with GitHub Actions
- Basic documentation (how, what, why)

### Technical
- React 18 frontend with Vite and Tailwind CSS
- Express.js backend with Mongoose ODM
- JWT authentication
- Jest testing framework
- ESLint and Prettier code quality tools

---

## Types of Changes
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities

---

## Contributing

Please follow these guidelines when updating the changelog:

1. Add new entries to the `[Unreleased]` section at the top
2. Use present tense for changes ("Add feature" not "Added feature")
3. Group similar changes together
4. Reference issue/PR numbers when applicable
5. Keep descriptions concise but informative

Example:
```
### Added
- New eco-rewards calculation for order combinations (#123)

### Fixed
- Order status update race condition (#456)
```
