import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

function getRemainingDays(endDate: Date | null | undefined) {
    if (!endDate) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setHours(0, 0, 0, 0)
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

interface BottleCardProps {
    id: string
    title: string
    distillery: string
    abv: string
    age?: string
    image: string
    pricePerSlot: number
    totalSlots: number
    occupiedSlots: number
    volumePerSlot: string
    status: "RECRUITING" | "FINISHED" | "CANCELLED"
    condition?: string
    category?: string | null
    endDate?: Date | null
}

export function BottleCard({
    id,
    title,
    distillery,
    abv,
    age,
    image,
    pricePerSlot,
    totalSlots,
    occupiedSlots,
    volumePerSlot,
    status,
    condition,
    category,
    endDate,
}: BottleCardProps) {
    const progress = (occupiedSlots / totalSlots) * 100
    const remainingDays = getRemainingDays(endDate)

    return (
        <Link href={`/share/${id}`} className="block">
            <Card className="overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:-translate-y-1 group cursor-pointer">
                <CardHeader className="p-0">
                    <AspectRatio ratio={3 / 4} className="bg-muted/30">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105 brightness-[1.02]"
                        />
                        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                            <Badge variant={status === "RECRUITING" ? "default" : "secondary"}>
                                {status === "RECRUITING" ? "모집중" : "마감"}
                            </Badge>
                            {condition && (
                                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                                    {condition === "NEW" ? "미개봉" : "개봉"}
                                </Badge>
                            )}
                        </div>
                        {/* Remaining days badge */}
                        {remainingDays !== null && status === "RECRUITING" && (
                            <div className={`
                                absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border
                                ${remainingDays <= 0
                                    ? "bg-red-900/80 border-red-500/50 text-red-300"
                                    : remainingDays <= 3
                                        ? "bg-red-900/70 border-red-500/40 text-red-300 animate-pulse"
                                        : remainingDays <= 7
                                            ? "bg-amber-900/70 border-amber-500/40 text-amber-300"
                                            : "bg-black/60 border-white/10 text-white/80"
                                }
                            `}>
                                <Clock className="w-2.5 h-2.5" />
                                {remainingDays <= 0 ? "기간만료" : `D-${remainingDays}`}
                            </div>
                        )}
                    </AspectRatio>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-primary uppercase tracking-wider">{distillery}</p>
                        <h3 className="font-bold text-lg leading-tight truncate">{title}</h3>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                        {category && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                {category === "SHERRY" ? "쉐리" :
                                    category === "BOURBON" ? "버번" :
                                        category === "PEAT" ? "피트" : "기타"}
                            </Badge>
                        )}
                        <Badge variant="outline" className="border-primary/30 text-muted-foreground">{abv}%</Badge>
                        {age && <Badge variant="outline" className="border-primary/30 text-muted-foreground">{age}y</Badge>}
                        <Badge variant="outline" className="border-primary/30 text-muted-foreground">{volumePerSlot}</Badge>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-muted-foreground">모집 현황</span>
                            <span>{occupiedSlots}/{totalSlots} 구좌</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-border/50 mt-auto pt-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase">구좌당</span>
                        <span className="font-bold text-primary">₩{pricePerSlot.toLocaleString()}</span>
                    </div>
                    <Button size="sm" variant="default" className="font-semibold">
                        상세보기
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    )
}
