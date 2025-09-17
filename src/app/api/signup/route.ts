import { NextResponse } from "next/server";
import { db } from "@/server/db";
import bcrypt from "bcrypt";
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
    // Use raw query to create user and get the userNumber
    const users: any[] = await db.$queryRaw`
      INSERT INTO users (id, name, username, email, password, "createdAt", "updatedAt")
      VALUES (${crypto.randomUUID()}, ${name}, ${username}, ${email}, ${hashed}, NOW(), NOW())
      RETURNING id, email, name, username, "userNumber";
    `;
    
    const user = users[0];

    console.log('User created successfully:', user);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}