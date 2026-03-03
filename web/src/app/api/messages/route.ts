import { NextResponse } from 'next/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import type {
  ContactMessage,
  ContactMessageListResponse,
  SubjectEnum,
} from '@/types/contact';

const DATA_FILE = path.join(
  process.cwd(),
  '..',
  'generated-docs',
  'data',
  'messages.json',
);

function readData(): ContactMessageListResponse {
  if (!existsSync(DATA_FILE)) {
    return { messages: [], total: 0 };
  }
  try {
    return JSON.parse(
      readFileSync(DATA_FILE, 'utf-8'),
    ) as ContactMessageListResponse;
  } catch {
    return { messages: [], total: 0 };
  }
}

function writeData(data: ContactMessageListResponse): void {
  mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json(readData());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      recaptchaToken?: string;
    };

    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const newMessage: ContactMessage = {
      id: crypto.randomUUID(),
      name,
      email,
      subject: subject as SubjectEnum,
      message,
      timestamp: new Date().toISOString(),
    };

    const data = readData();
    data.messages = [newMessage, ...data.messages];
    data.total = data.messages.length;
    writeData(data);

    return NextResponse.json(newMessage, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 },
    );
  }
}
