# GitHub Templates

This directory contains GitHub-specific configuration and templates.

## 📂 Directory Structure

```
.github/
├── ISSUE_TEMPLATE/          # Issue templates
│   ├── bug_report.md       # Bug report template
│   ├── feature_request.md  # Feature request template
│   ├── question.md         # Question template
│   └── config.yml          # Issue template configuration
├── workflows/               # GitHub Actions workflows
│   ├── ci.yml              # Continuous integration
│   ├── release.yml         # Release automation
│   └── security.yml        # Security audits
├── CONTRIBUTING.md          # Contributing guidelines (short version)
├── FUNDING.yml             # Sponsorship configuration
├── labels.yml              # Issue/PR labels
├── dependabot.yml          # Dependency updates config
└── pull_request_template.md # Pull request template
```

## 🔧 Templates

### Issue Templates

We provide three types of issue templates:

1. **Bug Report** - For reporting bugs
2. **Feature Request** - For suggesting new features
3. **Question** - For asking questions

These templates help maintain consistency and ensure all necessary information is provided.

### Pull Request Template

The PR template includes sections for:
- Description of changes
- Type of change
- Testing information
- Checklist

## 🔄 Workflows

### CI Workflow

Runs on every push and pull request to `main` and `develop` branches:
- Linting
- Building
- Testing

### Release Workflow

Automatically triggered when a new tag is pushed:
- Builds the application for multiple platforms
- Creates a GitHub release
- Uploads build artifacts

### Security Workflow

Runs weekly security audits:
- npm audit
- cargo audit

## 🏷️ Labels

See `labels.yml` for the complete list of labels used in this project.

Categories:
- Type (bug, enhancement, etc.)
- Priority (critical, high, medium, low)
- Status (blocked, in progress, etc.)
- Topic (frontend, backend, etc.)
- Experience level (good first issue, help wanted)

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Issue Templates Documentation](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
