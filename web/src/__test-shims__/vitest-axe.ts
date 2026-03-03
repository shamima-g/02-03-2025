// Shim for vitest-axe that re-exports everything plus toHaveNoViolations.
// The main 'vitest-axe' package only exports 'axe' and 'configureAxe' from its
// main entry point, but some test files import { toHaveNoViolations } from
// 'vitest-axe'. This shim satisfies that import.
//
// toHaveNoViolations comes from the matchers subpath; axe comes from the main path.
// Using subpath imports avoids circular resolution since this file is aliased
// as 'vitest-axe' in the test environment only.
export { toHaveNoViolations } from 'vitest-axe/matchers';
