# Feature: Contact Form with Admin Inbox

## Problem Statement

Site visitors on a personal portfolio/blog currently have no direct way to send inquiries to the site owner. This feature provides a reusable, embedded contact form that allows any visitor to submit a message with their name, email address, subject, and a message body. Submitted messages are stored via a backend API and are viewable by the site owner through a protected admin inbox.

---

## User Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| Public (Visitor) | Any unauthenticated site visitor | Can view and submit the contact form; receives inline success or error feedback |
| Admin (Site Owner) | The portfolio/blog owner, authenticated via a frontend password gate | Can view all submitted contact messages in an admin inbox; cannot reply, delete, or mark messages as read in the initial scope |

---

## Functional Requirements

### Contact Form

- **R1:** The contact form renders as a reusable, embeddable component that can be placed on any page of the application.
- **R2:** The form displays four input fields: Name (text), Email (text), Subject (dropdown), and Message (textarea).
- **R3:** The Subject field is a dropdown with exactly four options: "General Inquiry", "Work Inquiry", "Feedback", and "Other".
- **R4:** The Message textarea displays a visible character counter showing the current character count out of the 1000-character maximum (e.g., "42 / 1000").
- **R5:** All four fields (Name, Email, Subject, Message) are required. The form cannot be submitted unless all fields contain valid values.
- **R6:** Validation runs on form submission. When the form is submitted with one or more invalid fields, all invalid fields are highlighted simultaneously, each with an individual inline error message directly beneath the field.
- **R7:** After a field error is shown, the error message for that individual field clears as soon as the user corrects the value in that field (without requiring re-submission).
- **R8:** The submit button enters a disabled, loading-indicator state immediately upon submission and remains in that state until the API response is received.
- **R9:** On successful submission, the form is replaced by an inline success confirmation message. The success message area receives keyboard focus after the transition.
- **R10:** The success confirmation message includes a "Send another message" control that, when activated, resets the form to its initial empty state and displays the form again.
- **R11:** On submission failure (API error), an inline error message is displayed at the top of the form. The form fields and their current values are preserved. The error message area receives keyboard focus after the transition.
- **R12:** The form does not include a reset/clear button and does not display a confirmation dialog before submission.
- **R13:** The form includes a hidden honeypot field that is not visible to human users. If this field contains any value on submission, the submission is silently rejected on the frontend (the form appears to succeed but no API call is made).
- **R14:** The form integrates Google reCAPTCHA v3 (invisible, score-based). The reCAPTCHA site key is read from the `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` environment variable. The reCAPTCHA token is included in the submission payload sent to the backend.
- **R15:** During development and testing, the API submission is simulated with a mock that introduces approximately a 1-second delay and always returns a success response. The error state is testable by modifying the mock to return a failure response.

### Admin Inbox

- **R16:** A protected admin inbox page displays all submitted contact messages retrieved from the backend API.
- **R17:** The admin inbox is accessible only after the user passes a frontend password gate. The expected password is read from an environment variable on the frontend.
- **R18:** Each message in the admin inbox displays the sender's name, email address, subject, message body, and submission timestamp.
- **R19:** The admin inbox displays messages as received from the API with no pagination in the initial scope.

---

## Business Rules

- **BR1:** The Name field value must be at least 2 characters long. Submissions where Name is fewer than 2 characters are rejected with the error: "Name must be at least 2 characters."
- **BR2:** The Email field value must match the standard email format (user@domain.tld). Submissions with an invalid email format are rejected with the error: "Please enter a valid email address."
- **BR3:** The Subject field must have one of the four defined options selected. Submissions where no subject is selected are rejected with the error: "Please select a subject."
- **BR4:** The Message field value must be at least 10 characters long. Submissions where Message is fewer than 10 characters are rejected with the error: "Message must be at least 10 characters."
- **BR5:** The Message field value must not exceed 1000 characters. The submit button is disabled and the counter styling changes to indicate the limit has been reached or exceeded when the message length is at or above 1000 characters.
- **BR6:** If the hidden honeypot field contains any value at the time of submission, the submission is silently dropped on the frontend. No API call is made and the success confirmation is displayed as if the submission succeeded.
- **BR7:** The reCAPTCHA token generated by the Google reCAPTCHA v3 widget must be included in the request body sent to the API. The backend is responsible for verifying the token score; the frontend does not interpret the score.
- **BR8:** The admin password gate uses a password stored in a frontend environment variable. There is no backend authentication endpoint. The admin inbox is rendered only when the entered password matches the environment variable value.
- **BR9:** The application theme (light or dark) is determined exclusively by the user's OS/browser `prefers-color-scheme` media query setting. No manual theme toggle is provided.

