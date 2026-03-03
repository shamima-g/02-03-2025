/**
 * Story Metadata:
 * - Route: /admin
 * - Target File: app/admin/page.tsx
 * - Page Action: modify_existing
 *
 * Tests for Epic 2, Story 2: Admin Inbox — Message List.
 *
 * Verifies that the AdminInbox component correctly handles all four states:
 *   - Loading: shows a loading indicator while the API call is in flight
 *   - Populated: displays sender name, email, subject, message body, and formatted
 *     timestamp for each message; messages appear in newest-first order
 *   - Empty: shows an "empty" notice when the API returns zero messages
 *   - Error: shows an error notice and a retry button; clicking retry re-fetches
 *
 * API integration: mocks `@/lib/api/contact` — the only external dependency.
 *
 * Component under test: AdminInbox (imported from @/components/AdminInbox)
 * This import WILL FAIL until the component is implemented — that is the point.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Import the REAL AdminInbox component.
// This import WILL FAIL until the component is implemented — that is the point.
import { AdminInbox } from '@/components/AdminInbox';

// Mock the API module — only mock external dependencies, never mock what we test.
import { listContactMessages } from '@/lib/api/contact';
vi.mock('@/lib/api/contact', () => ({
  listContactMessages: vi.fn(),
  submitContactMessage: vi.fn(),
}));
const mockListContactMessages = listContactMessages as ReturnType<typeof vi.fn>;

// ---------------------------------------------------------------------------
// Type imports (for typing mock data)
// ---------------------------------------------------------------------------
import type {
  ContactMessage,
  ContactMessageListResponse,
} from '@/types/contact';

// ---------------------------------------------------------------------------
// Mock data factories
// ---------------------------------------------------------------------------

/**
 * ContactMessage.timestamp is an ISO 8601 string.
 * ContactMessage.subject must be a SubjectEnum value.
 */
const createMockMessage = (
  overrides: Partial<ContactMessage> = {},
): ContactMessage => ({
  id: '1',
  name: 'Alice Smith',
  email: 'alice@example.com',
  subject: 'General Inquiry',
  message: 'This is a test message from Alice.',
  timestamp: '2025-01-15T10:30:00Z',
  ...overrides,
});

const createMockResponse = (
  messages: ContactMessage[],
): ContactMessageListResponse => ({
  messages,
  total: messages.length,
});

