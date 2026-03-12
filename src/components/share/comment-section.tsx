"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createComment } from "@/app/actions-share/share"
import { useRouter } from "next/navigation"

interface Comment {
    id: string
    content: string
    createdAt: Date
    userId: string
    user?: { name?: string | null; email?: string | null; nickname?: string | null }
}

interface CommentSectionProps {
    shareId: string
    comments: Comment[]
    currentUserId?: string
    hostId?: string
}

export function CommentSection({ shareId, comments, currentUserId, hostId }: CommentSectionProps) {
    const [content, setContent] = useState("")
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async () => {
        if (!content.trim()) return

        setIsPending(true)
        setError(null)

        try {
            const result = await createComment(shareId, content)
            if (result.error) {
                setError(result.error)
            } else {
                setContent("")
                router.refresh()
            }
        } catch {
            setError("댓글 작성 중 오류가 발생했습니다.")
        } finally {
            setIsPending(false)
        }
    }

    const formatRelativeTime = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)

        if (days > 0) return `${days}일 전`
        if (hours > 0) return `${hours}시간 전`
        if (minutes > 0) return `${minutes}분 전`
        return "방금 전"
    }

    return (
        <section className="pt-12 border-t border-border/50 space-y-8">
            <h2 className="text-2xl font-black tracking-tight">
                COMMENTS <span className="text-primary text-sm ml-2">{comments.length}</span>
            </h2>

            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex flex-col gap-1 border-l-2 border-muted pl-4 py-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm">{comment.user?.nickname || comment.user?.name || comment.user?.email || "Anonymous"}</span>
                                    {comment.userId === currentUserId && (
                                        <Badge variant="secondary" className="text-[9px] h-4 px-1 font-black bg-primary/10 text-primary border-primary/20">ME</Badge>
                                    )}
                                    {comment.userId === hostId && (
                                        <Badge variant="outline" className="text-[9px] h-4 px-1 font-black border-primary/50 text-primary">HOST</Badge>
                                    )}
                                    <span className="text-[10px] text-foreground/70 font-medium uppercase tracking-tight">{formatRelativeTime(comment.createdAt)}</span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {currentUserId ? (
                <Card className="border-primary/20 bg-card/50">
                    <CardContent className="p-4 space-y-3">
                        <Textarea
                            placeholder="위스키에 대한 궁금한 점이나 의견을 남겨주세요..."
                            className="min-h-[100px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm resize-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={isPending}
                        />
                        <div className="flex items-center justify-between border-t border-border/30 pt-3">
                            {error ? (
                                <p className="text-[10px] text-destructive font-bold">{error}</p>
                            ) : (
                                <p className="text-[10px] text-muted-foreground font-medium italic">매너 있는 댓글은 작성자에게 힘이 됩니다.</p>
                            )}
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={isPending || !content.trim()}
                                className="font-bold"
                            >
                                {isPending ? "게시 중..." : "댓글 게시"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="p-6 rounded-xl border border-dashed border-border/50 bg-muted/20 text-center">
                    <p className="text-sm text-muted-foreground mb-4">댓글을 작성하려면 로그인이 필요합니다.</p>
                    <Button variant="outline" size="sm" onClick={() => router.push("/api/auth/signin")}>
                        로그인하기
                    </Button>
                </div>
            )}
        </section>
    )
}
