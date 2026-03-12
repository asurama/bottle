"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createSharePost } from "@/app/actions-share/share"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import ImageUpload from "./image-upload"
import { updateSharePost } from "@/app/actions-share/share"
import { DatePicker } from "@/components/ui/date-picker"

const formSchema = z.object({
    whiskyName: z.string().min(2, "이름은 2자 이상이어야 합니다."),
    distillery: z.string().optional().or(z.literal("")),
    abv: z.string().optional().or(z.literal("")),
    yearsOld: z.string().optional().or(z.literal("")),
    category: z.string().min(1, "카테고리를 선택하세요."),
    condition: z.enum(["NEW", "OPENED"]),
    totalVolume: z.string().min(1, "총 용량을 입력하세요."),
    volumePerSlot: z.string().min(1, "구좌당 용량을 입력하세요."),
    pricePerSlot: z.string().min(1, "구좌당 가격을 입력하세요."),
    arrivalDate: z.string().optional().or(z.literal("")),
    startDate: z.string().min(1, "모집 시작일을 선택하세요."),
    endDate: z.string().min(1, "모집 종료일을 선택하세요."),
    eventLocation: z.string().optional().or(z.literal("")),
    whiskyImage: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

interface CreateShareFormProps {
    initialData?: {
        id: string
        whiskyName: string
        distillery: string | null
        abv: number | null
        yearsOld: number | null
        category: string
        condition: string
        totalVolume: number
        volumePerSlot: number
        pricePerSlot: number
        arrivalDate: Date | null
        startDate: Date | null
        endDate: Date | null
        eventLocation: string | null
        whiskyImage: string | null
        description: string | null
    }
    mode?: "create" | "edit"
}


export default function CreateShareForm({ initialData, mode = "create" }: CreateShareFormProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            whiskyName: initialData?.whiskyName || "",
            distillery: initialData?.distillery || "",
            abv: initialData?.abv?.toString() || "",
            yearsOld: initialData?.yearsOld?.toString() || "",
            category: initialData?.category || "OTHER",
            condition: (initialData?.condition as "NEW" | "OPENED") || "NEW",
            totalVolume: initialData?.totalVolume?.toString() || "700",
            volumePerSlot: initialData?.volumePerSlot?.toString() || "100",
            pricePerSlot: initialData?.pricePerSlot?.toString() || "",
            arrivalDate: initialData?.arrivalDate ? initialData.arrivalDate.toISOString().split("T")[0] : "",
            startDate: initialData?.startDate ? initialData.startDate.toISOString().split("T")[0] : "",
            endDate: initialData?.endDate ? initialData.endDate.toISOString().split("T")[0] : "",
            eventLocation: initialData?.eventLocation || "",
            whiskyImage: initialData?.whiskyImage || "",
            description: initialData?.description || "",
        },
    })

    async function onSubmit(values: FormValues) {
        setIsPending(true)
        setError(null)

        const formData = new FormData()
        Object.entries(values).forEach(([key, value]) => {
            if (value) formData.append(key, value)
        })

        try {
            const result = mode === "create"
                ? await createSharePost(formData)
                : await updateSharePost(initialData!.id, formData)

            if (result.error) {
                if (typeof result.error === "string") {
                    setError(result.error)
                } else {
                    setError("입력 정보를 확인해주세요.")
                }
            } else {
                router.push(mode === "create" ? "/" : `/share/${initialData?.id}`)
                router.refresh()
            }
        } catch {
            setError("알 수 없는 오류가 발생했습니다.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Card className="max-w-2xl mx-auto border-border bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-3xl font-black uppercase tracking-tighter text-primary">
                    {mode === "create" ? "보틀 쉐어 만들기" : "보틀 쉐어 수정하기"}
                </CardTitle>
                <CardDescription>공유하고 싶은 보틀의 정보를 상세히 입력해주세요.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Section: Basic Info */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 border-b border-primary/10 pb-2">기본 정보</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="whiskyName"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel className="text-xs font-semibold uppercase tracking-widest">위스키 이름 *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="맥캘란 18년 쉐리 오크" className="h-11 bg-background/50 border-primary/10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="distillery"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase tracking-widest">증류소</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Macallan" className="h-11 bg-background/50 border-primary/10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase tracking-widest">카테고리 *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 bg-background/50 border-primary/10">
                                                        <SelectValue placeholder="종류 선택" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="SHERRY">쉐리 캐스크 (SHERRY)</SelectItem>
                                                    <SelectItem value="BOURBON">버번 캐스크 (BOURBON)</SelectItem>
                                                    <SelectItem value="PEAT">피트 (PEAT)</SelectItem>
                                                    <SelectItem value="OTHER">기타 (OTHER)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="yearsOld"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase tracking-widest">숙성 년수 (Age)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="18" className="h-11 bg-background/50 border-primary/10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="abv"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase tracking-widest">도수 (ABV %)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="43.0" className="h-11 bg-background/50 border-primary/10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Section: Image & Description */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                            <FormField
                                control={form.control}
                                name="whiskyImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xs font-semibold uppercase tracking-widest">보틀 이미지</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                defaultValue={field.value}
                                                onUploadComplete={(url) => field.onChange(url)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase tracking-widest">상세 설명</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="제품 설명, 보관 상태, 쉐어 조건 등을 입력해주세요."
                                                className="min-h-[192px] bg-background/50 border-primary/10 text-sm leading-relaxed"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Section: Period & Arrival */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-primary/60 border-b border-primary/10 pb-2">기한 및 도착 안내</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormItem className="md:col-span-2">
                                    <FormLabel className="text-xs font-semibold uppercase tracking-widest">모집 기간 *</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <FormField
                                            control={form.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormControl className="flex-1">
                                                    <DatePicker
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="시작일 선택"
                                                    />
                                                </FormControl>
                                            )}
                                        />
                                        <span className="text-muted-foreground font-bold">~</span>
                                        <FormField
                                            control={form.control}
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormControl className="flex-1">
                                                    <DatePicker
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="종료일 선택"
                                                    />
                                                </FormControl>
                                            )}
                                        />
                                    </div>
                                </FormItem>
                                <FormField
                                    control={form.control}
                                    name="arrivalDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase tracking-widest text-primary/80">도착예정일 (정모일)</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="도착예정일 선택"
                                                    className="border-primary/20 [&>button]:bg-primary/5"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="eventLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase tracking-widest">장소 (선택)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="강남 아지트" className="h-11 bg-background/50 border-primary/10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Section: Volume & Price */}
                        <div className="pt-6 border-t border-border/50 space-y-6">
                            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">용량 및 가격 설정</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="totalVolume"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase tracking-widest">총 용량 (ml)</FormLabel>
                                            <FormControl>
                                                <Input type="number" className="h-11 bg-background/50 border-primary/10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="volumePerSlot"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase tracking-widest">구좌당 용량 (ml)</FormLabel>
                                            <FormControl>
                                                <Input type="number" className="h-11 bg-background/50 border-primary/10" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="pricePerSlot"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold uppercase tracking-widest text-primary/80">구좌당 가격 (원)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="150000" className="h-11 bg-primary/5 border-primary/20 font-bold" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-3 font-medium uppercase tracking-tighter italic">
                                * 총 구좌수는 총 용량을 구좌당 용량으로 나누어 자동 계산됩니다.
                            </p>
                        </div>

                        {error && <p className="text-xs font-bold text-destructive text-center uppercase tracking-widest">{error}</p>}

                        <Button type="submit" className="w-full h-14 text-xl font-black uppercase tracking-tighter shadow-2xl shadow-primary/20" disabled={isPending}>
                            {isPending ? "저장 중..." : (mode === "create" ? "쉐어 등록하기" : "수정 완료하기")}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
