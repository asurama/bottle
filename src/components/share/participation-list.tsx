"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { updateParticipationStatus } from "@/app/actions-share/share"
import { Check, CreditCard, Clock } from "lucide-react"
import { useRouter } from "next/navigation"

interface Participation {
    id: string
    userId: string
    slots: number
    status: string
    user?: { name?: string | null; email?: string | null }
}

interface ParticipationListProps {
    participations: Participation[]
    currentUserId?: string
    hostId: string
    shareId: string
}

export function ParticipationList({ participations, currentUserId, hostId }: ParticipationListProps) {
    const router = useRouter()
    const [isPending, setIsPending] = useState<string | null>(null)

    const isHost = currentUserId === hostId

    const handleStatusUpdate = async (participationId: string, newStatus: string) => {
        setIsPending(participationId)
        try {
            const result = await updateParticipationStatus(participationId, newStatus)
            if (!result.error) {
                router.refresh()
            }
        } catch (err) {
            console.error(err)
        } finally {
            setIsPending(null)
        }
    }

    if (participations.length === 0) {
        return <p className="text-sm text-muted-foreground italic">아직 참여자가 없습니다.</p>
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-border/50 overflow-hidden bg-card/20">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/50 bg-muted/30">
                            <th className="px-4 py-3 text-left font-bold uppercase tracking-widest text-[10px] text-muted-foreground">User</th>
                            <th className="px-4 py-3 text-center font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Slots</th>
                            <th className="px-4 py-3 text-center font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Status</th>
                            <th className="px-4 py-3 text-right font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {participations.map((p) => {
                            const isMe = p.userId === currentUserId
                            const canPay = isMe && p.status === "PENDING"
                            const canConfirm = isHost && p.status === "PAID"

                            return (
                                <tr key={p.id} className={isMe ? "bg-primary/5" : ""}>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{p.user?.name || p.user?.email || "Unknown"}</span>
                                            {isMe && <Badge className="text-[9px] h-4">Me</Badge>}
                                            {p.userId === hostId && <Badge variant="outline" className="text-[9px] h-4 border-primary text-primary">Host</Badge>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center font-medium">{p.slots}</td>
                                    <td className="px-4 py-4 text-center">
                                        <Badge
                                            variant={p.status === "CONFIRMED" ? "default" : "secondary"}
                                            className="gap-1 font-bold"
                                        >
                                            {p.status === "PENDING" && <Clock className="w-3 h-3" />}
                                            {p.status === "PAID" && <CreditCard className="w-3 h-3" />}
                                            {p.status === "CONFIRMED" && <Check className="w-3 h-3" />}
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        {canPay && (
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="h-8 text-xs font-bold"
                                                onClick={() => handleStatusUpdate(p.id, "PAID")}
                                                disabled={!!isPending}
                                            >
                                                {isPending === p.id ? "..." : "송금 완료"}
                                            </Button>
                                        )}
                                        {canConfirm && (
                                            <Button
                                                size="sm"
                                                className="h-8 text-xs font-bold bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => handleStatusUpdate(p.id, "CONFIRMED")}
                                                disabled={!!isPending}
                                            >
                                                {isPending === p.id ? "..." : "입금 확인"}
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
