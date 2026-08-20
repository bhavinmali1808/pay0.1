import { NextResponse } from 'next/server';

// Simple in-memory rate limiter
const rateLimitMap = new Map();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // 3 requests per minute

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    const body = await req.json();
    const { email, phone } = body;

    // Rate limiting logic
    const currentTime = Date.now();
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, { count: 1, startTime: currentTime });
    } else {
      const rateLimitData = rateLimitMap.get(ip);
      
      if (currentTime - rateLimitData.startTime < RATE_LIMIT_WINDOW_MS) {
        if (rateLimitData.count >= MAX_REQUESTS_PER_WINDOW) {
          // Too many requests
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429, headers: { 'Retry-After': String(RATE_LIMIT_WINDOW_MS / 1000) } }
          );
        }
        // Increment count
        rateLimitData.count += 1;
        rateLimitMap.set(ip, rateLimitData);
      } else {
        // Reset window
        rateLimitMap.set(ip, { count: 1, startTime: currentTime });
      }
    }

    // TODO: Actually send the OTP to the provided email or phone
    // For now, simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Sending OTP to: Email=${email}, Phone=${phone}`);

    return NextResponse.json(
      { message: 'OTP sent successfully' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('OTP API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
