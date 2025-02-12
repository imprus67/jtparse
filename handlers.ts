import { PrismaClient } from '@prisma/client';
import { NewMessageEvent } from 'telegram/events';

const prisma = new PrismaClient();

export async function saveTextMessage(event: NewMessageEvent) {
  await prisma.textMessage.create({
    data: {
      messageText: event.message.message,
    },
  });
}
