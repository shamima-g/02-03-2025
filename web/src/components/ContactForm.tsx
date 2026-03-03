'use client';

import { useState, useRef, useEffect } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { submitContactMessage } from '@/lib/api/contact';
import type { SubjectEnum } from '@/types/contact';

const SUBJECT_OPTIONS: SubjectEnum[] = [
  'General Inquiry',
  'Work Inquiry',
  'Feedback',
  'Other',
];

const MESSAGE_MAX = 1000;

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function validateForm(
  name: string,
  email: string,
  subject: SubjectEnum | '',
  message: string,
): FormErrors {
  const errors: FormErrors = {};

  if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!email.includes('@')) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!subject) {
    errors.subject = 'Please select a subject.';
  }

  if (message.length < 10) {
    errors.message = 'Message must be at least 10 characters.';
  }

  return errors;
}

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState<SubjectEnum | ''>('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const alertRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    if (submitted) {
      successRef.current?.focus();
    }
  }, [submitted]);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setName(newValue);
    if (errors.name && newValue.length >= 2) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.name;
        return next;
      });
    }
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setEmail(newValue);
    if (errors.email && newValue.includes('@')) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
  }

  function handleSubjectChange(val: string) {
    setSubject(val as SubjectEnum);
    if (errors.subject && val) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.subject;
        return next;
      });
    }
  }

  function handleMessageChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value;
    setMessage(newValue);
    if (errors.message && newValue.length >= 10) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.message;
        return next;
      });
    }
  }

  function handleSendAnother() {
    setSubmitted(false);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setErrors({});
    setApiError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Clear previous API error on new submission attempt
    setApiError(null);

    // Run validation — all fields simultaneously in one state update
    const validationErrors = validateForm(name, email, subject, message);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear any previous field errors
    setErrors({});
    setIsSubmitting(true);

    // Honeypot check — simulate success without calling the API
    if (honeypot) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubmitting(false);
      setSubmitted(true);
      return;
    }

    try {
      const recaptchaToken = executeRecaptcha
        ? await executeRecaptcha('contact_form')
        : '';

      await submitContactMessage({
        name,
        email,
        subject: subject as SubjectEnum,
        message,
        recaptchaToken,
      });

      // Success — show confirmation region
      setSubmitted(true);
    } catch {
      setApiError(
        'Something went wrong. Please try again or contact us directly.',
      );
      // Focus the error banner after state update renders
      setTimeout(() => {
        alertRef.current?.focus();
      }, 0);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isAtLimit = message.length >= MESSAGE_MAX;
  const isButtonDisabled = isSubmitting || isAtLimit;

  // Success confirmation region
  if (submitted) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-6">Contact Me</h1>
        <div
          ref={successRef}
          tabIndex={-1}
          className="flex flex-col items-center gap-4 py-8 text-center outline-none"
        >
          <CheckCircle2
            className="h-16 w-16 text-green-500"
            aria-hidden="true"
          />
          <h2 className="text-2xl font-semibold">Message Sent!</h2>
          <p className="text-muted-foreground">
            Thanks for reaching out. I&apos;ll get back to you soon.
          </p>
          <Button variant="outline" onClick={handleSendAnother}>
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contact Me</h1>

      {/* API Error Banner */}
      {apiError && (
        <div
          role="alert"
          tabIndex={-1}
          ref={alertRef}
          className="mb-5 p-4 rounded-md bg-destructive/10 border border-destructive text-destructive"
        >
          {apiError}
        </div>
      )}

      {/*
        noValidate disables native HTML5 browser validation so our custom
        React validation handles all field errors consistently.
      */}
      <form
        aria-label="Contact form"
        className="space-y-5"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Honeypot — visually hidden, not in tab order, no accessible label */}
        <input
          data-testid="honeypot"
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        />

        {/* Name */}
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p
              id="name-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p
              id="email-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.email}
            </p>
          )}
        </div>

        {/* Subject */}
        <div className="space-y-1">
          <Label htmlFor="subject">Subject</Label>
          <Select value={subject} onValueChange={handleSubjectChange}>
            <SelectTrigger
              id="subject"
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? 'subject-error' : undefined}
            >
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subject && (
            <p
              id="subject-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.subject}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-1">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={handleMessageChange}
            rows={5}
            aria-invalid={!!errors.message}
            aria-describedby={
              errors.message
                ? 'message-error message-counter'
                : 'message-counter'
            }
          />
          {errors.message && (
            <p
              id="message-error"
              className="text-sm text-destructive"
              role="alert"
            >
              {errors.message}
            </p>
          )}
          <p
            id="message-counter"
            className={`text-sm text-right ${
              isAtLimit ? 'text-destructive' : 'text-muted-foreground'
            }`}
          >
            {message.length} / {MESSAGE_MAX}
          </p>
        </div>

        {/* Submit */}
        <Button type="submit" disabled={isButtonDisabled}>
          {isSubmitting && (
            <span
              aria-hidden="true"
              className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent inline-block"
            />
          )}
          Send Message
        </Button>
      </form>
    </div>
  );
}
