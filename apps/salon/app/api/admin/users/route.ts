import { NextResponse } from "next/server";
import { adminAuth } from '@zyra/conf/lib/firebase-admin'

export async function GET() {
  const result = await adminAuth().listUsers(1000);

  const users = result.users.map((user) => ({
    uid: user.uid,
    email: user.email,
  }));

  return NextResponse.json(users);
}