/** Two messages: message 1 is newer, message 2 is older (API returns newest-first). */
const MOCK_MESSAGES: ContactMessage[] = [
  createMockMessage({
    id: '1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    subject: 'General Inquiry',
    message: 'This is a test message from Alice.',
    timestamp: '2025-01-15T10:30:00Z',
  }),
  createMockMessage({
    id: '2',
    name: 'Bob Jones',
    email: 'bob@example.com',
    subject: 'Work Inquiry',
    message: 'I have a work inquiry from Bob.',
    timestamp: '2025-01-14T09:00:00Z',
  }),
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderAdminInbox() {
  return render(<AdminInbox />);
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('Epic 2 Story 2 — Admin Inbox: Message List', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Loading State
  // -------------------------------------------------------------------------
  describe('Loading state', () => {
    it('shows a loading indicator while messages are being fetched', async () => {
      // Never resolves during this test — keeps the component in loading state.
      // The component must render an element with role="status" (covers both
      // aria-live regions and spinners) or text matching /loading/i.
      mockListContactMessages.mockReturnValue(new Promise(() => {}));
      renderAdminInbox();

      // Implementation must include either a status role or visible "Loading" text.
      expect(
        screen.getByRole('status') ?? screen.getByText(/loading/i),
      ).toBeInTheDocument();
    });

    it('does not show message content while loading', async () => {
      mockListContactMessages.mockReturnValue(new Promise(() => {}));
      renderAdminInbox();

      // None of the mock message sender names should be visible yet
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Populated State — Message List
  // -------------------------------------------------------------------------
  describe('Populated state', () => {
    beforeEach(() => {
      mockListContactMessages.mockResolvedValue(
        createMockResponse(MOCK_MESSAGES),
      );
    });

    it('shows a list of messages when the API returns messages', async () => {
      renderAdminInbox();

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    it('shows the sender name for each message', async () => {
      renderAdminInbox();

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    it('shows the sender email address for each message', async () => {
      renderAdminInbox();

      await waitFor(() => {
        expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      });
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('shows the subject for each message', async () => {
      renderAdminInbox();

      await waitFor(() => {
        expect(screen.getByText('General Inquiry')).toBeInTheDocument();
      });
      expect(screen.getByText('Work Inquiry')).toBeInTheDocument();
    });

    it('shows the full message body for each message', async () => {
      renderAdminInbox();

      await waitFor(() => {
        expect(
          screen.getByText('This is a test message from Alice.'),
        ).toBeInTheDocument();
      });
      expect(
        screen.getByText('I have a work inquiry from Bob.'),
      ).toBeInTheDocument();
    });

    it('shows a formatted timestamp for each message (human-readable, not raw ISO)', async () => {
      renderAdminInbox();

      await waitFor(() => {
        // The timestamp '2025-01-15T10:30:00Z' must be formatted in a human-readable
        // form. We match on the year rather than an exact locale string because
        // jsdom locale output can vary across environments.
        expect(screen.getByText(/2025/)).toBeInTheDocument();
      });
    });

    it('does not show the raw ISO timestamp string', async () => {
      renderAdminInbox();

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });
      // Raw ISO strings must NOT appear verbatim
      expect(
        screen.queryByText('2025-01-15T10:30:00Z'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('2025-01-14T09:00:00Z'),
      ).not.toBeInTheDocument();
    });

    it('renders messages in newest-first order (first rendered message is the newest)', async () => {
      renderAdminInbox();

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });

      // Get all sender names in document order
      const names = screen
        .getAllByText(/Alice Smith|Bob Jones/)
        .map((el) => el.textContent);

      // Alice (newer, 2025-01-15) should appear before Bob (older, 2025-01-14)
      expect(names.indexOf('Alice Smith')).toBeLessThan(
        names.indexOf('Bob Jones'),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Empty State
  // -------------------------------------------------------------------------
  describe('Empty state', () => {
    beforeEach(() => {
      mockListContactMessages.mockResolvedValue(createMockResponse([]));
    });

    it('shows an empty-state notice when the API returns no messages', async () => {
      renderAdminInbox();

      await waitFor(() => {
        expect(screen.getByText(/no messages/i)).toBeInTheDocument();
      });
    });

    it('does not render any message cards when the list is empty', async () => {
      renderAdminInbox();

      await waitFor(() => {
        // Wait for loading to complete (empty-state text appears)
        expect(screen.getByText(/no messages/i)).toBeInTheDocument();
      });

      // No sender name from mock data should appear
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Error State
  // -------------------------------------------------------------------------
  describe('Error state', () => {
    beforeEach(() => {
      mockListContactMessages.mockRejectedValue(new Error('Network error'));
    });

    it('shows an error message when the API request fails', async () => {
      renderAdminInbox();

      await waitFor(() => {
        // The component must render an element with role="alert" for the error state.
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('shows a retry button when an error occurs', async () => {
      renderAdminInbox();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry|try again/i }),
        ).toBeInTheDocument();
      });
    });

    it('re-fetches messages when the retry button is clicked', async () => {
      const user = userEvent.setup();
      renderAdminInbox();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry|try again/i }),
        ).toBeInTheDocument();
      });

      // First call was the initial fetch (failed). Now make the retry succeed.
      mockListContactMessages.mockResolvedValueOnce(
        createMockResponse(MOCK_MESSAGES),
      );

      await user.click(
        screen.getByRole('button', { name: /retry|try again/i }),
      );

      // After successful retry the message list should appear
      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });
    });

    it('shows the inbox content after a successful retry', async () => {
      const user = userEvent.setup();
      renderAdminInbox();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry|try again/i }),
        ).toBeInTheDocument();
      });

      mockListContactMessages.mockResolvedValueOnce(
        createMockResponse(MOCK_MESSAGES),
      );

      await user.click(
        screen.getByRole('button', { name: /retry|try again/i }),
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      });
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------
  describe('Accessibility', () => {
    it('has an "Inbox" heading so it is identifiable after the password gate is passed', async () => {
      mockListContactMessages.mockResolvedValue(
        createMockResponse(MOCK_MESSAGES),
      );
      renderAdminInbox();

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });

      // Story 1 tests assert that after unlock a heading with "Inbox" is visible.
      // AdminInbox must include such a heading so both test suites pass together.
      expect(
        screen.getByRole('heading', { name: /inbox/i }),
      ).toBeInTheDocument();
    });

    it('has no accessibility violations while loading', async () => {
      mockListContactMessages.mockReturnValue(new Promise(() => {}));
      const { container } = renderAdminInbox();

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no accessibility violations in the populated state', async () => {
      mockListContactMessages.mockResolvedValue(
        createMockResponse(MOCK_MESSAGES),
      );
      const { container } = renderAdminInbox();

      await waitFor(() => {
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      });

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no accessibility violations in the empty state', async () => {
      mockListContactMessages.mockResolvedValue(createMockResponse([]));
      const { container } = renderAdminInbox();

      await waitFor(() => {
        expect(screen.getByText(/no messages/i)).toBeInTheDocument();
      });

      expect(await axe(container)).toHaveNoViolations();
    });

    it('has no accessibility violations in the error state', async () => {
      mockListContactMessages.mockRejectedValue(new Error('Network error'));
      const { container } = renderAdminInbox();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /retry|try again/i }),
        ).toBeInTheDocument();
      });

      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
