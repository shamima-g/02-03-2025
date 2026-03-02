# Story: Contact Form — Submission Flow (Loading, Success, Spam Protection)

**Epic:** Contact Form | **Story:** 3 of 3 | **Wireframe:** Screen 3 (Submitting/Loading State), Screen 4 (Success State)

## Story Metadata

| Field | Value |
|-------|-------|
| **Route** | `/` |
| **Target File** | `app/page.tsx` (via `ContactForm` component) |
| **Page Action** | `modify_existing` |

## User Story

**As a** site visitor **I want** the form to clearly show me that my message is being sent, confirm when it succeeds, let me send another message, and silently reject bot submissions **So that** I have a trustworthy, smooth experience submitting my message.

## Acceptance Criteria

### Loading State

- [ ] Given the form is fully valid and honeypot is empty, when I click Send Message, then the Send Message button immediately becomes disabled and shows a loading indicator (e.g., spinner or "Sending..." text)
- [ ] Given I click Send Message, when the API call is in progress, then the four form fields remain visible and their values are unchanged during loading
- [ ] Given I click Send Message, when the API call is in progress, then the loading state persists until the API response is received

### Success State — Form Replaced by Confirmation

- [ ] Given I submitted a valid form and the API returns a success response, when the success state renders, then the form fields (Name, Email, Subject, Message) are no longer visible on the page
- [ ] Given I submitted a valid form and the API returns success, when the success state renders, then I see a success confirmation region containing a checkmark icon
- [ ] Given I submitted a valid form and the API returns success, when the success state renders, then I see the heading "Message Sent!" within the success confirmation region
- [ ] Given I submitted a valid form and the API returns success, when the success state renders, then I see body text within the success confirmation region (e.g., "Thanks for reaching out. I'll get back to you soon.")
- [ ] Given the success state is rendered, then keyboard focus is programmatically moved to the success confirmation region

### "Send Another Message" Reset

- [ ] Given the success state is displayed, when I see the page, then there is a "Send another message" button visible
- [ ] Given the success state is displayed, when I click "Send another message", then the success confirmation region is replaced by the contact form in its initial empty state
- [ ] Given I clicked "Send another message" and the form re-renders, then all four fields (Name, Email, Subject, Message) are empty / reset to their default values
- [ ] Given I clicked "Send another message" and the form re-renders, then the character counter shows "0 / 1000"
- [ ] Given I clicked "Send another message" and the form re-renders, then the Send Message button is in its enabled idle state

### Honeypot Silent Rejection

- [ ] Given the honeypot hidden field has been filled with any value, when I click Send Message and all other fields are valid, then no API call is made
- [ ] Given the honeypot hidden field has been filled and I click Send Message, then the form transitions to the success state as if the submission succeeded
- [ ] Given the honeypot hidden field has been filled and I click Send Message, then the experience is visually identical to a genuine successful submission (the user cannot distinguish the honeypot path from the real success path)

### reCAPTCHA v3 Token in Submission Payload

- [ ] Given the form is valid and the honeypot is empty, when I click Send Message, then the reCAPTCHA v3 widget is invoked to obtain a token before the API call is made
- [ ] Given a reCAPTCHA v3 token has been obtained, when the API call is made to `POST /contact-messages`, then the request body includes the `recaptchaToken` field with the obtained token value

### API Call — Genuine Submission

- [ ] Given the form is valid and the honeypot is empty, when I click Send Message, then a POST request is sent to `http://localhost:3001/api/contact-messages` via the API client
- [ ] Given the form is valid and the honeypot is empty, when the API call is made, then the request body contains the `name`, `email`, `subject`, `message`, and `recaptchaToken` fields

### Development Mock Behavior

- [ ] Given the development mock is active, when I submit a valid form, then the mock introduces approximately a 1-second delay before returning a success response
- [ ] Given the development mock is configured to return a failure, when I submit a valid form, then the API error banner is displayed (verifying the error path is testable, per R15)

## API Endpoints (from OpenAPI spec)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/contact-messages` | Submit contact form — called on genuine (non-honeypot) valid submissions; request body: `SubmitContactMessageRequest`; success response: `201 ContactMessage`; error responses: `400`, `422`, `500` |

## Implementation Notes

- The loading state is managed by an `isSubmitting` boolean in component state; set to `true` immediately on valid submit, `false` after the API response (success or failure)
- On success: set a `submitted` boolean state to `true`, which renders the success confirmation region and hides the form fields
- The success region must have `tabIndex={-1}` and a `ref`; call `ref.current.focus()` after transitioning to the success state (R9, NFR2)
- The success region is described in Screen 4: checkmark icon, "Message Sent!" heading, body text "Thanks for reaching out. I'll get back to you soon.", and a "Send another message" secondary/ghost button
- "Send another message" resets all form field state values to empty strings and sets `submitted` back to `false`
- Honeypot check: in the `onSubmit` handler, before calling reCAPTCHA or the API, check if the honeypot field value is non-empty. If so, skip the API call, wait ~1 second (simulate delay), then set `submitted = true` (BR6)
- reCAPTCHA v3: call `executeRecaptcha('submit_contact')` (or equivalent) from the reCAPTCHA provider hook to obtain the token; pass it as `recaptchaToken` in the `SubmitContactMessageRequest`
- Development mock: `submitContactMessage` in `lib/api/contact.ts` should be mockable in tests via Jest mocking. For the dev environment, a commented-out mock or a flag can simulate the ~1-second delay and always-success behavior (R15)
- Wireframe reference — Screen 3 shows the form with the Send Message button in a disabled/spinner state. Screen 4 shows the success confirmation region with the checkmark, heading, body text, and "Send another message" button.
