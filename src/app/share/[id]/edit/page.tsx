import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import CreateShareForm from "@/components/share/create-share-form"

export default async function EditSharePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/auth/signin")
    }

    const share = await prisma.bottleShare.findUnique({ where: { id } })

    if (!share) notFound()

    const isOwner = session.user.id === share.creatorId
    const isAdmin = session.user.role === "ADMIN"

    if (!isOwner && !isAdmin) {
        redirect(`/share/${id}`)
    }

    return (
        <main className="min-h-screen bg-background py-8 px-4">
            <CreateShareForm initialData={{...share, category: share.category ?? "OTHER"}} mode="edit" />
        </main>
    )
}
