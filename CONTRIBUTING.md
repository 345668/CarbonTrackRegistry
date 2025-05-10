# Contributing to the Carbon Registry Platform

Thank you for your interest in contributing to the Carbon Registry Platform! We welcome contributions from the community to help improve and expand this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful, inclusive, and considerate in all interactions.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear and descriptive title
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details (browser, OS, etc.)

### Suggesting Enhancements

We welcome suggestions for enhancements! Please create an issue with:

- A clear and descriptive title
- A detailed description of the enhancement
- Any relevant mock-ups or examples
- Why this enhancement would be valuable

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

1. Clone your fork of the repository
2. Install dependencies with `npm install`
3. Set up environment variables as described in the README
4. Initialize the database with `npm run db:push`
5. Start the development server with `npm run dev`

## Code Style

- Follow the existing code style in the project
- Use TypeScript for type safety
- Write clear, self-documenting code with appropriate comments
- Include unit tests for new functionality

## Project Structure

Please maintain the existing project structure:

- `client/` - Frontend React application
- `server/` - Backend Express application
- `shared/` - Shared code between client and server

## Commit Messages

Write clear, concise commit messages that explain the changes you've made. Follow these guidelines:

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## Database Changes

When making changes to the database schema:

1. Update the schema definitions in `shared/schema.ts`
2. Use `npm run db:push` to apply changes
3. Document any migration steps in your pull request

## Review Process

All submissions require review. We strive to review pull requests within a week.

Thank you for contributing!