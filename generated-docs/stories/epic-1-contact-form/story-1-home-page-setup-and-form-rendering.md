# Story: Contact Form — Home Page Setup and Form Rendering

**Epic:** Contact Form | **Story:** 1 of 3 | **Wireframe:** Screen 1 (Contact Form — Default/Empty State)

## Story Metadata

| Field | Value |
|-------|-------|
| **Route** | `/` |
| **Target File** | `app/page.tsx` |
| **Page Action** | `modify_existing` |

## User Story

**As a** site visitor **I want** to see the Contact Me page with a fully rendered contact form when I visit the home page **So that** I can find and fill in the form to send a message to the site owner.

## Acceptance Criteria

### Home Page Renders the Contact Form

- [ ] Given I visit `/`, when the page loads, then I see a heading "Contact Me" on the page
- [ ] Given I visit `/`, when the page loads, then the default template placeholder content is no longer visible
- [ ] Given I visit `/`, when the page loads, then I see the embedded contact form on the page

### Name Field

- [ ] Given I am on the home page, when the form is rendered, then I see a visible label "Name" associated with a text input field
- [ ] Given I am on the home page, when I type in the Name field, then the field reflects the typed value

### Email Field

- [ ] Given I am on the home page, when the form is rendered, then I see a visible label "Email" associated with a text input field
- [ ] Given I am on the home page, when I type in the Email field, then the field reflects the typed value

### Subject Field

- [ ] Given I am on the home page, when the form is rendered, then I see a visible label "Subject" associated with a dropdown (select) control
- [ ] Given I am on the home page, when I open the Subject dropdown, then I see the four options: "General Inquiry", "Work Inquiry", "Feedback", and "Other"
- [ ] Given I am on the home page, when the form first renders, then the Subject dropdown shows a placeholder prompt (no option is pre-selected)

### Message Field

- [ ] Given I am on the home page, when the form is rendered, then I see a visible label "Message" associated with a textarea
- [ ] Given I am on the home page, when I type in the Message textarea, then the field reflects the typed value

### Character Counter

- [ ] Given I am on the home page, when the form is rendered, then I see the character counter displaying "0 / 1000" below the Message textarea
- [ ] Given I am on the home page, when I type characters into the Message textarea, then the character counter updates to reflect the current count (e.g., "5 / 1000")

### Send Message Button

- [ ] Given I am on the home page, when the form is rendered, then I see a "Send Message" button in its enabled state
- [ ] Given I am on the home page, when the form is rendered, then the Send Message button is not in a loading or disabled state

### Honeypot Field (Invisible to Users)

- [ ] Given I am on the home page, when the form is rendered, then the honeypot input field is not visible to sighted users
- [ ] Given I am on the home page, when the form is rendered, then the honeypot field has no visible label or styling that would reveal its presence to a human user

### reCAPTCHA v3 Integration

- [ ] Given `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is defined in the environment, when the page loads, then the reCAPTCHA v3 invisible widget initializes without displaying any visible badge or UI in the form area

### Accessibility

- [ ] Given I am on the home page, when I navigate with the keyboard, then all four form fields (Name, Email, Subject, Message) and the Send Message button are reachable via Tab key
- [ ] Given I am on the home page, when I interact with a form field, then it shows a visible focus indicator

## API Endpoints (from OpenAPI spec)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/contact-messages` | Submit a contact form message (used in Story 3) |
| GET | `/contact-messages` | Retrieve all submitted messages (used in Epic 2) |

The `submitContactMessage` function in `lib/api/contact.ts` is created in this story to be consumed by Story 3. The `listContactMessages` function should also be scaffolded here for use by Epic 2.

## Implementation Notes

- Modify `web/src/app/page.tsx` — replace template content with the "Contact Me" heading and the `<ContactForm />` component
- Create `web/src/components/ContactForm.tsx` (or `ContactForm/index.tsx`) as a `"use client"` component
- The form renders all four visible fields using Shadcn UI components (`<Input />`, `<Select />`, `<Textarea />`, `<Button />`, `<Label />`)
- The honeypot input must use CSS or `aria-hidden` to keep it invisible to both sighted users and screen readers; it must NOT use `display:none` or `visibility:hidden` as bots may detect these — use off-screen positioning (e.g., `position: absolute; left: -9999px`) and omit a visible label
- reCAPTCHA v3 is invisible — no badge should appear within the form; the widget is initialized via the `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` env var. A library such as `react-google-recaptcha-v3` may be used.
- Create `web/src/lib/api/contact.ts` with:
  - `submitContactMessage(data: SubmitContactMessageRequest): Promise<ContactMessage>` using `post<ContactMessage>('/contact-messages', data)`
  - `listContactMessages(): Promise<ContactMessageListResponse>` using `get<ContactMessageListResponse>('/contact-messages')`
- Create `web/src/types/contact.ts` with TypeScript types mirroring the OpenAPI schemas: `ContactMessage`, `SubmitContactMessageRequest`, `ContactMessageListResponse`, `ErrorResponse`, and `SubjectEnum`
- The character counter reads from the controlled textarea value and is right-aligned below the textarea
- Base API URL: `http://localhost:3001/api` (as defined in `generated-docs/specs/api-spec.yaml`)