---

## Data Model

| Entity | Key Fields | Relationships |
|--------|-----------|---------------|
| ContactMessage | `name` (string, min 2 chars), `email` (string, valid email format), `subject` (enum: General Inquiry \| Work Inquiry \| Feedback \| Other), `message` (string, min 10 chars, max 1000 chars), `timestamp` (datetime, auto-generated by backend on creation) | None (standalone entity) |

---

## Key Workflows

### Workflow 1: Successful Contact Form Submission

1. Visitor navigates to a page containing the embedded contact form.
2. Visitor fills in Name, Email, Subject (dropdown), and Message fields.
3. Visitor clicks the "Submit" button.
4. The frontend validates all fields simultaneously on submission. All fields are valid in this path.
5. The frontend checks the honeypot field — it is empty, so the submission proceeds.
6. The frontend calls the reCAPTCHA v3 API to obtain an invisible token.
7. The frontend calls the backend API with the form payload (name, email, subject, message, reCAPTCHA token).
8. The submit button enters a disabled, loading state during the API call (~1 second mock delay).
9. The API returns a success response.
10. The form is replaced by an inline success confirmation message. Keyboard focus moves to the confirmation message.
11. The visitor optionally activates "Send another message", which resets and re-displays the empty form.

### Workflow 2: Submission with Validation Errors

1. Visitor clicks the "Submit" button with one or more invalid or empty fields.
2. All invalid fields are highlighted simultaneously. Each invalid field displays an individual inline error message below it.
3. The submit button does not enter a loading state and no API call is made.
4. The visitor corrects a field. The error message for that field clears immediately.
5. Once all fields are valid, the visitor submits again. The happy path (Workflow 1) continues from step 5.

### Workflow 3: Submission API Failure

1. Visitor submits a valid form (all fields pass validation, honeypot is empty).
2. The frontend calls the backend API. The submit button enters a loading state.
3. The API returns an error response.
4. An inline error message is displayed at the top of the form. The form fields retain their current values. Keyboard focus moves to the error message.
5. The visitor may correct or retry by clicking "Submit" again.

### Workflow 4: Honeypot Triggered (Bot Submission)

1. A bot fills in all fields including the hidden honeypot field and submits the form.
2. The frontend detects the honeypot field has a value.
3. No API call is made. The frontend simulates success by replacing the form with the success confirmation message.

### Workflow 5: Admin Views Submitted Messages

1. The admin navigates to the admin inbox page.
2. The admin is presented with a password input gate.
3. The admin enters the password. The frontend compares it against the `ADMIN_PASSWORD` environment variable.
4. If the password matches, the admin inbox is rendered. The frontend fetches all submitted messages from the backend API.
5. Messages are displayed in the inbox, each showing name, email, subject, message body, and timestamp.
6. If the password does not match, an error is shown and the password gate remains.

---

## Non-Functional Requirements

- **NFR1 (Responsive):** The contact form renders as a single-column layout on all screen sizes. All form elements are legible and usable on mobile viewports.
- **NFR2 (Accessibility — WCAG 2.1 AA):** All form fields have associated visible labels. All interactive elements are keyboard-navigable and have visible focus indicators. After a successful submission, keyboard focus is programmatically moved to the success confirmation message. After a submission failure, keyboard focus is programmatically moved to the inline error message at the top of the form.
- **NFR3 (Theming):** Light and dark mode are both supported. The active theme is determined entirely by the user's OS/browser `prefers-color-scheme` media query. No manual toggle is provided.
- **NFR4 (Performance):** No specific performance targets beyond Next.js default behavior (static rendering, automatic code splitting, image optimization).
- **NFR5 (Environment Variables):** The following environment variables must be defined: `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` (Google reCAPTCHA v3 site key), and a frontend admin password variable (name to be confirmed during DESIGN). These must be documented in the project README or `.env.example` file.

