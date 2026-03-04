# Story: File-based Message Storage

**Epic:** Admin Inbox | **Story:** 3 of 3 | **Wireframe:** N/A

## Story Metadata

| Field | Value |
|-------|-------|
| **Route** | N/A (API routes only) |
| **Target File** | `app/api/messages/route.ts` |
| **Page Action** | `create_new` |

## User Story

**As a** developer **I want** form submissions saved to a local JSON file and the admin inbox to read from that file **So that** the app works without an external backend.

## Acceptance Criteria

### POST /api/messages — Save a New Message

- [ ] Given a POST request is made to `/api/messages` with valid fields (name, email, subject, message), when it is processed, then a new message is saved to `generated-docs/data/messages.json`
- [ ] Given a new message is saved, when it is written to the JSON file, then it includes an `id` field (UUID v4 string)
- [ ] Given a new message is saved, when it is written to the JSON file, then it includes the submitted `name`, `email`, `subject`, and `message` values unchanged
- [ ] Given a new message is saved, when it is written to the JSON file, then it includes a `timestamp` field as an ISO 8601 date string
- [ ] Given multiple messages have been saved, when the JSON file is read, then the most recently submitted message appears first (newest-first order)
- [ ] Given a POST request to `/api/messages` succeeds, when the response is returned, then it has HTTP status 201 and the body is the newly created `ContactMessage` object

### POST /api/messages — Validation

- [ ] Given a POST request to `/api/messages` is missing one or more required fields (name, email, subject, or message), when it is processed, then the response has HTTP status 400
- [ ] Given a POST request to `/api/messages` is missing required fields, when the error response is returned, then the body contains an `error` field describing the problem

### GET /api/messages — Read Messages

- [ ] Given messages have been saved, when a GET request is made to `/api/messages`, then the response contains a `messages` array with all saved messages
- [ ] Given messages have been saved, when a GET request is made to `/api/messages`, then the response contains a `total` field equal to the number of messages
- [ ] Given the `generated-docs/data/messages.json` file does not exist, when a GET request is made to `/api/messages`, then the response is `{ "messages": [], "total": 0 }` with HTTP status 200

### Contact Form Integration

- [ ] Given a user fills out and submits the contact form, when the form is submitted, then the form's API call targets `POST /api/messages` (not an external backend)

### Admin Inbox Integration

- [ ] Given the admin has unlocked the inbox, when messages are fetched, then the inbox reads from `GET /api/messages` (not an external backend)

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/messages` | Save a new contact message to the local JSON file |
| GET | `/api/messages` | Read all saved messages from the local JSON file |

These are Next.js App Router API routes defined in `web/src/app/api/messages/route.ts`. They are served by the Next.js dev server at `http://localhost:3000/api/messages` — no external backend is required.

## Implementation Notes

- **Data file path:** `generated-docs/data/messages.json` (relative to the monorepo root, resolved at runtime via `path.join(process.cwd(), '..', 'generated-docs', 'data', 'messages.json')`)
- **File format:** `{ "messages": ContactMessage[], "total": number }` matching `ContactMessageListResponse`
- **Types used:** `ContactMessage`, `ContactMessageListResponse`, `SubjectEnum` from `web/src/types/contact.ts`
- **ID generation:** `crypto.randomUUID()` (Node.js built-in, no external dependency)
- **Timestamp:** `new Date().toISOString()`
- **Newest-first ordering:** new messages are prepended to the array (`[newMessage, ...existing]`)
- **Missing file handling:** `GET` returns `{ messages: [], total: 0 }` if the file does not exist or cannot be parsed
- **API client wiring:** `web/src/lib/api/contact.ts` calls `/api/messages` for both `submitContactMessage` and `listContactMessages`; with `NEXT_PUBLIC_API_BASE_URL=` (empty string) in `.env.local`, the API client uses relative URLs resolved against the Next.js dev server
- **Seed file:** `generated-docs/data/messages.json` is pre-created with `{"messages":[],"total":0}`

## Out of Scope

- reCAPTCHA server-side token validation (the `recaptchaToken` field is accepted but not verified)
- Pagination (all messages returned in a single response)
- Message deletion, archiving, or status flags
- Authentication or session-based access control on the API routes
- External database or third-party storage
