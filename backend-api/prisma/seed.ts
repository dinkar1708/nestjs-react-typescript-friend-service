import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const DEMO_EMAIL = process.env.SEED_DEMO_EMAIL ?? 'demo@nestconnect.dev';
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'demopass123';
const DEMO_NAME = process.env.SEED_DEMO_NAME ?? 'Demo User';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { password: passwordHash, name: DEMO_NAME },
    create: {
      email: DEMO_EMAIL,
      name: DEMO_NAME,
      password: passwordHash,
    },
  });

  console.log(`Seeded demo user: ${user.email} (${user.id})`);
  console.log(`Login with: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
