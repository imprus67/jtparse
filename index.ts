import { saveTextMessage } from './handlers';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import input from 'input';
import { TelegramClient } from 'telegram';
import { NewMessage, NewMessageEvent } from 'telegram/events/index.js';
import { StringSession } from 'telegram/sessions/index.js';

const prisma = new PrismaClient();
const apiId = +process.env.API_ID;
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SESSION_ID); // fill this later with the value from session.save()
(async () => {
  console.log('Loading interactive example...');
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () => await input.text('Please enter your number: '),
    password: async () => await input.text('Please enter your password: '),
    phoneCode: async () =>
      await input.text('Please enter the code you received: '),
    onError: err => console.log(err),
  });
  console.log('You should now be connected.');
  // await client.sendMessage("me", { message: "Hello!" });

  async function handler(event: NewMessageEvent) {
    if (event.message.media === null || event.message.media === undefined) {
      //MessageMediaEmpty
      saveTextMessage(event)
        .catch(e => {
          throw e;
        })
        .finally(async () => {
          await prisma.$disconnect();
        });
    } else {
      let messageType = event.message.media.className;

      switch (messageType) {
        case 'MessageMediaPhoto':
          console.log('MessageMediaPhoto');
          break;
        case 'MessageMediaDocument':
          console.log('MessageMediaDocument');
          break;
        case 'MessageMediaWebPage':
          console.log('MessageMediaWebPage');
          break;
        case 'MessageMediaContact':
          console.log('MessageMediaContact');
          break;
        case 'MessageMediaVenue':
          console.log('MessageMediaVenue');
          break;
        case 'MessageMediaGeo':
          console.log('MessageMediaGeo');
          break;
        case 'MessageMediaInvoice':
          console.log('MessageMediaInvoice');
          break;
        case 'MessageMediaPoll':
          console.log('MessageMediaPoll');
          break;
        case 'MessageMediaStory':
          console.log('MessageMediaStory');
          break;
        case 'MessageMediaDice':
          console.log('MessageMediaDice');
          break;
        default:
          console.log(event);
      }
    }
    /* else if (event.message.media.className === "MessageMediaPhoto") {
      console.log("Message - MediaPhoto");
    } else if (event.message.media.className === "MessageMediaDocument") {
      console.log("Message - Document");
    } else if (event.message.media.className === "MessageMediaWebPage") {
      console.log("Message - WebPage");
    } else {
      console.log(event);
    } */
  }

  client.addEventHandler(handler, new NewMessage({}));
})();
