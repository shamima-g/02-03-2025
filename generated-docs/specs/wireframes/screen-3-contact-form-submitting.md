# Screen: Contact Form — Submitting/Loading State (Public)

## Purpose
The contact form in the transient loading state that appears immediately after the user clicks "Send Message" with a valid form. The submit button is disabled and shows a loading indicator while the API call is in flight.

## Wireframe

```
+--------------------------------------------------+
|                  Contact Me                      |
|--------------------------------------------------|
|                                                  |
|  Name *                                          |
|  +--------------------------------------------+ |
|  | Jane Doe                                   | |  <-- value preserved, field is read-only-looking
|  +--------------------------------------------+ |
|                                                  |
|  Email *                                         |
|  +--------------------------------------------+ |
|  | jane@example.com                           | |
|  +--------------------------------------------+ |
|                                                  |
|  Subject *                                       |
|  +--------------------------------------------+ |
|  | Work Inquiry                        v      | |
|  +--------------------------------------------+ |
|                                                  |
|  Message *                                       |
|  +--------------------------------------------+ |
|  | I'd love to discuss a potential project... | |
|  |                                            | |
|  |                                            | |
|  +--------------------------------------------+ |
|                                      44 / 1000   |
|                                                  |
|                 [ (o) Sending...   (disabled)  ] |  <-- button disabled + spinner icon (R8)
+--------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Name | Text input | Displays the submitted value. Visually appears unchanged; interaction may be suppressed while in-flight, but focus management is on the button. |
| Email | Text input | Displays the submitted value. |
| Subject | Dropdown | Displays the selected option. |
| Message | Textarea | Displays the submitted message text. |
| Character counter | Text (read-only) | Shows the current message character count / 1000 (unchanged during loading). |
| Send Message button (loading) | Button (primary, disabled) | Immediately disabled on click (R8). Shows an inline spinner icon and label "Sending..." (or equivalent loading text). Remains disabled until the API response is received. |

## User Actions

- **No interactive actions available.** The submit button is disabled. Fields remain visible with submitted values. The user waits for the API response.
- **Result of API success:** Transitions to Contact Form — Success State (Screen 4).
- **Result of API failure:** Transitions to Contact Form — Validation/API Error State (Screen 2), showing the API error banner at top.

## Navigation

- **From:** Contact Form — Default/Empty State (Screen 1) or Contact Form — Validation/Error State (Screen 2), after the user submits a valid form.
- **To:** Contact Form — Success State (Screen 4) on API success; Contact Form — Validation/API Error State (Screen 2) on API failure.

## Notes

- The loading state is transient — it is visible only during the API round-trip (~1 second in the mock; real latency in production).
- The submit button must be disabled immediately upon click, before the API response arrives (R8).
- No skeleton or page-level spinner is shown; only the button state changes.
- This state also covers the honeypot-triggered path (BR6): the frontend simulates a ~1-second wait then transitions directly to the Success State without making any API call.
