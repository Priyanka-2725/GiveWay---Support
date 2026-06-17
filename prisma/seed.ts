import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@giveway.org' },
    update: {},
    create: {
      email: 'superadmin@giveway.org',
      name: 'Super Admin',
      passwordHash: hashedPassword,
      role: 'superadmin',
      emailVerified: true,
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@giveway.org' },
    update: {},
    create: {
      email: 'admin@giveway.org',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'admin',
      emailVerified: true,
    },
  })

  const ngoAdmin = await prisma.user.upsert({
    where: { email: 'ngo@giveway.org' },
    update: {},
    create: {
      email: 'ngo@giveway.org',
      name: 'NGO Admin',
      passwordHash: hashedPassword,
      role: 'ngo_admin',
      emailVerified: true,
    },
  })

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@giveway.org' },
    update: {},
    create: {
      email: 'user@giveway.org',
      name: 'Regular User',
      passwordHash: hashedPassword,
      role: 'user',
      emailVerified: true,
    },
  })

  console.log('✅ Created users:', { superadmin, admin, ngoAdmin, regularUser })

  // Create sample NGOs
  const ngo1 = await prisma.ngo.upsert({
    where: { id: 'ngo-1' },
    update: {},
    create: {
      id: 'ngo-1',
      name: 'Clean Water Foundation',
      contactEmail: 'contact@cleanwater.org',
      cause: 'Water & Sanitation',
      state: 'Maharashtra',
      city: 'Mumbai',
      description: 'Providing clean water to rural communities',
      verified: true,
    },
  })

  const ngo2 = await prisma.ngo.upsert({
    where: { id: 'ngo-2' },
    update: {},
    create: {
      id: 'ngo-2',
      name: 'Education for All',
      contactEmail: 'contact@educationforall.org',
      cause: 'Education',
      state: 'Delhi',
      city: 'New Delhi',
      description: 'Empowering underprivileged children through education',
      verified: true,
    },
  })

  console.log('✅ Created NGOs:', { ngo1, ngo2 })

  // Create NGO membership
  await prisma.ngoMember.upsert({
    where: { id: 'member-1' },
    update: {},
    create: {
      id: 'member-1',
      ngoId: ngo1.id,
      userId: ngoAdmin.id,
      membershipRole: 'owner',
    },
  })

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
