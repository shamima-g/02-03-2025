'use client';

import { useState } from 'react';
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
import type { SubjectEnum } from '@/types/contact';

const SUBJECT_OPTIONS: SubjectEnum[] = [
  'General Inquiry',
  'Work Inquiry',
  'Feedback',
  'Other',
];

const MESSAGE_MAX = 1000;

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState<SubjectEnum | ''>('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');

  return (
    <div className="w-full max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contact Me</h1>

      <form aria-label="Contact form" className="space-y-5">
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
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Subject */}
        <div className="space-y-1">
          <Label htmlFor="subject">Subject</Label>
          <Select
            value={subject}
            onValueChange={(val) => setSubject(val as SubjectEnum)}
          >
            <SelectTrigger id="subject">
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
        </div>

        {/* Message */}
        <div className="space-y-1">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MESSAGE_MAX}
            rows={5}
          />
          <p className="text-sm text-muted-foreground text-right">
            {message.length} / {MESSAGE_MAX}
          </p>
        </div>

        {/* Submit */}
        <Button type="submit">Send Message</Button>
      </form>
    </div>
  );
}
