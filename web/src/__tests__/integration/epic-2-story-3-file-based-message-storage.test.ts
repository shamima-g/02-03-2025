/**
 * Story Metadata:
 * - Route: N/A (API routes only)
 * - Target File: app/api/messages/route.ts
 * - Page Action: create_new
 *
 * Integration tests for Epic 2, Story 3: File-based Message Storage.
 *
 * Tests the Next.js App Router API route handlers (GET and POST) for
 * /api/messages. The route reads from and writes to a local JSON file at
 * generated-docs/data/messages.json. The fs module is mocked so no real
 * files are read or written during tests.
 */

import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import type { ContactMessage } from '@/types/contact';

// Mock the 'fs' module. We must include a `default` export explicitly because
// the Node.js fs module is a CJS module re-exported as ESM, and Vitest checks
// for a `default` key when the consumer uses named imports from 'fs'.
vi.mock('fs', () => {
  const existsSync = vi.fn();
  const readFileSync = vi.fn();
  const writeFileSync = vi.fn();
  const mkdirSync = vi.fn();
  const mod = { existsSync, readFileSync, writeFileSync, mkdirSync };
  return { ...mod, default: mod };
});

// Import the mocked functions so we can configure return values per test.
// These are the same vi.fn() instances created in the factory above.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

const mockExistsSync = existsSync as ReturnType<typeof vi.fn>;
const mockReadFileSync = readFileSync as ReturnType<typeof vi.fn>;
const mockWriteFileSync = writeFileSync as ReturnType<typeof vi.fn>;
const mockMkdirSync = mkdirSync as ReturnType<typeof vi.fn>;

// Import the route handlers AFTER the mock is set up.
import { GET, POST } from '@/app/api/messages/route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildPostRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const existingMessage: ContactMessage = {
  id: 'existing-uuid',
  name: 'Bob',
  email: 'bob@example.com',
  subject: 'General Inquiry',
  message: 'Old message',
  timestamp: '2025-01-10T08:00:00.000Z',
};

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// GET /api/messages
// ---------------------------------------------------------------------------

describe('GET /api/messages', () => {
  it('returns { messages: [], total: 0 } with status 200 when the file does not exist', async () => {
    mockExistsSync.mockReturnValue(false);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ messages: [], total: 0 });
  });

  it('returns the parsed messages and total from the file when it exists', async () => {
    const storedData = { messages: [existingMessage], total: 1 };

    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(JSON.stringify(storedData));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.messages).toHaveLength(1);
    expect(data.messages[0]).toEqual(existingMessage);
    expect(data.total).toBe(1);
  });

  it('returns { messages: [], total: 0 } when the file exists but contains invalid JSON', async () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('not-valid-json');

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ messages: [], total: 0 });
  });
});

// ---------------------------------------------------------------------------
// POST /api/messages — successful submission
// ---------------------------------------------------------------------------

describe('POST /api/messages — successful submission', () => {
  beforeEach(() => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      'test-uuid-1234' as `${string}-${string}-${string}-${string}-${string}`,
    );
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(
      '2025-01-15T10:30:00.000Z',
    );
    mockExistsSync.mockReturnValue(false);
    mockWriteFileSync.mockImplementation(() => undefined);
    mockMkdirSync.mockImplementation(() => undefined);
  });

  it('returns HTTP 201 on a valid submission', async () => {
    const request = buildPostRequest({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'General Inquiry',
      message: 'Hello there',
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
  });

  it('returns the newly created ContactMessage in the response body', async () => {
    const request = buildPostRequest({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'Work Inquiry',
      message: 'Please hire me',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.name).toBe('Alice');
    expect(data.email).toBe('alice@example.com');
    expect(data.subject).toBe('Work Inquiry');
    expect(data.message).toBe('Please hire me');
  });

  it('includes a generated id (UUID) in the response body', async () => {
    const request = buildPostRequest({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'General Inquiry',
      message: 'Hello',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.id).toBe('test-uuid-1234');
  });

  it('includes an ISO 8601 timestamp in the response body', async () => {
    const request = buildPostRequest({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'General Inquiry',
      message: 'Hello',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.timestamp).toBe('2025-01-15T10:30:00.000Z');
  });

  it('calls writeFileSync to persist the new message', async () => {
    const request = buildPostRequest({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'Feedback',
      message: 'Great site!',
    });

    await POST(request);

    expect(mockWriteFileSync).toHaveBeenCalledOnce();
  });

  it('prepends the new message so the newest message is first', async () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(
      JSON.stringify({ messages: [existingMessage], total: 1 }),
    );

    const request = buildPostRequest({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'General Inquiry',
      message: 'New message',
    });

    await POST(request);

    const writtenJson = mockWriteFileSync.mock.calls[0][1] as string;
    const writtenData = JSON.parse(writtenJson) as {
      messages: ContactMessage[];
      total: number;
    };

    expect(writtenData.messages).toHaveLength(2);
    expect(writtenData.messages[0].id).toBe('test-uuid-1234'); // new message first
    expect(writtenData.messages[1].id).toBe('existing-uuid'); // old message second
    expect(writtenData.total).toBe(2);
  });

  it('creates a new file containing only the new message when no file exists', async () => {
    mockExistsSync.mockReturnValue(false);

    const request = buildPostRequest({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'Other',
      message: 'First ever message',
    });

    await POST(request);

    expect(mockWriteFileSync).toHaveBeenCalledOnce();
    const writtenJson = mockWriteFileSync.mock.calls[0][1] as string;
    const writtenData = JSON.parse(writtenJson) as {
      messages: ContactMessage[];
      total: number;
    };

    expect(writtenData.messages).toHaveLength(1);
    expect(writtenData.messages[0].name).toBe('Alice');
    expect(writtenData.total).toBe(1);
  });

  it('succeeds without a recaptchaToken field in the body', async () => {
    const request = buildPostRequest({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'General Inquiry',
      message: 'No token provided',
      // recaptchaToken intentionally omitted
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
  });

  it('calls mkdirSync to ensure the data directory exists before writing', async () => {
    const request = buildPostRequest({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'General Inquiry',
      message: 'Hello',
    });

    await POST(request);

    expect(mockMkdirSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ recursive: true }),
    );
  });
});

// ---------------------------------------------------------------------------
// POST /api/messages — validation (missing required fields)
// ---------------------------------------------------------------------------

describe('POST /api/messages — missing required fields', () => {
  it('returns 400 with an error field when name is missing', async () => {
    const request = buildPostRequest({
      email: 'alice@example.com',
      subject: 'General Inquiry',
      message: 'Hello',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it('returns 400 with an error field when email is missing', async () => {
    const request = buildPostRequest({
      name: 'Alice',
      subject: 'General Inquiry',
      message: 'Hello',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it('returns 400 with an error field when subject is missing', async () => {
    const request = buildPostRequest({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'Hello',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });

  it('returns 400 with an error field when message is missing', async () => {
    const request = buildPostRequest({
      name: 'Alice',
      email: 'alice@example.com',
      subject: 'General Inquiry',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeTruthy();
  });
});
