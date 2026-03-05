"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { joinShare } from "@/app/actions-share/share"
import { useRouter } from "next/navigation"

interface JoinButtonProps {
    shareId: string
    disabled?: boolean
}

export function JoinButton({ shareId, disabled }: JoinButtonProps) {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleJoin = async () => {
        setIsPending(true)
        setError(null)
        try {
            const result = await joinShare(shareId)
            if (result?.error) {
                setError(result.error)
            } else {
                router.refresh()
            }
        } catch {
            setError("요청 중 오류가 발생했습니다.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="w-full space-y-2">
            <Button
                size="lg"
                className="w-full text-lg font-black h-16 shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform"
                onClick={handleJoin}
                disabled={disabled || isPending}
            >
                {isPending ? "처리 중..." : "보틀 쉐어 참여하기"}
            </Button>
            {error && <p className="text-xs text-center font-medium text-destructive">{error}</p>}
        </div>
    )
}
