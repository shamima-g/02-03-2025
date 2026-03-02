# Screen: Admin Inbox — Password Gate (Admin)

## Purpose
The password prompt that guards access to the admin inbox. The admin must enter the correct password (compared against a frontend environment variable) before the inbox is rendered.

## Wireframe

```
+--------------------------------------------------+
|                                                  |
|                                                  |
|            +----------------------------+        |
|            |                            |        |
|            |  Admin Inbox               |        |
|            |                            |        |
|            |  Password                  |        |
|            |  +----------------------+  |        |
|            |  | [••••••••••]         |  |        |  <-- password input (masked)
|            |  +----------------------+  |        |
|            |                            |        |
|            |  [ ! Wrong password.    ]  |        |  <-- error message (shown only on failure)
|            |                            |        |
|            |  [      Unlock Inbox    ]  |        |  <-- primary button
|            |                            |        |
|            +----------------------------+        |
|                                                  |
|                                                  |
+--------------------------------------------------+
```

### Default (no error) sub-state:

```
+----------------------------+
|                            |
|  Admin Inbox               |
|                            |
|  Password                  |
|  +----------------------+  |
|  | [                  ] |  |  <-- empty, waiting for input
|  +----------------------+  |
|                            |
|  [      Unlock Inbox    ]  |
|                            |
+----------------------------+
```

### Error sub-state (wrong password):

```
+----------------------------+
|                            |
|  Admin Inbox               |
|                            |
|  Password                  |
|  +----------------------+  |
|  | [••••••••••••]       |  |  <-- value preserved (or cleared — implementation choice)
|  +----------------------+  |
|  ! Incorrect password.      |
|    Please try again.        |
|                            |
|  [      Unlock Inbox    ]  |
|                            |
+----------------------------+
```

## Elements

| Element | Type | Description |
|---------|------|-------------|
| Page heading | Text (h1) | "Admin Inbox" — identifies the protected area. |
| Password label | Label | Visible label "Password" associated with the password input (NFR2). |
| Password input | Input (type=password) | Masked text field. The entered value is compared against the ADMIN_PASSWORD frontend environment variable (R17, BR8). |
| Unlock Inbox button | Button (primary) | Triggers the password comparison on click (or on Enter key). If it matches, renders the Admin Inbox — Message List (Screen 6). If not, shows the error message and keeps the gate visible. |
| Error message | Text (error) | "Incorrect password. Please try again." Shown only after a failed attempt (Workflow 5, step 6). Hidden in the default sub-state. |

## User Actions

- **Type password:** User types into the masked input field.
- **Click "Unlock Inbox" (or press Enter):** Frontend compares input value against ADMIN_PASSWORD env variable (BR8).
  - **Match:** Renders the Admin Inbox — Message List (Screen 6). The password gate is replaced.
  - **No match:** Error message appears below the password input. Gate remains visible. No API call is made.
- **Re-attempt:** User updates the password field and tries again.

## Navigation

- **From:** Admin navigates directly to the admin inbox URL (e.g., `/admin` or `/admin/inbox`).
- **To:** Admin Inbox — Message List (Screen 6) on successful password match.

## Notes

- There is no backend authentication endpoint. The password check is entirely frontend-side using the ADMIN_PASSWORD environment variable (BR8).
- No "Forgot password" or account recovery is provided (out of scope).
- No session persistence is required in the initial scope — refreshing the page will return the user to the password gate.
- The gate is centered on the page, distinct from the contact form layout.
- Keyboard navigation: the password input should be focused on page load; Enter in the input should trigger submission (NFR2).
