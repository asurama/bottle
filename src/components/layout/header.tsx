"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, User, PlusCircle, LogOut, ShieldCheck } from "lucide-react"

export function Header() {
    const { data: session } = useSession()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-2xl font-black tracking-tighter text-primary drop-shadow-[0_2px_10px_rgba(234,179,8,0.3)] group-hover:scale-105 transition-transform">
                        BOTTLE
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {session?.user?.role === "ADMIN" && (
                        <Link href="/admin/users">
                            <Button variant="ghost" size="sm" className="font-bold text-primary hover:bg-primary/10">
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                관리자
                            </Button>
                        </Link>
                    )}
                    <Link href="/share/create">
                        <Button variant="ghost" size="sm" className="font-bold text-muted-foreground hover:text-primary transition-colors">
                            <PlusCircle className="w-4 h-4 mr-2" />
                            쉐어 만들기
                        </Button>
                    </Link>

                    {session ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="border-primary/20 bg-primary/5 font-bold">
                                    <User className="w-4 h-4 mr-2" />
                                    {(session.user as any)?.nickname || session.user?.name || "사용자"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-lg border-primary/20">
                                <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive cursor-pointer">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    로그아웃
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/auth/signin">
                            <Button size="sm" className="font-bold">로그인</Button>
                        </Link>
                    )}
                </nav>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-lg border-primary/20">
                            {session?.user?.role === "ADMIN" && (
                                <Link href="/admin/users">
                                    <DropdownMenuItem className="font-bold py-3 text-primary cursor-pointer">
                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                        관리자 도구
                                    </DropdownMenuItem>
                                </Link>
                            )}
                            <Link href="/share/create">
                                <DropdownMenuItem className="font-bold py-3 cursor-pointer">
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    쉐어 만들기
                                </DropdownMenuItem>
                            </Link>
                            {session ? (
                                <>
                                    <DropdownMenuItem className="font-bold py-3 text-muted-foreground">
                                        <User className="w-4 h-4 mr-2" />
                                        {(session.user as any)?.nickname || session.user?.name || "사용자"}님
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => signOut()} className="text-destructive font-bold py-3 cursor-pointer">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        로그아웃
                                    </DropdownMenuItem>
                                </>
                            ) : (
                                <Link href="/auth/signin">
                                    <DropdownMenuItem className="font-bold py-3 cursor-pointer">
                                        로그인
                                    </DropdownMenuItem>
                                </Link>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
