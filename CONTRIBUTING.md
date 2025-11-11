# Contributing to Sourceless Stratus Blockchain

Thank you for your interest in contributing to Sourceless Stratus Blockchain! 

**Created with ❤️ by Alexandru Marius Stratulat and Sourceless Team**

---

## 🤝 How to Contribute

We welcome contributions in the form of:

- 🐛 Bug reports
- ✨ Feature requests
- 📝 Documentation improvements
- 🔧 Code contributions
- 🧪 Test coverage improvements

---

## 📋 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Our Standards

- ✅ Be respectful and inclusive
- ✅ Welcome newcomers and help them learn
- ✅ Focus on what is best for the community
- ✅ Show empathy towards other community members

### Unacceptable Behavior

- ❌ Harassment or discriminatory language
- ❌ Trolling or insulting comments
- ❌ Public or private harassment
- ❌ Publishing others' private information

---

## 🚀 Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/sourceless-stratus-blockchain.git
cd sourceless-stratus-blockchain
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev:server
```

### 3. Create a Branch

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or a bugfix branch
git checkout -b fix/your-bugfix-name
```

---

## 💻 Development Guidelines

### Code Style

- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Use clear, descriptive commit messages:

```bash
# Good ✅
git commit -m "Add input validation to wallet endpoint"
git commit -m "Fix memory leak in genesis node manager"
git commit -m "Update README with deployment instructions"

# Bad ❌
git commit -m "fix stuff"
git commit -m "update"
git commit -m "changes"
```

### Testing

- Add tests for new features
- Ensure existing tests pass
- Test both success and error cases

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

---

## 📝 Pull Request Process

### 1. Update Your Branch

```bash
# Fetch latest changes
git fetch upstream
git rebase upstream/main
```

### 2. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

- Go to GitHub and create a Pull Request
- Fill out the PR template completely
- Link related issues
- Request review from maintainers

### 4. PR Requirements

✅ **Code Quality**
- No linting errors
- Code follows project style
- Functions are well-documented

✅ **Testing**
- New code is tested
- All existing tests pass
- Test coverage maintained or improved

✅ **Documentation**
- README updated if needed
- API docs updated for new endpoints
- Comments added for complex code

✅ **Security**
- No security vulnerabilities introduced
- Input validation added where needed
- Error handling implemented

---

## 🐛 Reporting Bugs

### Before Reporting

- Check existing issues
- Test with latest version
- Verify it's reproducible

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Start server with '...'
2. Send request to '...'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Environment**
- OS: [e.g., Windows 11, Ubuntu 22.04]
- Node.js version: [e.g., 18.17.0]
- npm version: [e.g., 9.6.7]

**Logs**
```
Paste relevant error messages or logs
```

**Additional context**
Any other relevant information.
```

---

## ✨ Suggesting Features

### Feature Request Template

```markdown
**Feature Description**
Clear description of the proposed feature.

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
What other solutions did you consider?

**Additional Context**
Screenshots, mockups, or examples.
```

---

## 🔒 Security Issues

**DO NOT** create public issues for security vulnerabilities.

Instead, email: **security@sourceless.io**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

All contributions must include:

```javascript
/**
 * Created by AM Stratulat and Sourceless Team with love.
 * Copyright (c) 2024-2025 Alexandru Marius Stratulat
 * Licensed under MIT License
 */
```

---

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

---

## 📞 Questions?

- **GitHub Discussions:** https://github.com/alexccoin/sourceless-stratus-blockchain/discussions
- **Email:** team@sourceless.io
- **Discord:** https://discord.gg/sourceless

---

**Thank you for contributing to Sourceless Stratus Blockchain!**

Made with ❤️ by Alexandru Marius Stratulat and Sourceless Team
