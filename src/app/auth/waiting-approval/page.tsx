import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

export default function WaitingApprovalPage() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                            <Clock className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight uppercase">승인 대기 중</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                        회원가입 요청이 정상적으로 접수되었습니다.<br />
                        보안과 멤버십 운영을 위해 <strong>관리자의 최종 승인</strong>이 필요합니다.
                    </p>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-sm">
                        관리자가 확인 후 곧 승인해 드릴 예정입니다.<br />
                        조금만 기다려주세요!
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                        이 페이지가 보인다면 이메일 인증은 완료된 상태입니다.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
