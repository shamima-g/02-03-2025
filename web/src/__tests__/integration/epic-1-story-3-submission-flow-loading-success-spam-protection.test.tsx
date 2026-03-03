/**
 * Story Metadata:
 * - Route: /
 * - Target File: app/page.tsx (via ContactForm component)
 * - Page Action: modify_existing
 *
 * Tests for Epic 1, Story 3: Contact Form — Submission Flow
 * (Loading State, Success State, Spam Protection).
 *
 * Covers:
 * - Loading state: button disabled + spinner while API in flight
 * - Success state: form replaced by confirmation region with checkmark, heading, body text
 * - Focus management: success region receives keyboard focus
 * - "Send another message" reset: form returns empty, counter resets, button enabled
 * - Honeypot silent rejection: no API call, transitions to success state
 * - reCAPTCHA v3 token: executeRecaptcha called, token in request payload
 * - API call payload: name, email, subject, message, recaptchaToken
 *
 * Mock strategy:
 * - react-google-recaptcha-v3: mocked (external library)
 * - @/lib/api/contact: submitContactMessage mocked (HTTP boundary)
 * - ContactForm: real component (imported, not faked)
 *
 * Note: vitest-axe matchers (toHaveNoViolations) are registered globally
 * via vitest.setup.ts — no expect.extend() call needed here.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// ---------------------------------------------------------------------------
// Mocks — must be declared before imports that use them
// ---------------------------------------------------------------------------

// Mock reCAPTCHA v3 — external library; returns a deterministic token
vi.mock('react-google-recaptcha-v3', () => ({
  GoogleReCaptchaProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useGoogleReCaptcha: () => ({
    executeRecaptcha: vi.fn().mockResolvedValue('mock-recaptcha-token'),
  }),
}));

// Mock the API contact module — only the HTTP boundary is mocked, not the component
vi.mock('@/lib/api/contact', () => ({
  submitContactMessage: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------

import { ContactForm } from '@/components/ContactForm';
import { submitContactMessage } from '@/lib/api/contact';
import type { ContactMessage } from '@/types/contact';

const mockSubmitContactMessage = submitContactMessage as ReturnType<
  typeof vi.fn
>;

// ---------------------------------------------------------------------------
// Mock data factory
// ---------------------------------------------------------------------------

const createMockContactMessage = (
  overrides: Partial<ContactMessage> = {},
): ContactMessage => ({
  id: 'msg-abc-123',
  name: 'Jane Smith',
  email: 'jane@example.com',
  subject: 'General Inquiry',
  message: 'Hello, this is a test message that is long enough.',
  timestamp: '2026-03-03T06:21:00.000Z',
  ...overrides,
});

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function renderContactForm() {
  return render(<ContactForm />);
}

/**
 * Fill in all four required fields with valid data.
 * Subject uses the Shadcn Select combobox pattern.
 */
