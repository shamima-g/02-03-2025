import { get, post } from '@/lib/api/client';
import type {
  ContactMessage,
  ContactMessageListResponse,
  SubmitContactMessageRequest,
} from '@/types/contact';

export const submitContactMessage = (
  data: SubmitContactMessageRequest,
): Promise<ContactMessage> => post<ContactMessage>('/contact-messages', data);

export const listContactMessages = (): Promise<ContactMessageListResponse> =>
  get<ContactMessageListResponse>('/contact-messages');
