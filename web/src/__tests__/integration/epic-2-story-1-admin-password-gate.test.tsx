/**
 * Story Metadata:
 * - Route: /admin
 * - Target File: app/admin/page.tsx
 * - Page Action: create_new
 *
 * Tests for Epic 2, Story 1: Admin Inbox — Password Gate.
 *
 * Verifies that the /admin page renders a password gate, correctly unlocks
 * the inbox on a matching password, shows an inline error and clears the
 * input on an incorrect password, and supports keyboard (Enter key) submission.
 *
 * No API calls occur in Story 1 — the password check is purely client-side
 * against process.env.NEXT_PUBLIC_ADMIN_PASSWORD (BR8).
 *
 * Component under test: AdminPasswordGate (imported from @/components/AdminPasswordGate)
 * This import WILL FAIL until the component is implemented — that is the point.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Import the REAL AdminPasswordGate component.
// This import WILL FAIL until the component is implemented — that is the point.
import { AdminPasswordGate } from '@/components/AdminPasswordGate';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEST_PASSWORD = 'test-secret-password';

function renderAdminPasswordGate() {
  return render(<AdminPasswordGate />);
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('Epic 2 Story 1 — Admin Inbox: Password Gate', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_ADMIN_PASSWORD', TEST_PASSWORD);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // -------------------------------------------------------------------------
  // Page Renders the Password Gate
  // -------------------------------------------------------------------------
  describe('Page renders the password gate', () => {
    it('shows a heading that identifies the admin area', () => {
      renderAdminPasswordGate();
      expect(
        screen.getByRole('heading', { name: /admin inbox/i }),
      ).toBeInTheDocument();
    });

    it('shows a password input field with a visible label', () => {
      renderAdminPasswordGate();
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toBeInTheDocument();
    });

    it('renders the password input with type="password" so characters are hidden', () => {
      renderAdminPasswordGate();
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('shows a submit button to unlock the inbox', () => {
      renderAdminPasswordGate();
      const submitButton = screen.getByRole('button', {
        name: /unlock|enter/i,
      });
      expect(submitButton).toBeInTheDocument();
    });

    it('does not show the inbox content on initial render', () => {
      renderAdminPasswordGate();
      // The inbox area must not be visible before the correct password is entered
      expect(
        screen.queryByRole('region', { name: /inbox/i }),
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Correct Password Unlocks the Inbox
  // -------------------------------------------------------------------------
  describe('Correct password unlocks the inbox', () => {
    it('hides the password gate after the correct password is submitted', async () => {
      const user = userEvent.setup();
      renderAdminPasswordGate();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, TEST_PASSWORD);
      await user.click(screen.getByRole('button', { name: /unlock|enter/i }));

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: /unlock|enter/i }),
        ).not.toBeInTheDocument();
      });
    });

    it('shows the inbox area after the correct password is submitted', async () => {
      const user = userEvent.setup();
      renderAdminPasswordGate();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, TEST_PASSWORD);
      await user.click(screen.getByRole('button', { name: /unlock|enter/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /inbox/i }),
        ).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Wrong Password Shows an Error
  // -------------------------------------------------------------------------
  describe('Wrong password shows an error', () => {
    it('shows an inline error message when the wrong password is submitted', async () => {
      const user = userEvent.setup();
      renderAdminPasswordGate();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'wrong-password');
      await user.click(screen.getByRole('button', { name: /unlock|enter/i }));

      await waitFor(() => {
        expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
      });
    });

    it('keeps the password gate visible after an incorrect password is submitted', async () => {
      const user = userEvent.setup();
      renderAdminPasswordGate();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'wrong-password');
      await user.click(screen.getByRole('button', { name: /unlock|enter/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /unlock|enter/i }),
        ).toBeInTheDocument();
      });
    });

    it('clears the password input after an incorrect password is submitted', async () => {
      const user = userEvent.setup();
      renderAdminPasswordGate();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'wrong-password');
      await user.click(screen.getByRole('button', { name: /unlock|enter/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
      });
    });
  });

  // -------------------------------------------------------------------------
  // Keyboard Submission (Enter Key)
  // -------------------------------------------------------------------------
  describe('Enter key submits the form', () => {
    it('unlocks the inbox when the correct password is submitted via the Enter key', async () => {
      const user = userEvent.setup();
      renderAdminPasswordGate();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, TEST_PASSWORD);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /inbox/i }),
        ).toBeInTheDocument();
      });
    });

    it('shows the inline error when the wrong password is submitted via the Enter key', async () => {
      const user = userEvent.setup();
      renderAdminPasswordGate();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'wrong-password');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------
  describe('Accessibility', () => {
    it('the password input and submit button are reachable via Tab key', async () => {
      const user = userEvent.setup();
      renderAdminPasswordGate();

      await user.tab();
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveFocus();

      await user.tab();
      const submitButton = screen.getByRole('button', {
        name: /unlock|enter/i,
      });
      expect(submitButton).toHaveFocus();
    });

    it('has no accessibility violations on initial render', async () => {
      const { container } = renderAdminPasswordGate();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no accessibility violations after an incorrect password submission', async () => {
      const user = userEvent.setup();
      const { container } = renderAdminPasswordGate();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'wrong-password');
      await user.click(screen.getByRole('button', { name: /unlock|enter/i }));

      await waitFor(() => {
        expect(screen.getByText(/incorrect password/i)).toBeInTheDocument();
      });

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no accessibility violations after the inbox is unlocked', async () => {
      const user = userEvent.setup();
      const { container } = renderAdminPasswordGate();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, TEST_PASSWORD);
      await user.click(screen.getByRole('button', { name: /unlock|enter/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /inbox/i }),
        ).toBeInTheDocument();
      });

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
