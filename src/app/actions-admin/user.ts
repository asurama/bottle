"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function approveUser(userId: string) {
    const session = await auth()

    // Security: Check if caller is ADMIN
    if ((session?.user as any)?.role !== "ADMIN") {
        return { error: "Unauthorized. Admin privileges required." }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { status: "ACTIVE" }
        })

        revalidatePath("/admin/users")
        return { success: true }
    } catch (err) {
        console.error("Failed to approve user:", err)
        return { error: "Database error: Failed to approve user." }
    }
}

export async function rejectUser(userId: string) {
    const session = await auth()

    if ((session?.user as any)?.role !== "ADMIN") {
        return { error: "Unauthorized." }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { status: "SUSPENDED" }
        })

        revalidatePath("/admin/users")
        return { success: true }
    } catch (err) {
        return { error: "Database error." }
    }
}
