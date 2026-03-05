const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
    const adminEmail = "asurama@gmail.com"
    const adminPassword = "killDIE112"
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    console.log(`Seeding admin user: ${adminEmail}...`)

    const user = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            role: "ADMIN",
            status: "ACTIVE",
        },
        create: {
            email: adminEmail,
            name: "Admin",
            password: hashedPassword,
            role: "ADMIN",
            status: "ACTIVE",
        },
    })

    console.log("Admin user seeded successfully:", user.id)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
