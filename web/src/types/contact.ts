// TypeScript types generated from generated-docs/specs/api-spec.yaml

export type SubjectEnum =
  | 'General Inquiry'
  | 'Work Inquiry'
  | 'Feedback'
  | 'Other';

export interface SubmitContactMessageRequest {
  name: string;
  email: string;
  subject: SubjectEnum;
  message: string;
  recaptchaToken: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: SubjectEnum;
  message: string;
  timestamp: string;
}

export interface ContactMessageListResponse {
  messages: ContactMessage[];
  total: number;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: string[];
}
