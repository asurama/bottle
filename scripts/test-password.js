const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const prisma = new PrismaClient()

async function checkPassword() {
    const email = "asurama@gmail.com"
    const inputPassword = "killDIE112"

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user || !user.password) {
        console.log("User or password not found.")
        return
    }

    const isValid = await bcrypt.compare(inputPassword, user.password)
    console.log(`Password verification for ${email}: ${isValid ? "SUCCESS" : "FAILED"}`)
}

checkPassword()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
