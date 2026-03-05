import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { approveUser, rejectUser } from "@/app/actions-admin/user"
import { UserCheck, UserX, Clock, ShieldCheck } from "lucide-react"

export default async function AdminUsersPage() {
    const session = await auth()

    // Security: Server-side role check
    if ((session?.user as any)?.role !== "ADMIN") {
        redirect("/")
    }

    const users = await prisma.user.findMany({
        orderBy: { email: "asc" },
        include: {
            shares: { take: 0 }, // Just to check relations if needed
        }
    })

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                        User Management
                    </h1>
                    <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest mt-1">지인 가입 승인 및 계정 관리</p>
                </div>
            </div>

            <div className="grid gap-4">
                {users.map((user) => (
                    <Card key={user.id} className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
                        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <span className="font-black text-primary uppercase">{user.email?.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{user.name || "사용자"}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="outline" className="text-[10px] uppercase font-black tracking-tighter border-primary/30">
                                            {user.role}
                                        </Badge>
                                        <Badge
                                            variant={user.status === "ACTIVE" ? "default" : user.status === "PENDING" ? "secondary" : "destructive"}
                                            className="text-[10px] uppercase font-black tracking-tighter"
                                        >
                                            {user.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {user.status === "PENDING" && (
                                    <form action={async () => {
                                        "use server"
                                        await approveUser(user.id)
                                    }}>
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-bold border-none shadow-[0_0_15px_rgba(5,150,105,0.4)]">
                                            <UserCheck className="w-4 h-4 mr-2" />
                                            가입 승인
                                        </Button>
                                    </form>
                                )}

                                {user.status === "ACTIVE" && user.role !== "ADMIN" && (
                                    <form action={async () => {
                                        "use server"
                                        await rejectUser(user.id)
                                    }}>
                                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 font-bold">
                                            <UserX className="w-4 h-4 mr-2" />
                                            계정 정지
                                        </Button>
                                    </form>
                                )}

                                {user.status === "SUSPENDED" && (
                                    <form action={async () => {
                                        "use server"
                                        await approveUser(user.id)
                                    }}>
                                        <Button size="sm" variant="outline" className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 font-bold">
                                            <UserCheck className="w-4 h-4 mr-2" />
                                            정지 해제
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
