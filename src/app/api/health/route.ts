import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Stringy-Thingy API is running',
    timestamp: new Date().toISOString(),
  });
}
