"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const SignupSchema = z.object({
    email: z.string().email("유효한 이메일 주소를 입력해 주세요."),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
    nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다."),
    realName: z.string().min(2, "본명은 2자 이상이어야 합니다."),
    birthDate: z.string().min(1, "생년월일을 입력해 주세요."),
})

export async function signUp(formData: FormData) {
    const rawData = Object.fromEntries(formData.entries())
    const validatedFields = SignupSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors }
    }

    const { email, password, nickname, realName, birthDate } = validatedFields.data

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return { error: "이미 가입된 이메일입니다." }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                nickname,
                realName,
                birthDate: new Date(birthDate),
                status: "PENDING", // Wait for admin approval as per existing logic
                role: "USER"
            }
        })

        return { success: true }
    } catch (err) {
        console.error("Signup error:", err)
        return { error: "회원가입 중 오류가 발생했습니다." }
    }
}
