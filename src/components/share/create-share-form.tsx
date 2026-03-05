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

const formSchema = z.object({
    whiskyName: z.string().min(2, "이름은 2자 이상이어야 합니다."),
    distillery: z.string().optional(),
    abv: z.string().optional(),
    yearsOld: z.string().optional(),
    condition: z.enum(["NEW", "OPENED"]),
    totalVolume: z.string().min(1, "총 용량을 입력하세요."),
    volumePerSlot: z.string().min(1, "구좌당 용량을 입력하세요."),
    pricePerSlot: z.string().min(1, "구좌당 가격을 입력하세요."),
    eventDate: z.string().optional(),
    eventLocation: z.string().optional(),
    whiskyImage: z.string().optional(),
    description: z.string().optional(),
})

export default function CreateShareForm() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            whiskyName: "",
            distillery: "",
            abv: "",
            yearsOld: "",
            condition: "NEW",
            totalVolume: "700",
            volumePerSlot: "100",
            pricePerSlot: "",
            eventDate: "",
            eventLocation: "",
            whiskyImage: "",
            description: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsPending(true)
        setError(null)

        const formData = new FormData()
        Object.entries(values).forEach(([key, value]) => {
            if (value) formData.append(key, value)
        })

        try {
            const result = await createSharePost(formData)
            if (result.error) {
                if (typeof result.error === "string") {
                    setError(result.error)
                } else {
                    setError("입력 정보를 확인해주세요.")
                    // Optionally map field errors back to the form
                }
            } else {
                router.push("/")
            }
        } catch {
            setError("알 수 없는 오류가 발생했습니다.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Card className="max-w-2xl mx-auto border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">보틀 쉐어 만들기</CardTitle>
                <CardDescription>공유하고 싶은 보틀의 정보를 입력해주세요.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="whiskyName"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>위스키 이름 *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="맥캘란 18년 쉐리 오크" {...field} />
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
                                        <FormLabel>증류소</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Macallan" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="yearsOld"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>숙성 년수 (Age)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="18" {...field} />
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
                                        <FormLabel>도수 (ABV %)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.1" placeholder="43.0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="condition"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>보틀 상태</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="상태 선택" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NEW">미개봉 (NEW)</SelectItem>
                                                <SelectItem value="OPENED">개봉됨 (OPENED)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>상세 설명</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="제품 설명, 보관 상태, 쉐어 조건 등을 입력해주세요."
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-4 border-t border-border/50">
                            <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">용량 및 가격 설정</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="totalVolume"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>총 용량 (ml)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
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
                                            <FormLabel>구좌당 용량 (ml)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
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
                                            <FormLabel>구좌당 가격 (원)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="150000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                * 총 구좌수는 총 용량을 구좌당 용량으로 나누어 자동 계산됩니다.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">일정 및 장소</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="eventDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>정모/도착 예정일</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
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
                                            <FormLabel>장소</FormLabel>
                                            <FormControl>
                                                <Input placeholder="강남 아지트" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {error && <p className="text-xs font-medium text-destructive">{error}</p>}

                        <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isPending}>
                            {isPending ? "생성 중..." : "쉐어 등록하기"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
