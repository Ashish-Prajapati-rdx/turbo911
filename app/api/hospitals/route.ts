import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { HOSPITALS } from "@/lib/turbo911-data";

export async function GET() {
  try {
    const db = await getDb();
    const col = db.collection("hospitals");

    const count = await col.countDocuments();
    if (count === 0) {
      // Seed with bundled hospitals
      await col.insertMany(HOSPITALS.map((h) => ({ ...h })));
    } else {
      // Migrate: update existing docs with new fields
      for (const hospital of HOSPITALS) {
        await col.updateOne(
          { id: hospital.id },
          {
            $set: {
              imageUrl: hospital.imageUrl,
              lat: hospital.lat,
              lng: hospital.lng,
              mapEmbedUrl: hospital.mapEmbedUrl,
            },
          },
        );
      }
    }

    const docs = await col.find({}).toArray();
    return NextResponse.json(docs, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, updates } = body || {};
    if (!id || !updates) {
      return NextResponse.json(
        { message: "Missing id or updates" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const col = db.collection("hospitals");
    const result = await col.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: "after" },
    );

    if (!result.value) {
      return NextResponse.json(
        { message: "Hospital not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result.value, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
