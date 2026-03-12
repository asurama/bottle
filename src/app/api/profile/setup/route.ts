import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const { nickname, realName, birthDate } = await req.json()

        if (!nickname || !realName || !birthDate) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                nickname,
                realName,
                birthDate: new Date(birthDate),
                // If the user was PENDING, they normally shouldn't even reach here 
                // unless and admin approved them. Let's assume they are already ACTIVE 
                // or this is the final step after approval.
            }
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Profile setup error:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
