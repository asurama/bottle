import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Calendar, MapPin, Beer, GlassWater, Clock, Info } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { JoinButton } from "@/components/share/join-button"
import { ParticipationList } from "@/components/share/participation-list"
import { CommentSection } from "@/components/share/comment-section"
import Link from "next/link"
import { auth } from "@/auth"

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

    const occupiedSlots = share.participations.reduce((sum: number, p: any) => sum + p.slots, 0)
    const progress = (occupiedSlots / share.totalSlots) * 100
    const isFinished = share.status !== "OPEN" || occupiedSlots >= share.totalSlots

    return (
        <main className="min-h-screen bg-background pb-20">
            <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-12 space-y-12">
                <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors inline-block">
                    ← 목록으로 돌아가기
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Side: Image Section */}
                    <div className="space-y-6">
                        <AspectRatio ratio={3 / 4} className="rounded-2xl overflow-hidden border border-border/50 bg-muted shadow-2xl">
                            <Image
                                src={share.whiskyImage || "https://images.unsplash.com/photo-1599566217208-aa9281d3d197?q=80&w=1974&auto=format&fit=crop"}
                                alt={share.whiskyName}
                                fill
                                className="object-cover"
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
                                    {share.condition === "NEW" ? "미개봉" : "오픈"}
                                </Badge>
                            </div>
                        </div>

                        <Card className="border-border/30 bg-card/30">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{share.eventDate || "날짜 미정"} 정모/도착</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{share.eventLocation || "장소 미정"}</span>
                                </div>
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
                                <Link href="/api/auth/signin" className="w-full">
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
                />
            </div>
        </main>
    )
}