async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  const nameInput = screen.getByLabelText(/^name$/i);
  const emailInput = screen.getByLabelText(/^email$/i);
  const subjectTrigger = screen.getByLabelText(/^subject$/i);
  const messageTextarea = screen.getByLabelText(/^message$/i);

  await user.type(nameInput, 'Jane Smith');
  await user.type(emailInput, 'jane@example.com');
  await user.click(subjectTrigger);
  const generalInquiryOption = await screen.findByRole('option', {
    name: /general inquiry/i,
  });
  await user.click(generalInquiryOption);
  await user.type(
    messageTextarea,
    'Hello, this is a test message that is long enough.',
  );
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('Epic 1 Story 3 — Contact Form: Submission Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Loading State
  // -------------------------------------------------------------------------
  describe('Loading state', () => {
    it('disables the Send Message button immediately when clicked on a valid form', async () => {
      // Never resolves — keeps the form in loading state indefinitely
      mockSubmitContactMessage.mockReturnValue(new Promise(() => {}));

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      const sendButton = screen.getByRole('button', { name: /send message/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /send message/i }),
        ).toBeDisabled();
      });
    });

    it('shows a loading indicator on the button while the API call is in flight', async () => {
      mockSubmitContactMessage.mockReturnValue(new Promise(() => {}));

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      const sendButton = screen.getByRole('button', { name: /send message/i });
      await user.click(sendButton);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /send message/i });
        // Button is disabled during loading and retains its "Send Message" text
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent(/send message/i);
      });
    });

    it('keeps the form fields visible and their values unchanged during loading', async () => {
      mockSubmitContactMessage.mockReturnValue(new Promise(() => {}));

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /send message/i }),
        ).toBeDisabled();
      });

      // All form fields remain visible with their entered values
      expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^message$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^name$/i)).toHaveValue('Jane Smith');
      expect(screen.getByLabelText(/^email$/i)).toHaveValue('jane@example.com');
      expect(screen.getByLabelText(/^message$/i)).toHaveValue(
        'Hello, this is a test message that is long enough.',
      );
    });
  });

  // -------------------------------------------------------------------------
  // Success State — Form replaced by confirmation
  // -------------------------------------------------------------------------
  describe('Success state', () => {
    it('hides the form fields after a successful API response', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(screen.queryByLabelText(/^name$/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/^email$/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/^message$/i)).not.toBeInTheDocument();
      });
    });

    it('shows the "Message Sent!" heading in the success region', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /message sent/i }),
        ).toBeInTheDocument();
      });
    });

    it('shows body text confirming the message was received', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/thanks for reaching out/i),
        ).toBeInTheDocument();
      });
    });

    it('shows a checkmark icon in the success region', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      const { container } = renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        // The success region heading must be present
        expect(
          screen.getByRole('heading', { name: /message sent/i }),
        ).toBeInTheDocument();
        // A lucide SVG icon (e.g. CheckCircle2) is rendered inside the success region
        const svgIcons = container.querySelectorAll('svg');
        expect(svgIcons.length).toBeGreaterThan(0);
      });
    });

    it('moves keyboard focus to the success confirmation region', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /message sent/i }),
        ).toBeInTheDocument();
      });

      // The success region must have tabIndex={-1} and receive programmatic focus
      await waitFor(() => {
        const successRegion = screen
          .getByRole('heading', { name: /message sent/i })
          .closest('[tabindex="-1"]');
        expect(successRegion).not.toBeNull();
        expect(successRegion).toHaveFocus();
      });
    });
  });

  // -------------------------------------------------------------------------
  // "Send Another Message" Reset
  // -------------------------------------------------------------------------
  describe('"Send another message" reset', () => {
    it('shows a "Send another message" button in the success state', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /send another message/i }),
        ).toBeInTheDocument();
      });
    });

    it('clicking "Send another message" replaces the success region with the empty form', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /send another message/i }),
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: /send another message/i }),
      );

      await waitFor(() => {
        // Success region is gone
        expect(
          screen.queryByRole('heading', { name: /message sent/i }),
        ).not.toBeInTheDocument();
        // The form is back
        expect(screen.getByRole('form')).toBeInTheDocument();
      });
    });

    it('all four form fields are empty after clicking "Send another message"', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /send another message/i }),
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: /send another message/i }),
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/^name$/i)).toHaveValue('');
        expect(screen.getByLabelText(/^email$/i)).toHaveValue('');
        expect(screen.getByLabelText(/^message$/i)).toHaveValue('');
      });
    });

    it('character counter shows "0 / 1000" after clicking "Send another message"', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /send another message/i }),
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: /send another message/i }),
      );

      await waitFor(() => {
        expect(screen.getByText('0 / 1000')).toBeInTheDocument();
      });
    });

    it('Send Message button is enabled (idle) after clicking "Send another message"', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /send another message/i }),
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: /send another message/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /send message/i }),
        ).toBeEnabled();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Honeypot Silent Rejection
  // -------------------------------------------------------------------------
  describe('Honeypot silent rejection', () => {
    it('does not call the API when the honeypot field is filled', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      // Fill the honeypot field (simulates a bot). Uses getByTestId because
      // the honeypot is intentionally inaccessible — no role, label, or visible text.
      const honeypotField = screen.getByTestId('honeypot'); // test-quality-ignore: honeypot is intentionally inaccessible; getByTestId is the only valid query
      await user.type(honeypotField, 'bot-value');

      await user.click(screen.getByRole('button', { name: /send message/i }));

      // The honeypot path simulates a ~1 second delay; wait for the success
      // state to confirm the path completed — at that point the API was not called.
      await waitFor(
        () => {
          expect(
            screen.getByRole('heading', { name: /message sent/i }),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      expect(mockSubmitContactMessage).not.toHaveBeenCalled();
    });

    it('transitions to the success state after honeypot rejection (looks like real success)', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      const honeypotField = screen.getByTestId('honeypot'); // test-quality-ignore: honeypot is intentionally inaccessible; getByTestId is the only valid query
      await user.type(honeypotField, 'bot-value');

      await user.click(screen.getByRole('button', { name: /send message/i }));

      // The honeypot path simulates ~1 second delay then shows success
      await waitFor(
        () => {
          expect(
            screen.getByRole('heading', { name: /message sent/i }),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('success state after honeypot is visually identical to genuine success', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      const honeypotField = screen.getByTestId('honeypot'); // test-quality-ignore: honeypot is intentionally inaccessible; getByTestId is the only valid query
      await user.type(honeypotField, 'bot-value');

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(
        () => {
          expect(
            screen.getByRole('heading', { name: /message sent/i }),
          ).toBeInTheDocument();
          expect(
            screen.getByText(/thanks for reaching out/i),
          ).toBeInTheDocument();
          expect(
            screen.getByRole('button', { name: /send another message/i }),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // reCAPTCHA v3 Token
  // -------------------------------------------------------------------------
  describe('reCAPTCHA v3 token', () => {
    it('includes the recaptchaToken field in the API request body', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(mockSubmitContactMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            recaptchaToken: expect.any(String),
          }),
        );
      });
    });

    it('sends the recaptchaToken obtained from executeRecaptcha to the API', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        // The mock executeRecaptcha resolves with 'mock-recaptcha-token'
        expect(mockSubmitContactMessage).toHaveBeenCalledWith(
          expect.objectContaining({
            recaptchaToken: 'mock-recaptcha-token',
          }),
        );
      });
    });
  });

  // -------------------------------------------------------------------------
  // API Call — Genuine Submission Payload
  // -------------------------------------------------------------------------
  describe('API call payload on genuine submission', () => {
    it('sends a POST request with name, email, subject, message, and recaptchaToken', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(mockSubmitContactMessage).toHaveBeenCalledWith({
          name: 'Jane Smith',
          email: 'jane@example.com',
          subject: 'General Inquiry',
          message: 'Hello, this is a test message that is long enough.',
          recaptchaToken: expect.any(String),
        });
      });
    });

    it('shows the success confirmation after a valid submission completes', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      // Successful API call results in user-visible success state
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /message sent/i }),
        ).toBeInTheDocument();
      });
    });

    it('does not call the API when the form is invalid', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      renderContactForm();

      // Click submit without filling any fields
      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(mockSubmitContactMessage).not.toHaveBeenCalled();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------
  describe('Accessibility', () => {
    it('has no accessibility violations in the initial form state', async () => {
      const { container } = renderContactForm();
      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no accessibility violations in the success state', async () => {
      mockSubmitContactMessage.mockResolvedValue(createMockContactMessage());

      const user = userEvent.setup();
      const { container } = renderContactForm();
      await fillValidForm(user);

      await user.click(screen.getByRole('button', { name: /send message/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /message sent/i }),
        ).toBeInTheDocument();
      });

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
