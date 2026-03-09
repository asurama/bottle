"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function AuthErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")

    let title = "오류 발생"
    let message = "인증 과정 중 예기치 않은 오류가 발생했습니다."
    let isWaiting = false

    if (error === "WAITING_APPROVAL") {
        title = "승인 대기 중"
        message = "가입 승인이 아직 완료되지 않았습니다. 관리자의 승인을 기다려주세요."
        isWaiting = true
    } else if (error === "ACCOUNT_SUSPENDED") {
        title = "계정 정지됨"
        message = "해당 계정은 정지된 상태입니다. 관리자에게 문의하세요."
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh] py-20">
            <Card className="w-full max-w-md border-destructive/20 bg-card/50">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <AlertCircle className="w-12 h-12 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase text-destructive">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                    <p className="text-muted-foreground">{message}</p>

                    {isWaiting ? (
                        <Link href="/auth/waiting-approval">
                            <Button variant="outline" className="w-full font-bold">자세한 정보 보기</Button>
                        </Link>
                    ) : (
                        <Link href="/">
                            <Button variant="ghost" className="w-full">홈으로 돌아가기</Button>
                        </Link>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthErrorContent />
        </Suspense>
    )
}
