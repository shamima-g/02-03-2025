// Type augmentation for vitest-axe v1 compatibility with Vitest v4.
// Makes `expect(axeResults).toHaveNoViolations()` type-safe.
// The `export {}` turns this into a module file, enabling declare module augmentation.
export {};

declare module '@vitest/expect' {
  interface Assertion<T> {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
