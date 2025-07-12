import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.whatsappMessage.create({
    data: {
      wa_id: '5216623254234',
      message_id: 'wamid.HBgXXXX',
      direction: 'IN',
      type: 'text',
      body_text: '¡Hola desde Prisma!',
      timestamp: Date.now(),
      raw_json: { prueba: true }
    }
  });

  console.log("✅ Registro insertado:", result);

  const allMessages = await prisma.whatsappMessage.findMany();
  console.log("🗂️ Mensajes en DB:", allMessages);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
