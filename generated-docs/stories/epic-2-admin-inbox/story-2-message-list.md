# Story: Admin Inbox — Message List

**Epic:** Admin Inbox | **Story:** 2 of 2 | **Wireframe:** N/A

## Story Metadata

| Field | Value |
|-------|-------|
| **Route** | `/admin` |
| **Target File** | `app/admin/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story

**As a** site owner **I want** to see all submitted contact messages after unlocking the admin inbox **So that** I can read every inquiry, work request, or piece of feedback sent through the contact form.

## Acceptance Criteria

### Loading State

- [ ] Given I have unlocked the admin inbox, when the page first fetches messages from the API, then I see a loading indicator while the request is in flight
- [ ] Given I have unlocked the admin inbox, when data is loading, then the message list is not yet shown

### Populated State — Message List

- [ ] Given I have unlocked the admin inbox, when the API returns one or more messages, then I see a list of all returned messages
- [ ] Given I have unlocked the admin inbox, when messages are displayed, then each message shows the sender's name
- [ ] Given I have unlocked the admin inbox, when messages are displayed, then each message shows the sender's email address
- [ ] Given I have unlocked the admin inbox, when messages are displayed, then each message shows the subject
- [ ] Given I have unlocked the admin inbox, when messages are displayed, then each message shows the full message body
- [ ] Given I have unlocked the admin inbox, when messages are displayed, then each message shows a formatted submission timestamp (e.g., "March 2, 2026, 8:15 AM")
- [ ] Given I have unlocked the admin inbox, when messages are displayed, then the most recently submitted message appears first (newest-first order as returned by the API)

### Empty State

- [ ] Given I have unlocked the admin inbox, when the API returns an empty list of messages, then I see an empty state message (e.g., "No messages yet.")
- [ ] Given I have unlocked the admin inbox, when the API returns an empty list, then no message cards or rows are shown

### Error State

- [ ] Given I have unlocked the admin inbox, when the API request fails, then I see an error message informing me that messages could not be loaded
- [ ] Given I have unlocked the admin inbox, when an error is shown, then I see a retry control (e.g., "Try again" button) that re-fetches messages when activated
- [ ] Given I have unlocked the admin inbox and I click the retry button after an error, when the retry API call succeeds, then the message list is displayed

## API Endpoints (from OpenAPI spec)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/contact-messages` | Retrieve all submitted messages, newest first |

The `listContactMessages()` function in `web/src/lib/api/contact.ts` is already defined in Epic 1, Story 1 — import and use it directly.

## Implementation Notes

- Create `web/src/components/AdminInbox.tsx` as a `"use client"` component; it is rendered by `app/admin/page.tsx` once the password gate is passed
- Call `listContactMessages()` on mount using `useEffect` (or a data-fetching hook); manage `status: 'loading' | 'success' | 'error'` and `messages: ContactMessage[]` in local state
- Timestamp formatting: use `Intl.DateTimeFormat` or `toLocaleString()` — do not add a new date library just for this
- Render each message as a Shadcn `<Card />` (or similar), showing all five required fields: name, email, subject, message body, timestamp
- The retry button should call `listContactMessages()` again and reset state to `'loading'` while the request is in flight
- Reuse types from `web/src/types/contact.ts`: `ContactMessage`, `ContactMessageListResponse`
- Base API URL: `http://localhost:3001/api` (as defined in `generated-docs/specs/api-spec.yaml`)

## Out of Scope

- Password gate UI (Story 1)
- Reply, delete, archive, or mark-as-read actions (out of scope per feature spec)
- Pagination (out of scope per R19 — all messages returned in a single response)
- Per-message detail view or modal
- Read/unread status indicators
