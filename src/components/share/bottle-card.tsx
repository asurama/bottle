import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"

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
}: BottleCardProps) {
    const progress = (occupiedSlots / totalSlots) * 100

    return (
        <Link href={`/share/${id}`} className="block">
        <Card className="overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:-translate-y-1 group cursor-pointer">
            <CardHeader className="p-0">
                <AspectRatio ratio={3 / 4} className="bg-muted">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <Badge variant={status === "RECRUITING" ? "default" : "secondary"}>
                            {status === "RECRUITING" ? "모집중" : "마감"}
                        </Badge>
                        {condition && (
                            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                                {condition === "NEW" ? "미개봉" : "개봉"}
                            </Badge>
                        )}
                    </div>
                </AspectRatio>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-primary uppercase tracking-wider">{distillery}</p>
                    <h3 className="font-bold text-lg leading-tight truncate">{title}</h3>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
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
