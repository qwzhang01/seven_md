/**
 * Test coverage analysis script
 * Analyzes test results and generates coverage metrics
 */

import fs from 'fs';
import path from 'path';

interface TestResult {
  title: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

interface TestSuite {
  title: string;
  tests: TestResult[];
  suites?: TestSuite[];
}

interface PlaywrightReport {
  stats: {
    expected: number;
    unexpected: number;
    skipped: number;
    duration: number;
  };
  suites: TestSuite[];
}

/**
 * Analyze test results and generate a coverage report
 */
function analyzeTestResults(reportPath: string): void {
  if (!fs.existsSync(reportPath)) {
    console.error(`Report not found: ${reportPath}`);
    process.exit(1);
  }

  const report: PlaywrightReport = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  const { stats } = report;

  const total = stats.expected + stats.unexpected + stats.skipped;
  const passRate = total > 0 ? ((stats.expected / total) * 100).toFixed(1) : '0';

  console.log('\n=== E2E Test Coverage Report ===\n');
  console.log(`Total Tests:  ${total}`);
  console.log(`Passed:       ${stats.expected} (${passRate}%)`);
  console.log(`Failed:       ${stats.unexpected}`);
  console.log(`Skipped:      ${stats.skipped}`);
  console.log(`Duration:     ${(stats.duration / 1000).toFixed(1)}s`);

  // Identify failing tests
  if (stats.unexpected > 0) {
    console.log('\n=== Failed Tests ===\n');
    collectFailedTests(report.suites).forEach(test => {
      console.log(`  ✗ ${test.title}`);
      if (test.error) {
        console.log(`    Error: ${test.error.split('\n')[0]}`);
      }
    });
  }

  // Generate coverage by feature area
  console.log('\n=== Coverage by Feature Area ===\n');
  const areas = categorizeTests(report.suites);
  Object.entries(areas).forEach(([area, tests]) => {
    const passed = tests.filter(t => t.status === 'passed').length;
    const areaTotal = tests.length;
    const areaRate = areaTotal > 0 ? ((passed / areaTotal) * 100).toFixed(0) : '0';
    console.log(`  ${area}: ${passed}/${areaTotal} (${areaRate}%)`);
  });

  console.log('\n================================\n');
}

function collectFailedTests(suites: TestSuite[]): TestResult[] {
  const failed: TestResult[] = [];
  for (const suite of suites) {
    for (const test of suite.tests) {
      if (test.status === 'failed') {
        failed.push(test);
      }
    }
    if (suite.suites) {
      failed.push(...collectFailedTests(suite.suites));
    }
  }
  return failed;
}

function categorizeTests(suites: TestSuite[]): Record<string, TestResult[]> {
  const areas: Record<string, TestResult[]> = {};

  function processSuite(suite: TestSuite, prefix = '') {
    const area = prefix || suite.title || 'General';
    if (!areas[area]) areas[area] = [];
    areas[area].push(...suite.tests);
    if (suite.suites) {
      suite.suites.forEach(s => processSuite(s, suite.title));
    }
  }

  suites.forEach(s => processSuite(s));
  return areas;
}

// Run analysis
const reportPath = path.resolve('./playwright-report/results.json');
analyzeTestResults(reportPath);
