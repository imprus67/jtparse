import {
	saveAlbum,
	saveContact,
	saveDocumentMessage,
	savePhotoMessage,
	saveTextMessage,
	saveWebPageMessage,
} from './handlers.js';
import { messageTypes } from './types/messagetypes.js';
import { savePhotoOrVideoFromAlbum } from './utils.js';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import input from 'input';
import { TelegramClient } from 'telegram';
import { Album, AlbumEvent } from 'telegram/events/Album.js';
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

	async function listenForAlbums(event: AlbumEvent) {
		async function albumPromise() {
			let messages = event.messages;
			let messageText = '';
			let fwdFrom = {};
			let mediaPathArray = [];

			for (const message of messages) {
				let path = await savePhotoOrVideoFromAlbum(message, client);
				mediaPathArray.push(path);
				if (message.fwdFrom != null || message.fwdFrom != undefined) {
					fwdFrom = message.fwdFrom;
				}
				if (
					(message.text != '' || message.text != null) &&
					messageText == ''
				) {
					messageText = message.text;
				}
			}
			// console.log({
			// 	messageText,
			// 	fwdFrom,
			// 	mediaPathArray,
			// });
			return {
				messageText,
				fwdFrom,
				mediaPathArray,
			};
		}

		await albumPromise().then(messageObject => {
			prisma.message
				.create({
					data: {
						messageType: messageTypes.messageAlbum,
						messageText: messageObject.messageText || 'noText',
						messageMedia: true,
						webPage: null,
						mediaPath: { path: messageObject.mediaPathArray },
						contact: null,
						fwdFrom: JSON.stringify(messageObject.fwdFrom) || null,
						isGrouped: true,
					},
				})
				.catch(e => {
					throw e;
				})
				.finally(async () => {
					console.log('Done saving to DB!');
					await prisma.$disconnect();
				});
		});
	}
	// adds an event handler for new messages

	async function handler(event: NewMessageEvent) {
		if (event.message?.groupedId == null) {
			if (
				event.message.media === null ||
				event.message.media === undefined
			) {
				saveTextMessage(event, prisma);
				console.log('TextMessage');
			} else {
				let messageType = event.message.media.className;

				switch (messageType) {
					case 'MessageMediaPhoto':
						await savePhotoMessage(event, prisma, client);
						console.log('PhotoMessage');
						break;
					case 'MessageMediaDocument':
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
		}
	}

	client.addEventHandler(listenForAlbums, new Album({}));
	client.addEventHandler(handler, new NewMessage({}));
})();
