import { BottleCard } from "@/components/share/bottle-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

  const shares = await prisma.bottleShare.findMany({
    where: category && category !== "ALL" ? { category } : {},
    orderBy: { createdAt: "desc" },
    include: {
      participations: true,
    },
  })

  const categories = [
    { label: "전체", value: "ALL" },
    { label: "피트", value: "PEAT" },
    { label: "쉐리", value: "SHERRY" },
    { label: "버번", value: "BOURBON" },
    { label: "기타", value: "OTHER" },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-border/50 pb-8">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary drop-shadow-[0_2px_10px_rgba(234,179,8,0.2)]">
              BOTTLE SHARE
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl font-medium">
              희귀하고 비싼 위스키를 함께 탐험하세요. <br className="hidden sm:block" />
              취향이 맞는 분들과 최고의 보틀을 쉐어합니다.
            </p>
          </div>
          <Link href="/share/create">
            <Button size="lg" className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-5 w-5" /> 계획 만들기
            </Button>
          </Link>
        </header>

        {/* Filters and List */}
        <div className="space-y-8">
          <div className="flex justify-between items-end border-b border-border/30 pb-4">
            <h2 className="text-2xl font-bold">진행 중인 쉐어</h2>
            <div className="flex gap-4 text-sm font-medium text-muted-foreground">
              {categories.map((cat) => (
                <Link
                  key={cat.value}
                  href={cat.value === "ALL" ? "/" : `/?category=${cat.value}`}
                  className={`${category === cat.value || (!category && cat.value === "ALL")
                    ? "text-primary border-b-2 border-primary"
                    : "hover:text-primary transition-colors"
                    } pb-1 cursor-pointer`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shares.length > 0 ? (
              shares.map((share) => {
                const occupiedSlots = share.participations.reduce((sum: number, p: { slots: number }) => sum + p.slots, 0)
                return (
                  <BottleCard
                    key={share.id}
                    id={share.id}
                    title={share.whiskyName}
                    distillery={share.distillery || "Unknown"}
                    image={share.whiskyImage || "https://images.unsplash.com/photo-1599566217208-aa9281d3d197?q=80&w=1974&auto=format&fit=crop"}
                    abv={share.abv?.toString() || "40"}
                    age={share.yearsOld?.toString()}
                    pricePerSlot={share.pricePerSlot}
                    totalSlots={share.totalSlots}
                    occupiedSlots={occupiedSlots}
                    volumePerSlot={`${share.volumePerSlot}ml`}
                    status={share.status === "OPEN" ? "RECRUITING" : "FINISHED"}
                    condition={share.condition}
                    category={share.category}
                    endDate={share.endDate}
                  />
                )
              })
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-muted-foreground font-medium">진행 중인 쉐어가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
