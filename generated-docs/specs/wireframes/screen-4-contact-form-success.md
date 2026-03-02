# Screen: Contact Form — Success State (Public)

## Purpose
The inline success confirmation that replaces the contact form after a successful submission. The form fields are no longer visible. Keyboard focus is moved here automatically.

## Wireframe

```
+--------------------------------------------------+
|                  Contact Me                      |
|--------------------------------------------------|
|                                                  |
|                                                  |
|          +--------------------------------+      |
|          |                                |      |
|          |   [checkmark icon]             |      |
|          |                                |      |
|          |   Message Sent!                |      |
|          |                                |      |
|          |   Thanks for reaching out.     |      |
|          |   I'll get back to you soon.   |      |
|          |                                |      |
|          +--------------------------------+      |
|                                                  |
|          [ Send another message ]                |  <-- secondary / ghost button (R10)
|                                                  |
|                                                  |
+--------------------------------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Success confirmation region | Alert / success region | Replaces the entire form (R9). Has a `tabindex="-1"` or `role="status"` so it can receive programmatic keyboard focus (NFR2, R9). Contains a success icon, heading "Message Sent!", and a brief friendly message. |
| Success icon | Decorative icon | Checkmark or envelope icon to visually reinforce the success state. |
| Heading | Text (h-level) | "Message Sent!" — primary confirmation text. |
| Body text | Text | Brief message, e.g., "Thanks for reaching out. I'll get back to you soon." |
| Send another message | Button (secondary / ghost) | When clicked, replaces the success state with the empty contact form in its default state (R10). Resets all field values. |

## User Actions

- **View success message:** User reads the confirmation. Focus is placed here automatically so screen readers announce it (NFR2, R9).
- **Click "Send another message":** The success area is replaced by the empty contact form (Screen 1). All fields are reset to empty values (R10).
- **Navigate away:** User leaves the page; no action needed.

## Navigation

- **From:** Contact Form — Submitting/Loading State (Screen 3) after a successful API response (or honeypot-silent-success per BR6).
- **To:** Contact Form — Default/Empty State (Screen 1) when "Send another message" is activated.

## Notes

- The contact form fields (Name, Email, Subject, Message) are NOT rendered in this state — the success region fully replaces them (R9).
- Keyboard focus is programmatically moved to the success confirmation region immediately after transition (R9, NFR2).
- No countdown timer or auto-redirect occurs; the user stays on the success state until they act.
- The success state appearance is identical for both genuine API success and the honeypot-silenced path (BR6) — the user cannot distinguish between them by design.
