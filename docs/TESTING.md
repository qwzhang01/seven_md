# Testing Guide

This guide explains how to run and write tests for Seven MD.

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Coverage Requirements](#coverage-requirements)
- [Continuous Integration](#continuous-integration)

---

## Overview

Seven MD uses the following testing frameworks:

| Layer | Framework | Purpose |
|-------|-----------|---------|
| Frontend Unit | Vitest + React Testing Library | Component and hook tests |
| Frontend Integration | Vitest | Integration tests |
| Backend Unit | Rust built-in | Rust command tests |
| E2E | Manual testing | User flow validation |

## Running Tests

### Run All Tests

```bash
# Run all frontend tests
npm run test

# Run all Rust tests
cd src-tauri && cargo test
```

### Run Specific Tests

```bash
# Run specific test file
npm run test -- src/hooks/useFileOperations.test.tsx

# Run tests matching a pattern
npm run test -- --grep "useTheme"

# Run Rust tests for specific module
cd src-tauri && cargo test commands
```

### Watch Mode

```bash
# Run tests in watch mode
npm run test:watch
```

### Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# Coverage reports are saved to coverage/
```

## Test Structure

### Frontend Test Structure

```
src/
├── components/
│   ├── ComponentName/
│   │   └── ComponentName.test.tsx
│   └── ...
├── hooks/
│   ├── hookName.test.ts
│   └── ...
├── utils/
│   ├── utilName.test.ts
│   └── ...
└── tests/
    └── integration/
        ├── feature.test.tsx
        └── ...
```

### Backend Test Structure

```rust
// In Rust files, tests are inline
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_function_name() {
        // test code
    }
}
```

## Writing Tests

### Component Tests

Use React Testing Library for component tests:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should handle click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    
    render(<MyComponent onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

### Hook Tests

Use `renderHook` for testing hooks:

```tsx
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
})
```

### Utility Tests

Simple unit tests for utility functions:

```ts
import { formatDate, parsePath } from './utils'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-01-15')
    expect(formatDate(date)).toBe('2024-01-15')
  })
})
```

### Integration Tests

Integration tests verify multiple components work together:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../App'

describe('File Operations', () => {
  it('should open and display file content', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Open file dialog
    await user.click(screen.getByText('Open'))
    
    // Verify file content displayed
    // ...
  })
})
```

### Rust Backend Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_read_file() {
        // Test file reading
        let result = read_file("test.md");
        assert!(result.is_ok());
    }

    #[test]
    fn test_error_handling() {
        // Test error cases
        let result = read_file("nonexistent.md");
        assert!(result.is_err());
    }
}
```

## Coverage Requirements

### Minimum Coverage

- **Overall**: 80%
- **Core components**: 90%
- **Utilities**: 85%
- **Hooks**: 80%

### Check Coverage

```bash
# Run coverage and check thresholds
npm run test:coverage

# Coverage summary is displayed after tests
```

### Coverage Configuration

Coverage is configured in `vitest.config.ts`:

```ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'lcov', 'html'],
  threshold: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80
  }
}
```

## Continuous Integration

All tests run automatically in GitHub Actions CI:

### CI Test Steps

1. **Frontend Tests**
   ```yaml
   - name: Run frontend tests
     run: npm run test:run
   
   - name: Generate coverage
     run: npm run test:coverage
   ```

2. **Backend Tests**
   ```yaml
   - name: Run Rust tests
     run: cd src-tauri && cargo test
   ```

3. **Coverage Upload**
   ```yaml
   - name: Upload to Codecov
     uses: codecov/codecov-action@v3
   ```

### CI Requirements

- All tests must pass
- Coverage must meet minimum thresholds
- No TypeScript or Rust compilation errors
- No linting errors

## Best Practices

### 1. Test Behavior, Not Implementation

```tsx
// Good: Test user-visible behavior
expect(screen.getByText('Welcome')).toBeInTheDocument()

// Bad: Test implementation details
expect(component.state.isOpen).toBe(true)
```

### 2. Use User-Centric Queries

```tsx
// Preferred order:
// 1. getByRole
// 2. getByLabelText
// 3. getByPlaceholderText
// 4. getByText
// 5. getByTestId (last resort)
```

### 3. Test Error States

```tsx
it('should show error message on failure', async () => {
  // Mock error response
  mockApi.rejects(new Error('Network error'))
  
  render(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })
})
```

### 4. Clean Up After Tests

```tsx
afterEach(() => {
  vi.clearAllMocks()
  cleanup()
})
```

### 5. Use Descriptive Test Names

```tsx
// Good
it('should display error message when file is not found', () => {})

// Bad
it('error', () => {})
```

## Troubleshooting

### Tests Failing Locally

1. Clear node modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Clear Vitest cache:
   ```bash
   rm -rf node_modules/.vitest
   ```

3. Check for environment differences

### Coverage Not Meeting Threshold

1. Run coverage report to see uncovered lines
2. Focus on high-impact areas first
3. Add tests for edge cases and error paths

### Flaky Tests

1. Ensure proper cleanup in `afterEach`
2. Use `waitFor` for async operations
3. Avoid real timers - use `vi.useFakeTimers()`
