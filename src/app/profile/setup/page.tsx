"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Calendar, CreditCard, Loader2 } from "lucide-react"

// Simple action logic embedded in the client for speed, 
// though a real server action is better. Let's create a server action for this.

export default function ProfileSetupPage() {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        nickname: "",
        realName: "",
        birthDate: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch("/api/profile/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                // Update session to reflect new user status/role/nickname
                // CRITICAL: We pass the updated data to the session update() function
                // so the JWT is immediately updated and middleware sees the changes.
                await update({
                    nickname: formData.nickname,
                    status: "ACTIVE"
                })
                router.push("/")
            } else {
                alert("프로필 설정 중 오류가 발생했습니다.")
            }
        } catch (err) {
            console.error(err)
            alert("서버 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[70vh] py-12 px-4">
            <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter text-primary">프로필 초기 설정</CardTitle>
                    <CardDescription>보틀 쉐어 이용을 위해 추가 정보를 입력해 주세요.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="nickname" className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <User className="w-4 h-4" /> 닉네임 (댓글용)
                            </Label>
                            <Input
                                id="nickname"
                                placeholder="작성하신 댓글에 표시됩니다"
                                className="h-12 bg-background/50 border-primary/10"
                                value={formData.nickname}
                                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="realName" className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> 본명
                            </Label>
                            <Input
                                id="realName"
                                placeholder="실제 이름을 입력해 주세요"
                                className="h-12 bg-background/50 border-primary/10"
                                value={formData.realName}
                                onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birthDate" className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> 생년월일
                            </Label>
                            <Input
                                id="birthDate"
                                type="date"
                                className="h-12 bg-background/50 border-primary/10"
                                value={formData.birthDate}
                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                required
                            />
                            <p className="text-[10px] text-muted-foreground">성인인증 및 원활한 쉐어를 위해 필요합니다.</p>
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="flex items-center h-5">
                                <input
                                    id="adultConsent"
                                    type="checkbox"
                                    required
                                    className="w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary bg-background cursor-pointer"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="adultConsent" className="text-sm font-bold cursor-pointer">
                                    본인은 만 19세 이상의 성인임을 확인합니다.
                                </Label>
                                <p className="text-[10px] text-muted-foreground leading-tight">
                                    보틀 쉐어는 주류 관련 서비스이므로 미성년자의 이용을 엄격히 제한합니다.
                                    허위 정보 입력 시 서비스 이용이 제한될 수 있습니다.
                                </p>
                            </div>
                        </div>

                        <Button className="w-full h-12 text-lg font-black uppercase tracking-tighter" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "설정 완료"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
