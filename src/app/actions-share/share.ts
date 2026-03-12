"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const SharePostSchema = z.object({
    whiskyName: z.string().min(1, "Whisky name is required"),
    whiskyImage: z.string().optional().or(z.literal("")),
    distillery: z.string().optional().or(z.literal("")),
    abv: z.coerce.number().optional(),
    yearsOld: z.coerce.number().int().optional(),
    condition: z.enum(["NEW", "OPENED"]).default("NEW"),
    totalVolume: z.coerce.number().int().min(1),
    volumePerSlot: z.coerce.number().int().min(1),
    pricePerSlot: z.coerce.number().int().min(0),
    category: z.string().default("OTHER"),
    arrivalDate: z.string().optional().or(z.literal("")),
    startDate: z.string().optional().or(z.literal("")),
    endDate: z.string().optional().or(z.literal("")),
    eventLocation: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
})

export async function createSharePost(formData: FormData) {
    const session = await auth()

    if (!session?.user?.id) {
        return { error: "You must be logged in to create a share post." }
    }

    const rawData = Object.fromEntries(formData.entries())
    const validatedFields = SharePostSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors }
    }

    const { totalVolume, volumePerSlot, arrivalDate, startDate, endDate } = validatedFields.data
    const totalSlots = Math.floor(totalVolume / volumePerSlot)

    try {
        await prisma.bottleShare.create({
            data: {
                ...validatedFields.data,
                arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                totalSlots,
                creatorId: session.user.id,
                status: "OPEN",
            },
        })

        revalidatePath("/")
        return { success: true }
    } catch (err) {
        console.error("Failed to create share post:", err)
        return { error: "Database error: Failed to create share post." }
    }
}

export async function updateSharePost(id: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "로그인이 필요합니다." }

    const rawData = Object.fromEntries(formData.entries())
    const validatedFields = SharePostSchema.safeParse(rawData)

    if (!validatedFields.success) return { error: validatedFields.error.flatten().fieldErrors }

    try {
        const share = await prisma.bottleShare.findUnique({ where: { id } })
        if (!share) return { error: "글을 찾을 수 없습니다." }
        if (share.creatorId !== session.user.id && session.user.role !== "ADMIN") return { error: "권한이 없습니다." }

        const { totalVolume, volumePerSlot, arrivalDate, startDate, endDate } = validatedFields.data
        const totalSlots = Math.floor(totalVolume / volumePerSlot)

        await prisma.bottleShare.update({
            where: { id },
            data: {
                ...validatedFields.data,
                arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                totalSlots,
            }
        })

        revalidatePath("/")
        revalidatePath(`/share/${id}`)
        return { success: true }
    } catch (err) {
        console.error("Update error:", err)
        return { error: "오류가 발생했습니다." }
    }
}

export async function deleteSharePost(id: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "로그인이 필요합니다." }

    try {
        const share = await prisma.bottleShare.findUnique({ where: { id } })
        if (!share) return { error: "글을 찾을 수 없습니다." }
        if (share.creatorId !== session.user.id && session.user.role !== "ADMIN") return { error: "권한이 없습니다." }

        await prisma.bottleShare.delete({ where: { id } })

        revalidatePath("/")
        return { success: true }
    } catch (err) {
        console.error("Delete error:", err)
        return { error: "삭제 중 오류가 발생했습니다." }
    }
}

export async function joinShare(shareId: string, slots: number = 1) {
    const session = await auth()

    if (!session?.user?.id) {
        return { error: "You must be logged in to join a share." }
    }

    try {
        const share = await prisma.bottleShare.findUnique({
            where: { id: shareId },
            include: { participations: true },
        })

        if (!share) {
            return { error: "Share post not found." }
        }

        const existingParticipation = share.participations.find(
            (p: { userId: string }) => p.userId === session.user!.id
        )
        if (existingParticipation) {
            return { error: "이미 이 쉐어에 참여하고 있습니다." }
        }

        const occupiedSlots = share.participations.reduce((sum: number, p: { slots: number }) => sum + p.slots, 0)
        if (occupiedSlots + slots > share.totalSlots) {
            return { error: "Not enough slots available." }
        }

        await prisma.participation.create({
            data: {
                userId: session.user.id,
                shareId: share.id,
                slots,
                status: "PENDING",
            },
        })

        revalidatePath(`/share/${shareId}`)
        revalidatePath("/")
        return { success: true }
    } catch (err) {
        console.error("Failed to join share:", err)
        return { error: "Database error: Failed to join share." }
    }
}

export async function updateParticipationStatus(participationId: string, newStatus: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Authentication required." }

    try {
        const participation = await prisma.participation.findUnique({
            where: { id: participationId },
            include: { share: true }
        })

        if (!participation) return { error: "Participation not found." }

        // Logic:
        // 1. Participant can change PENDING -> PAID
        // 2. Host can change PAID -> CONFIRMED (or PENDING -> CONFIRMED)

        const isHost = participation.share.creatorId === session.user.id
        const isParticipant = participation.userId === session.user.id

        if (!isHost && !isParticipant) return { error: "Unauthorized." }

        if (newStatus === "PAID" && !isParticipant && !isHost) return { error: "Only participant or host can mark as paid." }
        if (newStatus === "CONFIRMED" && !isHost) return { error: "Only host can confirm payment." }

        await prisma.participation.update({
            where: { id: participationId },
            data: { status: newStatus }
        })

        revalidatePath(`/share/${participation.shareId}`)
        return { success: true }
    } catch (err) {
        console.error("Failed to update status:", err)
        return { error: "Database error." }
    }
}

export async function createComment(shareId: string, content: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Authentication required." }

    if (!content || content.trim().length === 0) {
        return { error: "Comment content cannot be empty." }
    }

    try {
        await prisma.comment.create({
            data: {
                content: content.trim(),
                shareId: shareId,
                userId: session.user.id,
            }
        })

        revalidatePath(`/share/${shareId}`)
        return { success: true }
    } catch (err) {
        console.error("Failed to create comment:", err)
        return { error: "Database error: Failed to post comment." }
    }
}

