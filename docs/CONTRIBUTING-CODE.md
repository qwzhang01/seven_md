# Contributing Code

Thank you for your interest in contributing to Seven MD! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)

---

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow GitHub's community guidelines

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Rust** 1.70+ (stable channel)
- **macOS** 10.15+ (for development)
- **Git** for version control

### Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/seven_md.git
cd seven_md

# Add upstream remote
git remote add upstream https://github.com/original/seven_md.git
```

---

## Development Setup

### Install Dependencies

```bash
# Install frontend dependencies
npm install

# Rust dependencies are installed automatically
cd src-tauri && cargo build
```

### Run Development Server

```bash
# Start development mode with hot reload
npm run tauri dev
```

### Verify Setup

```bash
# Run tests
npm run test

# Run linting
npm run lint

# Run type check
npm run typecheck
```

---

## Project Structure

```
seven_md/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── context/            # React context providers
│   ├── reducers/           # State reducers
│   ├── types/              # TypeScript types
│   ├── locales/            # i18n translations
│   ├── i18n/               # i18n configuration
│   └── tests/              # Integration tests
│
├── src-tauri/              # Backend (Rust) source code
│   ├── src/
│   │   ├── main.rs         # Application entry
│   │   ├── lib.rs          # Library exports
│   │   ├── commands.rs     # Tauri commands
│   │   ├── logger.rs       # Logging module
│   │   └── menu.rs         # Menu setup
│   └── Cargo.toml          # Rust dependencies
│
├── docs/                   # Documentation
├── .github/                # GitHub workflows
└── coverage/               # Coverage reports
```

---

## Coding Standards

### TypeScript/React

#### File Naming

- Components: `ComponentName.tsx`
- Hooks: `useHookName.ts`
- Utilities: `utilName.ts`
- Tests: `fileName.test.ts` or `ComponentName.test.tsx`

#### Component Structure

```tsx
// 1. Imports
import { useState } from 'react'
import { createLogger } from '../utils/logger'

// 2. Types
interface MyComponentProps {
  title: string
  onClick?: () => void
}

// 3. Logger
const logger = createLogger('MyComponent')

// 4. Component
export function MyComponent({ title, onClick }: MyComponentProps) {
  // 4a. State
  const [isOpen, setIsOpen] = useState(false)
  
  // 4b. Hooks
  const { metrics } = usePerformanceMonitor('MyComponent')
  
  // 4c. Effects
  useEffect(() => {
    logger.debug('Component mounted')
    return () => logger.debug('Component unmounted')
  }, [])
  
  // 4d. Handlers
  const handleClick = () => {
    logger.info('Button clicked')
    onClick?.()
  }
  
  // 4e. Render
  return (
    <div className="my-component">
      <h1>{title}</h1>
      <button onClick={handleClick}>Click me</button>
    </div>
  )
}
```

#### Styling Guidelines

- Use Tailwind CSS classes
- Follow existing color palette
- Ensure responsive design
- Support both light and dark themes

```tsx
// Good: Tailwind classes with theme support
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
```

#### Import Order

```tsx
// 1. React
import { useState, useEffect } from 'react'

// 2. External libraries
import { invoke } from '@tauri-apps/api/core'

// 3. Internal modules (by path depth)
import { useAppState } from '../context/AppContext'
import { createLogger } from '../utils/logger'
import { Button } from './Button'

// 4. Types
import type { FileTreeNode } from '../types'
```

### Rust

#### Naming Conventions

- Functions: `snake_case`
- Types: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Modules: `snake_case`

#### Code Organization

```rust
// 1. Imports
use std::path::Path;
use log::{debug, error};

// 2. Constants
const MAX_FILE_SIZE: usize = 10 * 1024 * 1024;

// 3. Types
pub struct FileInfo {
    pub path: String,
    pub content: String,
}

// 4. Implementations
impl FileInfo {
    pub fn new(path: String, content: String) -> Self {
        Self { path, content }
    }
}

// 5. Functions
pub fn read_file(path: &str) -> Result<String, String> {
    debug!("Reading file: {}", path);
    // ...
}

// 6. Tests
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_read_file() {
        // ...
    }
}
```

#### Error Handling

```rust
// Use Result with descriptive error messages
pub fn my_function() -> Result<String, String> {
    let result = some_operation()
        .map_err(|e| format!("Failed to perform operation: {}", e))?;
    Ok(result)
}
```

---

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Code style (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding/updating tests |
| `chore` | Build/config changes |
| `perf` | Performance improvement |

### Examples

```
feat(editor): add syntax highlighting for code blocks

Add syntax highlighting support for JavaScript, Python, and Rust
code blocks in the preview pane.

Closes #123
```

```
fix(file-ops): handle file permission errors gracefully

Show user-friendly error message when file read fails
due to permission issues instead of crashing.

Fixes #456
```

### Commit Best Practices

- Write clear, descriptive messages
- Keep commits focused (one logical change per commit)
- Reference issues when applicable
- Use imperative mood ("add feature" not "added feature")

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks**
   ```bash
   npm run lint
   npm run typecheck
   npm run test
   cd src-tauri && cargo test && cargo clippy
   ```

3. **Update documentation** if needed

4. **Add/update tests** for your changes

### PR Title

Use the same format as commit messages:

```
feat(component): add new feature
```

### PR Description Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested these changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated
```

### Review Process

1. All PRs require at least one review
2. CI checks must pass
3. Address all review comments
4. Squash commits before merge (if requested)

---

## Testing Requirements

### Test Coverage

- New features must include tests
- Bug fixes should include regression tests
- Maintain minimum 80% coverage

### What to Test

#### Components

```tsx
describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should handle user interactions', async () => {
    const onClick = vi.fn()
    render(<MyComponent onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalled()
  })

  it('should handle edge cases', () => {
    render(<MyComponent title="" />)
    // Test empty state
  })
})
```

#### Hooks

```tsx
describe('useMyHook', () => {
  it('should return expected values', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBeDefined()
  })

  it('should update state correctly', () => {
    const { result } = renderHook(() => useMyHook())
    act(() => {
      result.current.setValue('new')
    })
    expect(result.current.value).toBe('new')
  })
})
```

#### Utilities

```ts
describe('myUtil', () => {
  it.each([
    ['input1', 'expected1'],
    ['input2', 'expected2'],
  ])('should handle %s', (input, expected) => {
    expect(myUtil(input)).toBe(expected)
  })
})
```

---

## Questions?

If you have questions:

1. Check existing documentation
2. Search existing issues
3. Create a new issue with the "question" label

Thank you for contributing to Seven MD! 🎉
