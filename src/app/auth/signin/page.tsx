"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, Loader2, LogIn, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

function SigninForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const isRegistered = searchParams.get("registered") === "true"

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                if (result.error === "WAITING_APPROVAL") {
                    setError("승인 대기 중인 계정입니다. 관리자 승인 후 이용 가능합니다.")
                } else if (result.error === "ACCOUNT_SUSPENDED") {
                    setError("정지된 계정입니다. 관리자에게 문의해 주세요.")
                } else {
                    setError("이메일 또는 비밀번호가 올바르지 않습니다.")
                }
            } else {
                router.push("/")
                router.refresh()
            }
        } catch (err) {
            console.error(err)
            setError("로그인 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-md shadow-2xl">
            <CardHeader className="text-center space-y-1">
                <CardTitle className="text-3xl font-black uppercase tracking-tighter text-primary">LOGIN</CardTitle>
                <CardDescription>BOTTLE SHARE에 오신 것을 환영합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isRegistered && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-500 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <p className="text-xs font-bold leading-tight">회원가입이 완료되었습니다! <br />관리자 승인 후 로그인이 가능합니다.</p>
                    </div>
                )}

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
                            className="h-12 bg-background/50 border-primary/10"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Lock className="w-3 h-3" /> 비밀번호
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            className="h-12 bg-background/50 border-primary/10"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive animate-in fade-in zoom-in-95">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p className="text-[11px] font-bold">{error}</p>
                        </div>
                    )}

                    <Button className="w-full h-12 text-lg font-black uppercase tracking-tighter shadow-lg shadow-primary/20" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : (
                            <>
                                <LogIn className="w-5 h-5 mr-2" /> 로그인
                            </>
                        )}
                    </Button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground font-bold tracking-widest">or</span>
                    </div>
                </div>

                <Link href="/auth/signup">
                    <Button variant="outline" className="w-full h-12 text-sm font-bold border-primary/10 hover:bg-primary/5 mt-2">
                        <UserPlus className="w-4 h-4 mr-2" /> 계정이 없으신가요? 회원가입
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}

export default function SigninPage() {
    return (
        <div className="flex items-center justify-center min-h-[80vh] py-12 px-4">
            <Suspense fallback={<Loader2 className="animate-spin w-10 h-10 text-primary" />}>
                <SigninForm />
            </Suspense>
        </div>
    )
}
