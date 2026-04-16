/**
 * Test failure analysis tool
 * Helps identify patterns in test failures for debugging
 */

import fs from 'fs';
import path from 'path';

interface FailurePattern {
  pattern: string;
  count: number;
  tests: string[];
}

/**
 * Analyze test failures and identify common patterns
 */
export function analyzeFailures(reportPath: string): FailurePattern[] {
  if (!fs.existsSync(reportPath)) {
    return [];
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  const failures: Array<{ title: string; error: string }> = [];

  function collectFailures(suites: unknown[]): void {
    for (const suite of suites as Array<{ title: string; tests: Array<{ status: string; title: string; error?: string }>; suites?: unknown[] }>) {
      for (const test of suite.tests || []) {
        if (test.status === 'failed' && test.error) {
          failures.push({ title: test.title, error: test.error });
        }
      }
      if (suite.suites) {
        collectFailures(suite.suites);
      }
    }
  }

  collectFailures(report.suites || []);

  // Group failures by error pattern
  const patterns = new Map<string, FailurePattern>();

  for (const failure of failures) {
    const errorLine = failure.error.split('\n')[0];
    const key = errorLine.substring(0, 100);

    if (!patterns.has(key)) {
      patterns.set(key, { pattern: key, count: 0, tests: [] });
    }

    const pattern = patterns.get(key)!;
    pattern.count++;
    pattern.tests.push(failure.title);
  }

  return Array.from(patterns.values()).sort((a, b) => b.count - a.count);
}

/**
 * Generate a regression prevention checklist
 */
export function generateRegressionChecklist(): string {
  return `# E2E Test Regression Prevention Checklist

## Before Merging a PR

- [ ] All E2E tests pass locally
- [ ] New features have corresponding E2E tests
- [ ] Modified UI components have updated selectors in page objects
- [ ] Test data files are cleaned up after tests
- [ ] No hardcoded timeouts (use waitForVisible instead)
- [ ] Tests use semantic selectors (data-testid, role, etc.)

## After Deployment

- [ ] Run smoke tests against production
- [ ] Verify critical user flows work end-to-end
- [ ] Check test reports for any new failures

## Weekly Maintenance

- [ ] Review flaky test reports
- [ ] Update selectors if UI has changed
- [ ] Archive old test artifacts
- [ ] Review and update test data

## Monthly Review

- [ ] Assess test coverage gaps
- [ ] Remove obsolete tests
- [ ] Update documentation
- [ ] Review CI/CD performance
`;
}

// CLI usage
if (process.argv[2] === '--analyze') {
  const reportPath = path.resolve('./playwright-report/results.json');
  const patterns = analyzeFailures(reportPath);

  if (patterns.length === 0) {
    console.log('No failures found!');
  } else {
    console.log('\n=== Failure Analysis ===\n');
    patterns.forEach(p => {
      console.log(`Pattern (${p.count}x): ${p.pattern}`);
      p.tests.forEach(t => console.log(`  - ${t}`));
      console.log();
    });
  }
}

if (process.argv[2] === '--checklist') {
  console.log(generateRegressionChecklist());
}
