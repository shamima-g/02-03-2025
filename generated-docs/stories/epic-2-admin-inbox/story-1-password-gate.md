# Story: Admin Inbox — Password Gate

**Epic:** Admin Inbox | **Story:** 1 of 2 | **Wireframe:** N/A

## Story Metadata

| Field | Value |
|-------|-------|
| **Route** | `/admin` |
| **Target File** | `app/admin/page.tsx` |
| **Page Action** | `create_new` |

## User Story

**As a** site owner **I want** to reach a password-protected admin page and enter my password to unlock the inbox **So that** only I can view submitted contact messages.

## Acceptance Criteria

### Page Renders the Password Gate

- [ ] Given I navigate to `/admin`, when the page loads, then I see a heading that identifies the admin area (e.g., "Admin Inbox")
- [ ] Given I navigate to `/admin`, when the page loads, then I see a password input field with a visible label
- [ ] Given I navigate to `/admin`, when the page loads, then I see a submit button (e.g., "Unlock" or "Enter") to submit the password
- [ ] Given I navigate to `/admin`, when the page loads, then the inbox content is not visible

### Correct Password Unlocks the Inbox

- [ ] Given I am on the `/admin` password gate, when I enter the correct password and submit, then the password gate is no longer visible
- [ ] Given I am on the `/admin` password gate, when I enter the correct password and submit, then the inbox area becomes visible in its place

### Wrong Password Shows an Error

- [ ] Given I am on the `/admin` password gate, when I enter an incorrect password and submit, then I see an inline error message indicating the password is wrong (e.g., "Incorrect password. Please try again.")
- [ ] Given I am on the `/admin` password gate, when I enter an incorrect password and submit, then the password gate remains visible
- [ ] Given I am on the `/admin` password gate, when I enter an incorrect password and submit, then the password input is cleared so the admin can try again

### Accessibility

- [ ] Given I am on the `/admin` password gate, when I navigate with the keyboard, then the password input and submit button are reachable via Tab key
- [ ] Given I am on the `/admin` password gate, when I interact with the password input, then it shows a visible focus indicator

## API Endpoints (from OpenAPI spec)

None — this story involves no API calls. The password check is a purely client-side comparison against the `NEXT_PUBLIC_ADMIN_PASSWORD` (or equivalent) environment variable (BR8).

## Implementation Notes

- Create `web/src/app/admin/page.tsx` as a `"use client"` component (requires state for the password field and unlock status)
- Create `web/src/components/AdminPasswordGate.tsx` (or inline in the page) to encapsulate the gate UI
- The expected password is read from the frontend environment variable (confirm exact name against `.env.example` — likely `NEXT_PUBLIC_ADMIN_PASSWORD` based on BR8 and NFR5)
- Password comparison: `enteredPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD`
- On correct password: set local state to `unlocked = true`, hide the gate, render the `<AdminInbox />` component (scaffolded in Story 2)
- Use Shadcn UI components: `<Input type="password" />`, `<Button />`, `<Label />`
- The inbox area rendered after unlock is implemented fully in Story 2; this story only needs to render a placeholder or the component stub after unlock

## Out of Scope

- Fetching or displaying messages (Story 2)
- Loading or error states for the inbox itself (Story 2)
- Backend authentication or session persistence — the unlock state lives in React state only and resets on page reload
- Logout / re-lock functionality
