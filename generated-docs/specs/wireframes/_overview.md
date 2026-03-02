# Wireframes: Contact Form with Admin Inbox

## Summary

Six screens covering the full user journey for the contact form (public visitor) and the admin inbox (site owner). The contact form is an embeddable single-column component with four states: default/empty, validation+error, submitting/loading, and success. The admin inbox is a password-gated read-only message list with six screens total.

## Screens

| # | Screen | Description | File |
|---|--------|-------------|------|
| 1 | Contact Form — Default/Empty State | The empty, ready-to-fill contact form for public visitors. Covers R1–R5, R12–R14. | `screen-1-contact-form-default.md` |
| 2 | Contact Form — Validation/API Error State | Inline field errors on invalid submission and/or an API error banner at the form top. Covers R6, R7, R11, BR1–BR5. | `screen-2-contact-form-validation-error.md` |
| 3 | Contact Form — Submitting/Loading State | Transient state with a disabled, spinner-showing submit button during the API call. Covers R8. | `screen-3-contact-form-submitting.md` |
| 4 | Contact Form — Success State | Inline success confirmation replaces the form; includes "Send another message" control. Covers R9, R10, BR6. | `screen-4-contact-form-success.md` |
| 5 | Admin Inbox — Password Gate | Centered password form guarding the admin inbox; shows error on wrong password. Covers R17, BR8. | `screen-5-admin-password-gate.md` |
| 6 | Admin Inbox — Message List | Read-only list of all submitted contact messages; also covers loading, empty, and error sub-states. Covers R16, R18, R19. | `screen-6-admin-inbox-message-list.md` |

## Screen Flow

```
Public visitor:

  [Screen 1: Default Form]
        |
        | submit (invalid fields)
        v
  [Screen 2: Validation/Error State] <--+
        |                               |
        | all fields corrected;         | API failure
        | re-submit                     |
        v                               |
  [Screen 3: Submitting/Loading] -------+
        |
        | API success (or honeypot-silenced)
        v
  [Screen 4: Success State]
        |
        | "Send another message"
        v
  [Screen 1: Default Form] (reset)


Admin:

  [Screen 5: Password Gate]
        |
        | correct password
        v
  [Screen 6: Admin Inbox — Message List]
```

## Design Notes

- **Layout:** Both the contact form and the admin inbox use a single-column layout suitable for all screen sizes (NFR1).
- **Accessibility:** All form fields have visible labels; focus is programmatically managed after submission success (to Screen 4) and API failure (to Screen 2 error banner); all interactive elements are keyboard-navigable (NFR2 / WCAG 2.1 AA).
- **Theming:** No theme toggle is shown in any screen. Light and dark mode are determined by the OS/browser `prefers-color-scheme` media query (BR9, NFR3).
- **Spam protection:** The honeypot field (R13) is not rendered visually in any screen. The reCAPTCHA v3 widget (R14) is invisible and shown only as a note in Screen 1.
- **Admin authentication:** Frontend-only password comparison against the `ADMIN_PASSWORD` environment variable (BR8). No session management UI shown.
- **Component reuse:** The contact form (Screens 1–4) is a self-contained component that manages its own state transitions.
