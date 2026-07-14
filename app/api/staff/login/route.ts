import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, email, vehicleReg, passcode, password } = body || {};

    if (!role || !email) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const db = await getDb();
    const staffCol = db.collection("staff");

    // Find staff by role and email
    const user = await staffCol.findOne({ role, email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Simple check (assumes stored fields: password or passcode, vehicleReg)
    if (role === "ambulance") {
      if (
        (passcode && user.passcode && passcode === user.passcode) ||
        (vehicleReg && user.vehicleReg && vehicleReg === user.vehicleReg)
      ) {
        return NextResponse.json(
          { message: "Ambulance authenticated" },
          { status: 200 },
        );
      }
      return NextResponse.json(
        { message: "Invalid ambulance credentials" },
        { status: 401 },
      );
    }

    // doctor / command
    if (user.password && password && user.password === password) {
      return NextResponse.json(
        { message: "Staff authenticated" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 },
    );
  } catch (err) {
    // Log error server-side and return a generic message
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
