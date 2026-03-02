# Feature: Contact Form with Admin Inbox

## Summary

A reusable embedded contact form that allows site visitors to submit messages (name, email, subject, message) with spam protection (honeypot + reCAPTCHA v3), and a password-gated admin inbox page where the site owner can view all submitted messages retrieved from a backend REST API.

## Epics

1. **Epic 1: Contact Form** - Build the home page with the embedded contact form: all four fields, inline validation with per-field error messages, character counter, honeypot and reCAPTCHA v3 spam protection, loading state, and inline success/error post-submission states. | Status: Pending | Dir: `epic-1-contact-form/`
2. **Epic 2: Admin Inbox** - Password-gated admin page that fetches and displays all submitted contact messages with loading, error, and empty states. | Status: Pending | Dir: `epic-2-admin-inbox/`

## Epic Dependencies

- Epic 1: Contact Form (no dependencies — must be first; establishes shared API client, TypeScript types for ContactMessage, and the home page)
- Epic 2: Admin Inbox (depends on Epic 1 — requires the ContactMessage TypeScript types and API client conventions established in Epic 1; must be sequential, cannot be parallelized)
