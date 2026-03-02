# Epic 1: Contact Form

## Description

Deliver the home page with an embedded, fully functional contact form. Visitors can fill in Name, Email, Subject, and Message fields, submit their message, and receive inline success or error feedback. Spam protection is provided via a hidden honeypot field and Google reCAPTCHA v3 (invisible). The home page template placeholder is replaced with the Contact Me page as the first story in this epic. Foundation types and the API client function are also established in this epic, shared by Epic 2 (Admin Inbox).

## Stories

1. **Contact Form — Home Page Setup and Form Rendering** - Replace the home page template placeholder with the Contact Me page; render the full form with all four fields, character counter, honeypot, reCAPTCHA v3 widget, and Send Message button; create TypeScript types and the API client function | File: `story-1-home-page-setup-and-form-rendering.md` | Status: Pending
2. **Contact Form — Validation, Character Counter, and Error States** - Implement all client-side validation, real-time character counting with limit enforcement, and the API error banner | File: `story-2-validation-character-counter-and-error-states.md` | Status: Pending
3. **Contact Form — Submission Flow (Loading, Success, Spam Protection)** - Implement the complete submission pipeline: loading state, success confirmation with reset, honeypot silent rejection, and reCAPTCHA v3 token handling | File: `story-3-submission-flow-loading-success-spam-protection.md` | Status: Pending
