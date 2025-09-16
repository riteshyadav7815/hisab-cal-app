import { NextResponse } from "next/server";
import { prisma } from "@/lib/db-optimized";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    // Fetch user with userNumber using raw query since Prisma client types might not be updated
    const users: any[] = await prisma.$queryRaw`
      SELECT id, name, email, username, image, "userNumber", "createdAt"
      FROM users 
      WHERE id = ${userId}
    `;
    
    const user = users[0];
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}