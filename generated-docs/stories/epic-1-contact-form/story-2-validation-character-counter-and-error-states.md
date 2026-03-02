# Story: Contact Form — Validation, Character Counter, and Error States

**Epic:** Contact Form | **Story:** 2 of 3 | **Wireframe:** Screen 2 (Validation/API Error State), Screen 3 (Submitting/Loading State)

## Story Metadata

| Field | Value |
|-------|-------|
| **Route** | `/` |
| **Target File** | `app/page.tsx` (via `ContactForm` component) |
| **Page Action** | `modify_existing` |

## User Story

**As a** site visitor **I want** to receive clear, immediate feedback when my form input is invalid or when a submission fails **So that** I understand exactly what needs to be corrected before my message can be sent.

## Acceptance Criteria

### On-Submit Validation — All Fields Simultaneously

- [ ] Given I am on the home page and all four fields are empty, when I click Send Message, then all four fields are highlighted as invalid at the same time
- [ ] Given I am on the home page and all four fields are empty, when I click Send Message, then I see the error message "Name must be at least 2 characters." beneath the Name field
- [ ] Given I am on the home page and all four fields are empty, when I click Send Message, then I see the error message "Please enter a valid email address." beneath the Email field
- [ ] Given I am on the home page and all four fields are empty, when I click Send Message, then I see the error message "Please select a subject." beneath the Subject field
- [ ] Given I am on the home page and all four fields are empty, when I click Send Message, then I see the error message "Message must be at least 10 characters." beneath the Message field
- [ ] Given I am on the home page and all four fields are empty, when I click Send Message, then no API call is made

### Individual Field Validation Rules

- [ ] Given I am on the home page, when I submit with a Name value of only 1 character, then I see the error "Name must be at least 2 characters." beneath the Name field
- [ ] Given I am on the home page, when I submit with a Name value of 2 or more characters, then no Name error message is shown
- [ ] Given I am on the home page, when I submit with an Email value that does not contain "@", then I see the error "Please enter a valid email address." beneath the Email field
- [ ] Given I am on the home page, when I submit with a properly formatted email (e.g., "user@example.com"), then no Email error message is shown
- [ ] Given I am on the home page, when I submit without selecting a Subject option, then I see the error "Please select a subject." beneath the Subject field
- [ ] Given I am on the home page, when I submit with a Subject option selected, then no Subject error message is shown
- [ ] Given I am on the home page, when I submit with a Message value of only 9 characters, then I see the error "Message must be at least 10 characters." beneath the Message field
- [ ] Given I am on the home page, when I submit with a Message value of 10 or more characters, then no Message minimum-length error message is shown

### Per-Field Error Clearing on Correction

- [ ] Given a Name field error is visible, when I type a value of 2 or more characters into the Name field, then the Name error message clears without requiring re-submission
- [ ] Given an Email field error is visible, when I type a valid email address into the Email field, then the Email error message clears without requiring re-submission
- [ ] Given a Subject field error is visible, when I select a Subject option, then the Subject error message clears without requiring re-submission
- [ ] Given a Message field error is visible (minimum length), when I type 10 or more characters into the Message field, then the Message error message clears without requiring re-submission
- [ ] Given a Name field error is visible, when I correct only the Name field, then the other visible field errors remain unchanged

### Character Counter — Real-Time Updates and Limit Enforcement

- [ ] Given I am on the home page, when I type 42 characters into the Message textarea, then the character counter shows "42 / 1000"
- [ ] Given I am on the home page, when I type 999 characters into the Message textarea, then the character counter shows "999 / 1000" in its normal (non-error) styling
- [ ] Given I am on the home page, when the Message textarea reaches 1000 characters, then the character counter shows "1000 / 1000" with error styling (e.g., red or destructive color) indicating the limit has been reached
- [ ] Given the Message textarea contains 1000 or more characters, when the form is rendered, then the Send Message button is disabled
- [ ] Given the Message textarea contains 999 characters, when the form is rendered, then the Send Message button is not disabled due to the character limit

### Submit Button Disabled During API Call

- [ ] Given the form is valid and I click Send Message, when the API call is in progress, then the Send Message button is disabled and shows a loading indicator
- [ ] Given the API call fails and the error banner is shown, then the Send Message button is re-enabled so the user may retry

### API Error Banner

- [ ] Given the form is fully valid and I click Send Message, when the API returns an error response, then an error banner appears at the top of the form area
- [ ] Given the API error banner is shown, then all four field values I entered are preserved in the form (the form is not reset)
- [ ] Given the API error banner is shown, then keyboard focus moves programmatically to the error banner
- [ ] Given the API error banner is shown and I correct or update a field value, then the error banner remains visible until a new submission attempt is made

### No Submission When Validation Fails

- [ ] Given I click Send Message with one or more invalid fields, when validation errors are displayed, then the Send Message button does not enter a loading state

## API Endpoints (from OpenAPI spec)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/contact-messages` | Submit a contact form message — called only when all client-side validation passes and honeypot is empty |

## Implementation Notes

- Validation runs on form submission (`onSubmit` handler), not on blur or on change
- All field errors are set simultaneously in a single state update so they all appear at once (R6)
- Per-field error clearing: each field's `onChange` handler checks if its current error is set and clears it if the new value satisfies the validation rule (R7)
- Character counter error styling: apply a destructive/red class when `message.length >= 1000`
- The Send Message button `disabled` prop should be `true` when `message.length >= 1000` OR when an API call is in progress (R8, BR5)
- The API error banner should use `tabIndex={-1}` and a `ref` so that `ref.current.focus()` can be called after the API failure response is received (R11, NFR2)
- The loading indicator on the Send Message button can be a spinner icon or "Sending..." label text
- Wireframe reference — Screen 2 shows the error banner above the fields and inline error messages below each field
