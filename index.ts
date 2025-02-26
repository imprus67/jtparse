import {
	saveContact,
	saveDocumentMessage,
	savePhotoMessage,
	saveTextMessage,
	saveWebPageMessage,
} from './handlers.js';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import input from 'input';
import { TelegramClient } from 'telegram';
import { NewMessage } from 'telegram/events/index.js';
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

	async function handler(event) {
		const channel = +event.message.peerId.channelId;
		// if (channel != 2416977007) {

		if (event.message.media === null || event.message.media === undefined) {
			saveTextMessage(event, prisma);
			console.log('TextMessage');
			console.log(event.message.entities);
		} else {
			let messageType = event.message.media.className;

			switch (messageType) {
				case 'MessageMediaPhoto':
					await savePhotoMessage(event, prisma, client);
					console.log('PhotoMessage');
					break;
				case 'MessageMediaDocument':
					console.log(event);
					await saveDocumentMessage(event, prisma, client);
					console.log('MessageMediaDocument');
					break;
				case 'MessageMediaWebPage':
					console.log('MessageWebPage');
					await saveWebPageMessage(event, prisma);

					break;
				case 'MessageMediaContact':
					await saveContact(event, prisma);
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
		// }
	}

	client.addEventHandler(handler, new NewMessage({}));
})();
