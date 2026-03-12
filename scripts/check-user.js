const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function checkUser() {
    const email = "asurama@gmail.com"
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (user) {
        console.log("User found:")
        console.log(`Email: ${user.email}`)
        console.log(`Role: ${user.role}`)
        console.log(`Status: ${user.status}`)
        console.log(`Has Password: ${!!user.password}`)
    } else {
        console.log("User not found.")
    }
}

checkUser()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
