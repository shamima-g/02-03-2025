# Screen: Contact Form — Validation/API Error State (Public)

## Purpose
The contact form showing inline validation errors (on failed submission) and/or an API-level error banner at the top of the form. Form field values are preserved.

## Wireframe

```
+--------------------------------------------------+
|                  Contact Me                      |
|--------------------------------------------------|
|                                                  |
|  +--------------------------------------------+ |
|  | ! Something went wrong. Please try again.  | |  <-- API error (R11): shown only on API failure;
|  |   (focuses here automatically)             | |      receives keyboard focus (NFR2)
|  +--------------------------------------------+ |
|                                                  |
|  Name *                                          |
|  +--------------------------------------------+ |
|  | [Jo]                          <- too short  | |  <-- field highlighted (error border)
|  +--------------------------------------------+ |
|  ! Name must be at least 2 characters.           |  <-- inline error (BR1)
|                                                  |
|  Email *                                         |
|  +--------------------------------------------+ |
|  | [not-an-email]                <- bad format | |  <-- field highlighted
|  +--------------------------------------------+ |
|  ! Please enter a valid email address.           |  <-- inline error (BR2)
|                                                  |
|  Subject *                                       |
|  +--------------------------------------------+ |
|  | [Select a subject...               v]       | |  <-- field highlighted
|  +--------------------------------------------+ |
|  ! Please select a subject.                      |  <-- inline error (BR3)
|                                                  |
|  Message *                                       |
|  +--------------------------------------------+ |
|  | [hi]                          <- too short  | |  <-- field highlighted
|  |                                            | |
|  |                                            | |
|  +--------------------------------------------+ |
|  ! Message must be at least 10 characters.       |  <-- inline error (BR4)
|                                           2 / 1000|
|                                                  |
|                       [        Send Message    ] |
+--------------------------------------------------+
```

### Character Limit Exceeded Sub-State

When the Message field reaches or exceeds 1000 characters, the counter changes style
and the Submit button becomes disabled (BR5):

```
+--------------------------------------------+
| [... message text at or over 1000 chars]   |
|                                            |
|                                            |
+--------------------------------------------+
! Message must not exceed 1000 characters.
                               1001 / 1000   <-- counter styled in error/warning color
                                                 Submit button disabled
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| API error banner | Alert / error region | Displayed at the top of the form only on API submission failure (R11). Contains a descriptive error message. Receives keyboard focus automatically (NFR2). |
| Name (error) | Text input (error state) | Field border highlighted. Shows entered (invalid) value. Error message below: "Name must be at least 2 characters." (BR1). |
| Email (error) | Text input (error state) | Field border highlighted. Error message below: "Please enter a valid email address." (BR2). |
| Subject (error) | Dropdown (error state) | Field border highlighted. Error message below: "Please select a subject." (BR3). |
| Message (error) | Textarea (error state) | Field border highlighted. Error message below: "Message must be at least 10 characters." (BR4). |
| Character counter | Text (read-only) | Shows current count / 1000. Styled in error/warning color when at or above 1000 chars. |
| Send Message button | Button (primary) | Enabled unless Message exceeds 1000 chars (BR5). No loading state during pure client-side validation failure (R8). |
| Inline error messages | Text (error) | Each displayed directly beneath its associated field. Clears as soon as the user corrects that field (R7). |

## User Actions

- **Correct a field error:** As soon as the user updates the invalid field to a valid value, the error message for that field disappears (R7). The API error banner persists until the next submission attempt.
- **Correct all fields and re-submit:** Triggers loading state (Screen 3) if all valid; otherwise re-displays errors.
- **Type in Message:** Character counter updates in real time; at 1000+ chars the counter turns error-colored and the Send Message button is disabled.

## Navigation

- **From:** Contact Form — Default/Empty State (Screen 1) after a failed submission attempt.
- **To:** Contact Form — Submitting/Loading State (Screen 3) when re-submitted with all valid fields; stays on this screen while any field is still invalid.

## Notes

- All invalid fields are highlighted simultaneously on a single submit attempt (R6).
- The API error banner and validation errors can co-exist; the API error is shown at top (R11).
- Field values (what the user typed) are always preserved when errors are shown (R11).
- Validation runs client-side on submission; the error state can also reflect an API failure after loading completes.
