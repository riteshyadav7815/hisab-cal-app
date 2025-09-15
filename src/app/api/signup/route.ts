import { NextResponse } from "next/server";
import { db } from "@/server/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    console.log('Signup API called');
    const body = await request.json();
    console.log('Request body:', { ...body, password: '[REDACTED]' });
    
    const { name, username, email, password } = schema.parse(body);

    const existing = await db.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) {
      console.log('User already exists:', existing.email || existing.username);
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { name, username, email, password: hashed },
      select: { id: true, email: true, name: true, username: true },
    });

    console.log('User created successfully:', user);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
