"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, Calendar, CreditCard, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/app/actions-auth/signup"

export default function SignupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.")
            setIsLoading(false)
            return
        }

        try {
            const result = await signUp(formData)
            if (result.error) {
                if (typeof result.error === "string") {
                    setError(result.error)
                } else {
                    setError("입력 정보를 확인해 주세요.")
                }
            } else {
                router.push("/auth/signin?registered=true")
            }
        } catch (err) {
            console.error(err)
            setError("서버 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[90vh] py-12 px-4">
            <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-md shadow-2xl">
                <CardHeader className="text-center space-y-1">
                    <div className="flex justify-start mb-2">
                        <Link href="/auth/signin" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                            <ArrowLeft className="w-3 h-3" /> 로그인으로 돌아가기
                        </Link>
                    </div>
                    <CardTitle className="text-3xl font-black uppercase tracking-tighter text-primary">회원가입</CardTitle>
                    <CardDescription>BOTTLE SHARE의 새로운 멤버가 되어보세요.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Mail className="w-3 h-3" /> 이메일 주소
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="example@gmail.com"
                                className="h-11 bg-background/50 border-primary/10"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> 비밀번호
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-11 bg-background/50 border-primary/10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> 비밀번호 확인
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-11 bg-background/50 border-primary/10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nickname" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <User className="w-3 h-3" /> 닉네임
                                </Label>
                                <Input
                                    id="nickname"
                                    name="nickname"
                                    placeholder="닉네임"
                                    className="h-11 bg-background/50 border-primary/10"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="realName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <CreditCard className="w-3 h-3" /> 본명
                                </Label>
                                <Input
                                    id="realName"
                                    name="realName"
                                    placeholder="홍길동"
                                    className="h-11 bg-background/50 border-primary/10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birthDate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> 생년월일
                            </Label>
                            <Input
                                id="birthDate"
                                name="birthDate"
                                type="date"
                                className="h-11 bg-background/50 border-primary/10"
                                required
                            />
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                            <div className="flex items-center h-5">
                                <input
                                    id="adultConsent"
                                    type="checkbox"
                                    required
                                    className="w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary bg-background cursor-pointer"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="adultConsent" className="text-[11px] font-bold cursor-pointer">
                                    만 19세 이상의 성인임을 확인합니다.
                                </Label>
                            </div>
                        </div>

                        {error && <p className="text-[11px] font-bold text-destructive text-center">{error}</p>}

                        <Button className="w-full h-12 text-lg font-black uppercase tracking-tighter mt-2 shadow-lg shadow-primary/20" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "가입하기"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
