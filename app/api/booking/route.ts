import { NextResponse } from "next/server";
import { ObjectId, type Document } from "mongodb";
import { getDb } from "@/lib/mongo";

const ACTIVE_STATUSES = ["requested", "accepted", "patient_received"];

function serializeBooking(doc: Document | null) {
  if (!doc) return null;
  return {
    ...doc,
    _id: undefined,
    bookingId: doc._id.toString(),
    createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt,
    acceptedAt: doc.acceptedAt?.toISOString?.() ?? doc.acceptedAt,
    patientReceivedAt:
      doc.patientReceivedAt?.toISOString?.() ?? doc.patientReceivedAt,
    completedAt: doc.completedAt?.toISOString?.() ?? doc.completedAt,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    const db = await getDb();
    const col = db.collection("bookings");

    if (bookingId) {
      if (!ObjectId.isValid(bookingId)) {
        return NextResponse.json(
          { message: "Invalid bookingId" },
          { status: 400 },
        );
      }

      const doc = await col.findOne({ _id: new ObjectId(bookingId) });
      if (!doc) {
        return NextResponse.json(
          { message: "Booking not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(serializeBooking(doc), { status: 200 });
    }

    const docs = await col
      .find({ status: { $in: ACTIVE_STATUSES } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(docs.map(serializeBooking), { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ambulanceId, hospitalId, patientName = "Patient" } = body || {};

    if (!ambulanceId || !hospitalId) {
      return NextResponse.json(
        { message: "Missing ambulanceId or hospitalId" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const ambulance = await db.collection("ambulances").findOneAndUpdate(
      { id: ambulanceId, status: "AVAILABLE" },
      { $set: { status: "BUSY" } },
      { returnDocument: "after" },
    );

    if (!ambulance.value) {
      return NextResponse.json(
        { message: "Ambulance is not available right now" },
        { status: 409 },
      );
    }

    const result = await db.collection("bookings").insertOne({
      ambulanceId,
      hospitalId,
      patientName,
      status: "requested",
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Request sent to ambulance",
        bookingId: result.insertedId.toString(),
        ambulance: ambulance.value,
        status: "requested",
      },
      { status: 200 },
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, action, hospitalId } = body || {};

    if (!bookingId || !action || !ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { message: "Missing or invalid bookingId/action" },
        { status: 400 },
      );
    }

    const transitions: Record<
      string,
      { from: string; to: string; timestamp: string }
    > = {
      accept: {
        from: "requested",
        to: "accepted",
        timestamp: "acceptedAt",
      },
      receive_patient: {
        from: "accepted",
        to: "patient_received",
        timestamp: "patientReceivedAt",
      },
      complete_handshake: {
        from: "patient_received",
        to: "completed",
        timestamp: "completedAt",
      },
    };

    const transition = transitions[action];
    if (!transition) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const db = await getDb();
    const col = db.collection("bookings");
    const objectId = new ObjectId(bookingId);
    const updates: Record<string, unknown> = {
      status: transition.to,
      [transition.timestamp]: new Date(),
    };

    if (action === "complete_handshake" && hospitalId) {
      updates.receivingHospitalId = hospitalId;
    }

    const booking = await col.findOneAndUpdate(
      { _id: objectId, status: transition.from },
      { $set: updates },
      { returnDocument: "after" },
    );

    if (!booking.value) {
      return NextResponse.json(
        { message: "Booking is not ready for this action" },
        { status: 409 },
      );
    }

    if (action === "complete_handshake") {
      await db
        .collection("ambulances")
        .findOneAndUpdate(
          { id: booking.value.ambulanceId },
          { $set: { status: "AVAILABLE" } },
        );
    }

    return NextResponse.json(serializeBooking(booking.value), { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
