/**
 * Story Metadata:
 * - Route: /
 * - Target File: app/page.tsx (via ContactForm component)
 * - Page Action: modify_existing
 *
 * Tests for Epic 1, Story 2: Contact Form — Validation, Character Counter,
 * and Error States.
 *
 * Covers:
 *  - On-submit validation of all four fields simultaneously (no API call)
 *  - Individual field validation rules
 *  - Per-field error clearing on correction
 *  - Character counter real-time updates and limit enforcement
 *  - Submit button disabled during API call / at character limit
 *  - API error banner (shown, focus, field values preserved, persists on change)
 *  - No submission when validation fails
 *
 * The API endpoint module is mocked at the module level so no real network
 * requests are made. The ContactForm component itself is imported as-is
 * (real implementation) — this import WILL FAIL until the component is
 * updated to include validation and API submission logic.
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock reCAPTCHA v3 — external library
vi.mock('react-google-recaptcha-v3', () => ({
  GoogleReCaptchaProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useGoogleReCaptcha: () => ({
    executeRecaptcha: vi.fn().mockResolvedValue('mock-recaptcha-token'),
  }),
}));

// Mock only the API contact module — we test ContactForm behaviour, not the
// HTTP client internals.
vi.mock('@/lib/api/contact', () => ({
  submitContactMessage: vi.fn(),
}));

// Import the REAL ContactForm component.
// This import WILL FAIL until the component is updated — that is the point.
import { ContactForm } from '@/components/ContactForm';
import { submitContactMessage } from '@/lib/api/contact';

// ---------------------------------------------------------------------------
// Typed mock reference
// ---------------------------------------------------------------------------
const mockSubmitContactMessage = submitContactMessage as ReturnType<
  typeof vi.fn
>;

// ---------------------------------------------------------------------------
// Mock data factory
// ---------------------------------------------------------------------------
const createMockContactMessage = (overrides = {}) => ({
  id: 'cm_01HXYZ123',
  name: 'Jane Smith',
  email: 'jane@example.com',
  subject: 'Work Inquiry',
  message: 'Hi, I would love to discuss a potential project with you.',
  timestamp: '2026-03-02T08:15:00Z',
  ...overrides,
});

// ---------------------------------------------------------------------------
// Helper — fill in all valid form fields
// ---------------------------------------------------------------------------
async function fillValidForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: {
    name?: string;
    email?: string;
    message?: string;
  } = {},
) {
  const nameInput = screen.getByLabelText(/^name$/i);
  const emailInput = screen.getByLabelText(/^email$/i);
  const messageTextarea = screen.getByLabelText(/^message$/i);

  await user.clear(nameInput);
  await user.type(nameInput, overrides.name ?? 'Jane Smith');

  await user.clear(emailInput);
  await user.type(emailInput, overrides.email ?? 'jane@example.com');

  // Open the Subject select and choose a value
  const subjectTrigger = screen.getByLabelText(/^subject$/i);
  await user.click(subjectTrigger);
  await user.click(screen.getByRole('option', { name: /work inquiry/i }));

  await user.clear(messageTextarea);
  await user.type(
    messageTextarea,
    overrides.message ?? 'Hi, I would love to discuss a project.',
  );
}

// ---------------------------------------------------------------------------
// Helper — render and return user event instance
// ---------------------------------------------------------------------------
function setup() {
  const user = userEvent.setup();
  render(<ContactForm />);
  return { user };
}

// ===========================================================================
// Test suites
// ===========================================================================

describe('Epic 1 Story 2 — Validation, Character Counter, and Error States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // On-Submit Validation — All Fields Simultaneously
  // =========================================================================
  describe('On-Submit Validation — all four fields simultaneously', () => {
    it('shows all four field error messages at once when Submit is clicked with empty fields', async () => {
      const { user } = setup();
      const sendButton = screen.getByRole('button', { name: /send message/i });

      await user.click(sendButton);

      expect(
        screen.getByText('Name must be at least 2 characters.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Please enter a valid email address.'),
      ).toBeInTheDocument();
      expect(screen.getByText('Please select a subject.')).toBeInTheDocument();
      expect(
        screen.getByText('Message must be at least 10 characters.'),
      ).toBeInTheDocument();
    });

    it('does not make an API call when validation fails on submit', async () => {
      const { user } = setup();
      const sendButton = screen.getByRole('button', { name: /send message/i });

      await user.click(sendButton);

      expect(mockSubmitContactMessage).not.toHaveBeenCalled();
    });

    it('does not put the button into a loading state when validation fails', async () => {
      const { user } = setup();
      const sendButton = screen.getByRole('button', { name: /send message/i });

      await user.click(sendButton);

      // Button should remain labelled "Send Message", not show a loading variant
      expect(
        screen.getByRole('button', { name: /send message/i }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByText(/sending/i)).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Individual Field Validation Rules
  // =========================================================================
  describe('Name field validation', () => {
    it('shows error for a single-character name on submit', async () => {
      const { user } = setup();
      await user.type(screen.getByLabelText(/^name$/i), 'J');
      await user.click(screen.getByRole('button', { name: /send message/i }));

      expect(
        screen.getByText('Name must be at least 2 characters.'),
      ).toBeInTheDocument();
    });

    it('does not show a Name error for a two-character name on submit', async () => {
      const { user } = setup();
      await fillValidForm(user, { name: 'Jo' });
      // Resolve mock so submit completes
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());
      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.queryByText('Name must be at least 2 characters.'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Email field validation', () => {
    it('shows error for an email without "@" on submit', async () => {
      const { user } = setup();
      await user.type(screen.getByLabelText(/^email$/i), 'notanemail');
      await user.click(screen.getByRole('button', { name: /send message/i }));

      expect(
        screen.getByText('Please enter a valid email address.'),
      ).toBeInTheDocument();
    });

    it('does not show an Email error for a properly formatted email on submit', async () => {
      const { user } = setup();
      await fillValidForm(user, { email: 'user@example.com' });
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());
      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.queryByText('Please enter a valid email address.'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Subject field validation', () => {
    it('shows error when no subject is selected on submit', async () => {
      const { user } = setup();
      // Fill other valid fields but leave Subject empty
      await user.type(screen.getByLabelText(/^name$/i), 'Jane Smith');
      await user.type(screen.getByLabelText(/^email$/i), 'jane@example.com');
      await user.type(
        screen.getByLabelText(/^message$/i),
        'A message with enough characters to pass.',
      );
      await user.click(screen.getByRole('button', { name: /send message/i }));

      expect(screen.getByText('Please select a subject.')).toBeInTheDocument();
    });

    it('does not show a Subject error when a subject is selected on submit', async () => {
      const { user } = setup();
      await fillValidForm(user);
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());
      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.queryByText('Please select a subject.'),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Message field validation', () => {
    it('shows error for a 9-character message on submit', async () => {
      const { user } = setup();
      await user.type(screen.getByLabelText(/^message$/i), '123456789');
      await user.click(screen.getByRole('button', { name: /send message/i }));

      expect(
        screen.getByText('Message must be at least 10 characters.'),
      ).toBeInTheDocument();
    });

    it('does not show a Message minimum-length error for a 10-character message on submit', async () => {
      const { user } = setup();
      await fillValidForm(user, { message: '1234567890' });
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());
      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.queryByText('Message must be at least 10 characters.'),
        ).not.toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // Per-Field Error Clearing on Correction
  // =========================================================================
  describe('Per-field error clearing on correction', () => {
    it('clears the Name error when the user types a valid name (without re-submitting)', async () => {
      const { user } = setup();
      // Trigger validation
      await user.click(screen.getByRole('button', { name: /send message/i }));
      expect(
        screen.getByText('Name must be at least 2 characters.'),
      ).toBeInTheDocument();

      // Type a valid name — error should clear immediately
      await user.type(screen.getByLabelText(/^name$/i), 'Jane');
      expect(
        screen.queryByText('Name must be at least 2 characters.'),
      ).not.toBeInTheDocument();
    });

    it('clears the Email error when the user types a valid email (without re-submitting)', async () => {
      const { user } = setup();
      await user.click(screen.getByRole('button', { name: /send message/i }));
      expect(
        screen.getByText('Please enter a valid email address.'),
      ).toBeInTheDocument();

      await user.type(screen.getByLabelText(/^email$/i), 'jane@example.com');
      expect(
        screen.queryByText('Please enter a valid email address.'),
      ).not.toBeInTheDocument();
    });

    it('clears the Subject error when the user selects a subject option (without re-submitting)', async () => {
      const { user } = setup();
      await user.click(screen.getByRole('button', { name: /send message/i }));
      expect(screen.getByText('Please select a subject.')).toBeInTheDocument();

      const subjectTrigger = screen.getByLabelText(/^subject$/i);
      await user.click(subjectTrigger);
      await user.click(
        screen.getByRole('option', { name: /general inquiry/i }),
      );

      expect(
        screen.queryByText('Please select a subject.'),
      ).not.toBeInTheDocument();
    });

    it('clears the Message error when the user types 10+ characters (without re-submitting)', async () => {
      const { user } = setup();
      await user.click(screen.getByRole('button', { name: /send message/i }));
      expect(
        screen.getByText('Message must be at least 10 characters.'),
      ).toBeInTheDocument();

      await user.type(
        screen.getByLabelText(/^message$/i),
        'This message is long enough.',
      );
      expect(
        screen.queryByText('Message must be at least 10 characters.'),
      ).not.toBeInTheDocument();
    });

    it('leaves other field errors unchanged when only the Name field is corrected', async () => {
      const { user } = setup();
      // Trigger all four errors
      await user.click(screen.getByRole('button', { name: /send message/i }));

      // Correct only the Name field
      await user.type(screen.getByLabelText(/^name$/i), 'Jane Smith');

      // Name error should be gone
      expect(
        screen.queryByText('Name must be at least 2 characters.'),
      ).not.toBeInTheDocument();

      // All other errors must still be visible
      expect(
        screen.getByText('Please enter a valid email address.'),
      ).toBeInTheDocument();
      expect(screen.getByText('Please select a subject.')).toBeInTheDocument();
      expect(
        screen.getByText('Message must be at least 10 characters.'),
      ).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Character Counter — Real-Time Updates and Limit Enforcement
  // =========================================================================
  describe('Character counter', () => {
    it('shows "42 / 1000" after typing 42 characters into the Message textarea', async () => {
      const { user } = setup();
      const fortyTwoChars = 'a'.repeat(42);
      await user.type(screen.getByLabelText(/^message$/i), fortyTwoChars);

      expect(screen.getByText('42 / 1000')).toBeInTheDocument();
    });

    it('shows "999 / 1000" in normal (non-error) styling at 999 characters', () => {
      setup();
      fireEvent.change(screen.getByLabelText(/^message$/i), {
        target: { value: 'a'.repeat(999) },
      });

      const counter = screen.getByText('999 / 1000');
      expect(counter).toBeInTheDocument();
      // The counter must NOT have error / destructive styling at 999 chars
      expect(counter).not.toHaveClass('text-destructive');
      expect(counter).not.toHaveClass('text-red-500');
    });

    it('shows "1000 / 1000" with error styling when the textarea reaches the 1000-character limit', () => {
      setup();
      fireEvent.change(screen.getByLabelText(/^message$/i), {
        target: { value: 'a'.repeat(1000) },
      });

      const counter = screen.getByText('1000 / 1000');
      expect(counter).toBeInTheDocument();
      // The counter must carry destructive/red styling to signal the limit
      const hasErrorStyling =
        counter.classList.contains('text-destructive') ||
        counter.classList.contains('text-red-500');
      expect(hasErrorStyling).toBe(true);
    });

    it('disables the Send Message button when the Message textarea contains 1000 characters', () => {
      setup();
      fireEvent.change(screen.getByLabelText(/^message$/i), {
        target: { value: 'a'.repeat(1000) },
      });

      expect(
        screen.getByRole('button', { name: /send message/i }),
      ).toBeDisabled();
    });

    it('does not disable the Send Message button at 999 characters', () => {
      setup();
      fireEvent.change(screen.getByLabelText(/^message$/i), {
        target: { value: 'a'.repeat(999) },
      });

      expect(
        screen.getByRole('button', { name: /send message/i }),
      ).toBeEnabled();
    });
  });

  // =========================================================================
  // Submit Button Disabled During API Call
  // =========================================================================
  describe('Submit button disabled during API call', () => {
    it('disables the Send Message button while the API call is in progress', async () => {
      const { user } = setup();

      // Use a never-resolving promise to keep the loading state visible
      mockSubmitContactMessage.mockReturnValue(new Promise(() => {}));

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /send message/i }));

      // After clicking, the button should be disabled (loading state)
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /send message/i }),
        ).toBeDisabled();
      });
    });

    it('re-enables the Send Message button after an API error so the user can retry', async () => {
      const { user } = setup();
      mockSubmitContactMessage.mockRejectedValue(new Error('Network error'));

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /send message/i }),
        ).toBeEnabled();
      });
    });
  });

  // =========================================================================
  // API Error Banner
  // =========================================================================
  describe('API error banner', () => {
    it('displays an error banner when the API returns an error response', async () => {
      const { user } = setup();
      mockSubmitContactMessage.mockRejectedValue(new Error('Network error'));

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('preserves all field values after an API error (form is not reset)', async () => {
      const { user } = setup();
      mockSubmitContactMessage.mockRejectedValue(new Error('Network error'));

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // All field values must still be present
      expect(screen.getByLabelText(/^name$/i)).toHaveValue('Jane Smith');
      expect(screen.getByLabelText(/^email$/i)).toHaveValue('jane@example.com');
      // Subject trigger should show the selected value
      expect(screen.getByLabelText(/^subject$/i)).toHaveTextContent(
        /work inquiry/i,
      );
      expect(screen.getByLabelText(/^message$/i)).toHaveValue(
        'Hi, I would love to discuss a project.',
      );
    });

    it('moves keyboard focus to the error banner after an API failure', async () => {
      const { user } = setup();
      mockSubmitContactMessage.mockRejectedValue(new Error('Network error'));

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveFocus();
      });
    });

    it('keeps the error banner visible after the user edits a field (persists until next submission attempt)', async () => {
      const { user } = setup();
      mockSubmitContactMessage.mockRejectedValue(new Error('Network error'));

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Edit the Name field — banner must remain visible
      const nameInput = screen.getByLabelText(/^name$/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // Accessibility
  // =========================================================================
  describe('Accessibility', () => {
    it('has no accessibility violations on initial render', async () => {
      const { container } = render(<ContactForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when all validation errors are shown', async () => {
      const user = userEvent.setup();
      const { container } = render(<ContactForm />);
      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Name must be at least 2 characters.'),
        ).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations when the API error banner is shown', async () => {
      const user = userEvent.setup();
      const { container } = render(<ContactForm />);
      mockSubmitContactMessage.mockRejectedValue(new Error('Network error'));

      await fillValidForm(user);
      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