---

## Out of Scope

- Email delivery: No emails are sent to the site owner when a message is submitted. The backend stores the message; notification is out of scope.
- File attachments: The form does not support uploading or attaching files.
- Admin reply: The admin inbox is read-only. Replying to messages is not in scope.
- Admin delete / mark-as-read: Message management actions (delete, archive, mark as read) are not in scope for the initial version.
- Pagination: The admin inbox loads all messages without pagination in the initial scope. Pagination may be added in a future iteration if message volume grows.
- Phone and company fields: The form captures only name, email, subject, and message.
- User authentication system: The admin gate is a simple frontend password check. No user accounts, sessions, or backend authentication endpoints are in scope.
- reCAPTCHA score interpretation on the frontend: Score evaluation is the backend's responsibility.

---

## Source Traceability

| ID | Source | Reference |
|----|--------|-----------|
| R1 | User input | Clarifying question: "How should the contact form be placed on the page?" — answer: embedded reusable component |
| R2 | intake-manifest.json | context.projectDescription — "name, email, subject, and message fields" |
| R3 | User input | Clarifying question: "What options should the Subject dropdown contain?" — answer: General Inquiry, Work Inquiry, Feedback, Other |
| R4 | User input | Clarifying question: "Is there a character limit on the Message field?" — answer: 1000 characters with visible counter |
| R5 | User input | Clarifying question: "Are all fields required?" — answer: yes, all four required |
| R6 | User input | Clarifying question: "When should validation run?" — answer: on submission, all invalid fields highlighted simultaneously |
| R7 | User input | Clarifying question: "When should field errors clear?" — answer: as corrected |
| R8 | User input | Clarifying question: "What should the submit button do during submission?" — answer: disabled + loading state |
| R9 | User input | Clarifying question: "What happens after successful submission?" — answer: form replaced by inline success message |
| R10 | User input | Clarifying question: "What happens after successful submission?" — answer: "Send another message" option resets form |
| R11 | User input | Clarifying question: "What happens on submission failure?" — answer: inline error at top, form data preserved |
| R12 | User input | Clarifying question: "Should there be a reset/clear button or confirmation dialog?" — answer: no to both |
| R13 | User input | Clarifying question: "What spam protection mechanisms should be used?" — answer: honeypot field |
| R14 | User input | Clarifying question: "What spam protection mechanisms should be used?" — answer: Google reCAPTCHA v3, NEXT_PUBLIC_RECAPTCHA_SITE_KEY |
| R15 | User input | Clarifying question: "How should API submissions behave during development?" — answer: mock with ~1s delay, always succeeds, error state testable |
| R16 | User input | Clarifying question: "What can the admin role do?" — answer: view submitted messages via admin inbox |
| R17 | User input | Clarifying question: "How is admin authentication handled?" — answer: frontend password gate using env variable |
| R18 | User input | Clarifying question: "What data should be shown per message in the admin inbox?" — derived from ContactMessage entity fields |
| R19 | User input | Clarifying question: "Is pagination needed in the admin inbox?" — answer: no pagination in initial scope |
| BR1 | User input | Clarifying question: "What is the minimum length for the Name field?" — answer: 2 characters |
| BR2 | User input | Clarifying question: "What email validation is required?" — answer: standard format user@domain.tld |
| BR3 | User input | Clarifying question: "Is the Subject field required?" — derived from R5 (all fields required) |
| BR4 | User input | Clarifying question: "What is the minimum length for the Message field?" — answer: 10 characters |
| BR5 | User input | Clarifying question: "Is there a character limit on the Message field?" — answer: 1000 character max |
| BR6 | User input | Clarifying question: "What spam protection mechanisms should be used?" — answer: honeypot silent rejection |
| BR7 | User input | Clarifying question: "What spam protection mechanisms should be used?" — answer: reCAPTCHA token included in payload |
| BR8 | User input | Clarifying question: "How is admin authentication handled?" — answer: frontend env variable password comparison |
| BR9 | User input | Clarifying question: "How should light/dark mode theming be handled?" — answer: OS/browser prefers-color-scheme only, no manual toggle |
