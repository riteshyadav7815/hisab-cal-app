import { NextResponse } from "next/server";
import { db } from "@/server/db";
import bcrypt from "bcrypt";
import { z, ZodError } from "zod";

const schema = z.object({
  name: z.string().min(1),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6),
});

// Handle preflight OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: Request) {
  try {
    console.log('Signup API called');
    const body = await request.json();
    console.log('Request body:', { ...body, password: '[REDACTED]' });
    
    // Validate the request body
    const parsedData = schema.safeParse(body);
    if (!parsedData.success) {
      console.error('Validation error:', parsedData.error.errors);
      const errorMessage = parsedData.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ error: `Validation failed: ${errorMessage}` }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }
    
    const { name, username, email, password } = parsedData.data;

    const existing = await db.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) {
      console.log('User already exists:', existing.email || existing.username);
      return NextResponse.json({ error: "User already exists" }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    // Use Prisma client to create user
    const user = await db.user.create({
      data: {
        name,
        username,
        email,
        password: hashed,
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        userNumber: true,
      },
    });

    console.log('User created successfully:', user);
    return NextResponse.json({ user }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: `Signup failed: ${errorMessage}` }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
}