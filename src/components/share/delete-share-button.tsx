"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteSharePost } from "@/app/actions-share/share"

export function DeleteShareButton({ shareId }: { shareId: string }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("이 쉐어를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return
        setIsLoading(true)
        try {
            const result = await deleteSharePost(shareId)
            if (result.error) {
                alert(result.error)
            } else {
                router.push("/")
                router.refresh()
            }
        } catch {
            alert("삭제 중 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-bold border-destructive/20 text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isLoading}
        >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            삭제
        </Button>
    )
}
