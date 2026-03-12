import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Calendar, MapPin, Beer, GlassWater, Clock, Info, Pencil, CalendarRange } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { JoinButton } from "@/components/share/join-button"
import { ParticipationList } from "@/components/share/participation-list"
import { CommentSection } from "@/components/share/comment-section"
import Link from "next/link"
import { auth } from "@/auth"
import { DeleteShareButton } from "@/components/share/delete-share-button"

export default async function ShareDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()

    const share = await prisma.bottleShare.findUnique({
        where: { id },
        include: {
            participations: {
                include: { user: true }
            },
            comments: {
                include: { user: true },
                orderBy: { createdAt: "asc" }
            },
            creator: true,
        },
    })

    if (!share) {
        notFound()
    }

    const occupiedSlots = share.participations.reduce((sum: number, p: { slots: number }) => sum + p.slots, 0)
    const progress = (occupiedSlots / share.totalSlots) * 100
    const isFinished = share.status !== "OPEN" || occupiedSlots >= share.totalSlots

    const isOwner = session?.user?.id === share.creatorId
    const isAdmin = session?.user?.role === "ADMIN"
    const canManage = isOwner || isAdmin

    const formatDate = (date: Date | null) => {
        if (!date) return null
        return new Date(date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    }

    return (
        <main className="min-h-screen bg-background pb-20">
            <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-12 space-y-12">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors inline-block">
                        ← 목록으로 돌아가기
                    </Link>
                    {canManage && (
                        <div className="flex items-center gap-2">
                            <Link href={`/share/${id}/edit`}>
                                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-bold border-primary/20 hover:bg-primary/5">
                                    <Pencil className="w-3 h-3" /> 수정
                                </Button>
                            </Link>
                            <DeleteShareButton shareId={id} />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Side: Image Section */}
                    <div className="space-y-6">
                        <AspectRatio ratio={3 / 4} className="rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted shadow-[0_0_50px_rgba(234,179,8,0.1)]">
                            <Image
                                src={share.whiskyImage || "https://images.unsplash.com/photo-1599566217208-aa9281d3d197?q=80&w=1974&auto=format&fit=crop"}
                                alt={share.whiskyName}
                                fill
                                className="object-cover brightness-[1.02]"
                            />
                        </AspectRatio>

                        <div className="md:hidden space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-primary tracking-widest uppercase">{share.distillery || "Unknown Distillery"}</p>
                                <h1 className="text-3xl font-black leading-tight tracking-tighter">{share.whiskyName}</h1>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Info Section */}
                    <div className="space-y-8 flex flex-col h-full">
                        <div className="hidden md:block space-y-1">
                            <p className="text-sm font-bold text-primary tracking-widest uppercase">{share.distillery || "Unknown Distillery"}</p>
                            <h1 className="text-4xl font-black leading-tight tracking-tighter">{share.whiskyName}</h1>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-card/40 border border-border/50 space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                                    <Beer className="w-4 h-4" /> ABV
                                </div>
                                <p className="text-xl font-bold">{share.abv || "--"}%</p>
                            </div>
                            <div className="p-4 rounded-xl bg-card/40 border border-border/50 space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                                    <Clock className="w-4 h-4" /> AGE
                                </div>
                                <p className="text-xl font-bold">{share.yearsOld || "--"}y</p>
                            </div>
                            <div className="p-4 rounded-xl bg-card/40 border border-border/50 space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                                    <GlassWater className="w-4 h-4" /> TOTAL
                                </div>
                                <p className="text-xl font-bold">{share.totalVolume}ml</p>
                            </div>
                            <div className="p-4 rounded-xl bg-card/40 border border-border/50 space-y-1">
                                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
                                    <Info className="w-4 h-4" /> STATUS
                                </div>
                                <Badge variant="outline" className="text-lg px-0 py-0 h-auto border-none font-bold">
                                    {share.condition === "NEW" ? "미개봉" : "개봉"}
                                </Badge>
                            </div>
                        </div>

                        <Card className="border-border/30 bg-card/30">
                            <CardContent className="p-4 space-y-3">
                                {/* Progress Period */}
                                {(share.startDate || share.endDate) && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <CalendarRange className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">진행 기간</p>
                                            <span className="font-medium">
                                                {formatDate(share.startDate as Date | null)} ~ {formatDate(share.endDate as Date | null)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {/* Arrival Date */}
                                <div className="flex items-start gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">도착예정일 (정모일)</p>
                                        <span className="font-medium">
                                            {share.arrivalDate ? formatDate(share.arrivalDate) : "날짜 미정"}
                                        </span>
                                    </div>
                                </div>
                                {share.eventLocation && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{share.eventLocation}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                                {share.description || "상세 설명이 없습니다."}
                            </p>
                        </div>

                        {/* Participation Dashboard Section */}
                        <div className="pt-8 border-t border-border/50 space-y-4">
                            <h3 className="text-sm font-black tracking-[0.2em] text-primary uppercase">Participation Dashboard</h3>
                            <ParticipationList
                                participations={share.participations}
                                currentUserId={session?.user?.id}
                                hostId={share.creatorId}
                                shareId={share.id}
                            />
                        </div>

                        <div className="mt-auto pt-8 border-t border-border/50 flex flex-col gap-6">
                            <div className="flex justify-between items-baseline">
                                <div className="space-y-1">
                                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Share Price</span>
                                    <p className="text-3xl font-black text-primary italic">₩{share.pricePerSlot.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Per {share.volumePerSlot}ml</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                    <span className="opacity-75 tracking-tighter">참여 구좌 : {occupiedSlots}/{share.totalSlots}</span>
                                    <span className="text-primary">{Math.round(progress)}% 모집됨</span>
                                </div>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/30 shadow-inner">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {session ? (
                                <JoinButton shareId={share.id} disabled={isFinished} />
                            ) : (
                                <Link href="/auth/signin" className="w-full">
                                    <Button variant="outline" className="w-full h-16 text-lg font-bold border-primary/50 text-primary hover:bg-primary/10">
                                        로그인하고 쉐어 참여하기
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comment Section */}
                <CommentSection
                    shareId={share.id}
                    comments={share.comments}
                    currentUserId={session?.user?.id}
                    hostId={share.creatorId}
                />
            </div>
        </main>
    )
}
