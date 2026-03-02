# Screen: Contact Form — Default/Empty State (Public)

## Purpose
The embeddable contact form in its initial empty state, ready for a visitor to fill in and submit a message.

## Wireframe

```
+--------------------------------------------------+
|                  Contact Me                      |
|--------------------------------------------------|
|                                                  |
|  Name *                                          |
|  +--------------------------------------------+ |
|  | [Name...]                                  | |
|  +--------------------------------------------+ |
|                                                  |
|  Email *                                         |
|  +--------------------------------------------+ |
|  | [Email...]                                 | |
|  +--------------------------------------------+ |
|                                                  |
|  Subject *                                       |
|  +--------------------------------------------+ |
|  | [Select a subject...               v]      | |
|  +--------------------------------------------+ |
|                                                  |
|  Message *                                       |
|  +--------------------------------------------+ |
|  |                                            | |
|  |                                            | |
|  |                                            | |
|  |                                            | |
|  +--------------------------------------------+ |
|                                       0 / 1000   |
|                                                  |
|  <!-- hidden honeypot field (not rendered) -->   |
|  <!-- reCAPTCHA v3 invisible widget -->          |
|                                                  |
|                       [        Send Message    ] |
+--------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Name | Text input | Required. Visible label "Name *". Accepts free text; min 2 characters (BR1). |
| Email | Text input | Required. Visible label "Email *". Accepts email format (BR2). |
| Subject | Dropdown | Required. Visible label "Subject *". Options: "General Inquiry", "Work Inquiry", "Feedback", "Other" (R3, BR3). Placeholder text "Select a subject..." shown when nothing is selected. |
| Message | Textarea | Required. Visible label "Message *". Multi-line; min 10 chars, max 1000 chars (BR4, BR5). Resizable vertically. |
| Character counter | Text (read-only) | Displays "0 / 1000" below the textarea, right-aligned. Updates on each keystroke (R4). |
| Honeypot field | Hidden input | Invisible to human users; not rendered in the visible layout (R13). |
| reCAPTCHA v3 widget | Invisible widget | Loads invisibly using NEXT_PUBLIC_RECAPTCHA_SITE_KEY; no visible UI element (R14). |
| Send Message button | Button (primary) | Submits the form. Enabled when all fields contain values; disabled when Message exceeds 1000 chars (BR5). |

## User Actions

- **Fill Name field:** User types a name; field reflects typed value.
- **Fill Email field:** User types an email address; field reflects typed value.
- **Select Subject:** User opens dropdown and selects one of the four options.
- **Fill Message textarea:** User types message; character counter increments in real time.
- **Click Send Message:** Triggers form validation on submission (see Screen 2 for errors, Screen 3 for loading, Screen 4 for success).

## Navigation

- **From:** Any page of the application that embeds the contact form component; visitor arrives via direct URL, navigation link, or referral.
- **To:** Contact Form — Validation/Error State (Screen 2) if validation fails; Contact Form — Submitting/Loading State (Screen 3) if validation passes.

## Notes

- The form is a single-column layout on all screen sizes (NFR1).
- All labels are visible and associated with their fields for accessibility (NFR2).
- No reset/clear button is shown (R12). No confirmation dialog before submission (R12).
- All interactive elements must have visible focus indicators for keyboard navigation (NFR2).
- Theming (light/dark) follows OS prefers-color-scheme; no toggle is shown (R13, BR9).
