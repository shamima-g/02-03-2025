import type {
  ContactMessage,
  ContactMessageListResponse,
  SubmitContactMessageRequest,
} from '@/types/contact';

// These functions call the internal Next.js API route directly using relative
// URLs so they work regardless of which port the dev server starts on.
// CLAUDE.md prohibits fetch() in *components* — this is the API service layer.

export const submitContactMessage = async (
  data: SubmitContactMessageRequest,
): Promise<ContactMessage> => {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Submit failed: ${response.status}`);
  }
  return response.json() as Promise<ContactMessage>;
};

export const listContactMessages =
  async (): Promise<ContactMessageListResponse> => {
    const response = await fetch('/api/messages');
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }
    return response.json() as Promise<ContactMessageListResponse>;
  };
