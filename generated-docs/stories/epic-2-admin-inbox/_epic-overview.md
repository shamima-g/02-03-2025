# Epic 2: Admin Inbox

## Description

Deliver a password-gated admin page where the site owner can view all submitted contact messages. The admin navigates to `/admin`, is presented with a password input gate, and upon entering the correct password (compared against a frontend environment variable) the inbox is revealed. The inbox fetches all messages from the backend API and renders them with appropriate loading, error, and empty states. No backend authentication is involved — the gate is a purely client-side check (BR8). TypeScript types and the API client function `listContactMessages` are already established by Epic 1 and are reused here.

## Stories

1. **Admin Inbox — Password Gate** - Create the `/admin` page with a client-side password gate: password input, submit button, wrong-password error, and correct-password unlock that reveals the inbox area | File: `story-1-password-gate.md` | Status: Pending
2. **Admin Inbox — Message List** - Fetch and display all submitted contact messages in the unlocked inbox: loading state, error state, empty state, and populated message list with all required fields and formatted timestamps | File: `story-2-message-list.md` | Status: Pending
