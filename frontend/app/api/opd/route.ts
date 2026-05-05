import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'opd_bookings.json');

export async function GET() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            return NextResponse.json([]);
        }
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json({ error: "Failed to read database" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const booking = await request.json();
        
        let bookings = [];
        if (fs.existsSync(DB_PATH)) {
            const data = fs.readFileSync(DB_PATH, 'utf8');
            bookings = JSON.parse(data);
        }

        // Add a unique booking ID and timestamp
        const newBooking = {
            ...booking,
            id: `OPD-${Math.floor(10000 + Math.random() * 90000)}`,
            timestamp: new Date().toISOString(),
            status: 'confirmed'
        };

        bookings.push(newBooking);
        fs.writeFileSync(DB_PATH, JSON.stringify(bookings, null, 2));

        return NextResponse.json({ success: true, booking: newBooking });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { id, status } = await request.json();
        if (!fs.existsSync(DB_PATH)) return NextResponse.json({ error: "No bookings found" }, { status: 404 });

        const data = fs.readFileSync(DB_PATH, 'utf8');
        let bookings = JSON.parse(data);
        
        const index = bookings.findIndex((b: any) => b.id === id);
        if (index === -1) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

        bookings[index].status = status;
        fs.writeFileSync(DB_PATH, JSON.stringify(bookings, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}

