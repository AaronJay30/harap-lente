import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "session-data");

export async function POST(req: NextRequest) {
    const { sessionId, data } = await req.json();
    if (!sessionId || !data) {
        return NextResponse.json(
            { error: "Missing sessionId or data" },
            { status: 400 }
        );
    }
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        const filePath = path.join(DATA_DIR, `${sessionId}.json`);
        let merged = { ...data };
        try {
            const existing = await fs.readFile(filePath, "utf8");
            const existingData = JSON.parse(existing);
            merged = { ...existingData, ...data };
        } catch (readErr) {
            // If file doesn't exist, just use new data
        }
        await fs.writeFile(filePath, JSON.stringify(merged, null, 2), "utf8");
        return NextResponse.json({ success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    if (!sessionId) {
        return NextResponse.json(
            { error: "Missing sessionId" },
            { status: 400 }
        );
    }
    try {
        const filePath = path.join(DATA_DIR, `${sessionId}.json`);
        const file = await fs.readFile(filePath, "utf8");
        return NextResponse.json({ data: JSON.parse(file) });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: message }, { status: 404 });
    }
}

export async function DELETE(req: NextRequest) {
    const { sessionId } = await req.json();
    if (!sessionId) {
        return NextResponse.json(
            { error: "Missing sessionId" },
            { status: 400 }
        );
    }
    try {
        const filePath = path.join(DATA_DIR, `${sessionId}.json`);
        await fs.unlink(filePath);
        return NextResponse.json({ success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const { sessionId } = await req.json();
    if (!sessionId) {
        return NextResponse.json(
            { error: "Missing sessionId" },
            { status: 400 }
        );
    }
    try {
        const filePath = path.join(DATA_DIR, `${sessionId}.json`);
        let keep: any = {};
        try {
            const file = await fs.readFile(filePath, "utf8");
            const data = JSON.parse(file);
            if (data.createdAt) keep.createdAt = data.createdAt;
            if (data.expiresAt) keep.expiresAt = data.expiresAt;
        } catch {}
        await fs.writeFile(filePath, JSON.stringify(keep, null, 2), "utf8");
        return NextResponse.json({ success: true });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
