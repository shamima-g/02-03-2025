/**
 * Story Metadata:
 * - Route: /
 * - Target File: app/page.tsx
 * - Page Action: modify_existing
 *
 * Tests for Epic 1, Story 1: Contact Form — Home Page Setup and Form Rendering.
 *
 * Verifies that visiting the home page shows the "Contact Me" heading,
 * removes default template content, and renders a fully accessible contact
 * form with Name, Email, Subject, Message fields, character counter,
 * Send Message button, and an invisible honeypot field.
 *
 * No API calls occur during rendering — form submission is covered in Story 3.
 * The reCAPTCHA v3 library is mocked because it is an external dependency that
 * makes network requests and is unrelated to what these tests verify.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock reCAPTCHA v3 — external library, irrelevant to rendering tests
vi.mock('react-google-recaptcha-v3', () => ({
  GoogleReCaptchaProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useGoogleReCaptcha: () => ({ executeRecaptcha: vi.fn() }),
}));

// Import the REAL ContactForm component.
// This import WILL FAIL until the component is implemented — that is the point.
import { ContactForm } from '@/components/ContactForm';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderContactForm() {
  return render(<ContactForm />);
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('Epic 1 Story 1 — Home Page: Contact Form Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Home Page Content
  // -------------------------------------------------------------------------
  describe('Home Page renders the Contact Form', () => {
    it('shows the "Contact Me" heading', () => {
      renderContactForm();
      expect(
        screen.getByRole('heading', { name: /contact me/i }),
      ).toBeInTheDocument();
    });

    it('does not show the default template placeholder content', () => {
      renderContactForm();
      expect(
        screen.queryByText(/replace this with your feature implementation/i),
      ).not.toBeInTheDocument();
    });

    it('renders a form element on the page', () => {
      renderContactForm();
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Name Field
  // -------------------------------------------------------------------------
  describe('Name field', () => {
    it('has a visible "Name" label associated with a text input', () => {
      renderContactForm();
      expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    });

    it('reflects typed value in the Name field', async () => {
      const user = userEvent.setup();
      renderContactForm();
      const nameInput = screen.getByLabelText(/^name$/i);
      await user.type(nameInput, 'Jane Smith');
      expect(nameInput).toHaveValue('Jane Smith');
    });
  });

  // -------------------------------------------------------------------------
  // Email Field
  // -------------------------------------------------------------------------
  describe('Email field', () => {
    it('has a visible "Email" label associated with a text input', () => {
      renderContactForm();
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    });

    it('reflects typed value in the Email field', async () => {
      const user = userEvent.setup();
      renderContactForm();
      const emailInput = screen.getByLabelText(/^email$/i);
      await user.type(emailInput, 'jane@example.com');
      expect(emailInput).toHaveValue('jane@example.com');
    });
  });

  // -------------------------------------------------------------------------
  // Subject Field
  // -------------------------------------------------------------------------
  describe('Subject field', () => {
    it('has a visible "Subject" label associated with a select/combobox control', () => {
      renderContactForm();
      // Shadcn <Select> renders a button with role="combobox"; getByLabelText resolves
      // the association via htmlFor/aria-labelledby.
      expect(screen.getByLabelText(/^subject$/i)).toBeInTheDocument();
    });

    it('shows all four subject options when opened', async () => {
      const user = userEvent.setup();
      renderContactForm();
      const trigger = screen.getByLabelText(/^subject$/i);
      await user.click(trigger);
      expect(
        screen.getByRole('option', { name: /general inquiry/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: /work inquiry/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: /feedback/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: /^other$/i }),
      ).toBeInTheDocument();
    });

    it('shows a placeholder prompt with no pre-selected option on first render', () => {
      renderContactForm();
      const trigger = screen.getByLabelText(/^subject$/i);
      // The trigger text should be a prompt, not one of the four option values
      expect(trigger).not.toHaveTextContent(/general inquiry/i);
      expect(trigger).not.toHaveTextContent(/work inquiry/i);
      expect(trigger).not.toHaveTextContent(/feedback/i);
      expect(trigger).not.toHaveTextContent(/^other$/i);
    });
  });

  // -------------------------------------------------------------------------
  // Message Field
  // -------------------------------------------------------------------------
  describe('Message field', () => {
    it('has a visible "Message" label associated with a textarea', () => {
      renderContactForm();
      const textarea = screen.getByLabelText(/^message$/i);
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName.toLowerCase()).toBe('textarea');
    });

    it('reflects typed value in the Message textarea', async () => {
      const user = userEvent.setup();
      renderContactForm();
      const textarea = screen.getByLabelText(/^message$/i);
      await user.type(textarea, 'Hello world');
      expect(textarea).toHaveValue('Hello world');
    });
  });

  // -------------------------------------------------------------------------
  // Character Counter
  // -------------------------------------------------------------------------
  describe('Character counter', () => {
    it('displays "0 / 1000" when the form is first rendered', () => {
      renderContactForm();
      expect(screen.getByText('0 / 1000')).toBeInTheDocument();
    });

    it('updates the counter as the user types in the Message field', async () => {
      const user = userEvent.setup();
      renderContactForm();
      const textarea = screen.getByLabelText(/^message$/i);
      await user.type(textarea, 'Hello');
      expect(screen.getByText('5 / 1000')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Send Message Button
  // -------------------------------------------------------------------------
  describe('Send Message button', () => {
    it('is visible and enabled when the form renders', () => {
      renderContactForm();
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('does not show a loading indicator on initial render', () => {
      renderContactForm();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      // Ensure the button label reads "Send Message", not a loading variant
      expect(
        screen.getByRole('button', { name: /send message/i }),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Honeypot Field
  // -------------------------------------------------------------------------
  describe('Honeypot field (invisible to users)', () => {
    it('is present in the DOM but has no accessible name visible to screen readers', () => {
      renderContactForm();
      // The honeypot input must exist in the DOM (so bots can find it)
      // but must not be discoverable as a labelled control by assistive technology.
      const honeypot = screen.getByTestId('honeypot'); // test-quality-ignore: honeypot is intentionally inaccessible; getByTestId is the only valid query
      expect(honeypot).toBeInTheDocument();
      // It must not be discoverable as a labelled textbox (no aria-label / visible label)
      expect(
        screen.queryByRole('textbox', { name: /honeypot/i }),
      ).not.toBeInTheDocument();
    });

    it('has no visible label text that reveals its presence to human users', () => {
      renderContactForm();
      // The word "honeypot" must not appear as visible text anywhere on the page
      expect(screen.queryByText(/honeypot/i)).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // reCAPTCHA v3 Integration
  // -------------------------------------------------------------------------
  describe('reCAPTCHA v3 integration', () => {
    it('does not render a visible reCAPTCHA badge or UI element in the form area', () => {
      renderContactForm();
      // The reCAPTCHA v3 widget is invisible — no badge, iframe, or visible element
      // should appear in the form. We verify no reCAPTCHA badge text is displayed.
      expect(screen.queryByText(/recaptcha/i)).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------
  describe('Accessibility', () => {
    it('all four fields and the Send Message button are reachable via Tab', async () => {
      const user = userEvent.setup();
      renderContactForm();

      // Tab through the form and verify focus reaches each field
      await user.tab();
      const nameInput = screen.getByLabelText(/^name$/i);
      expect(nameInput).toHaveFocus();

      await user.tab();
      const emailInput = screen.getByLabelText(/^email$/i);
      expect(emailInput).toHaveFocus();

      await user.tab();
      const subjectTrigger = screen.getByLabelText(/^subject$/i);
      expect(subjectTrigger).toHaveFocus();

      await user.tab();
      const messageTextarea = screen.getByLabelText(/^message$/i);
      expect(messageTextarea).toHaveFocus();

      await user.tab();
      const sendButton = screen.getByRole('button', { name: /send message/i });
      expect(sendButton).toHaveFocus();
    });

    it('has no accessibility violations', async () => {
      const { container } = renderContactForm();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
