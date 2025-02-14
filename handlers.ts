import { messageTypes } from './types/messagetypes.js';
import { downloadDocument, downloadPhoto } from './utils.js';
import { PrismaClient } from '@prisma/client';
import { Api, client, TelegramClient } from 'telegram';
import { v4 as uuidv4 } from 'uuid';

export async function saveTextMessage(event, prisma: PrismaClient) {
	await prisma.message
		.create({
			data: {
				messageType: messageTypes.messageText,
				messageText: event.message.message,
				messageMedia: false,
				webPage: null,
				mediaPath: 'noPath',
				fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
			},
		})
		.catch(e => {
			throw e;
		})
		.finally(async () => {
			await prisma.$disconnect();
		});
}

export async function savePhotoMessage(
	event,
	prisma: PrismaClient,
	client: TelegramClient
) {
	const fileName = uuidv4();

	await downloadPhoto(event, client, fileName).then(() => {
		prisma.message
			.create({
				data: {
					messageType: messageTypes.messagePhoto,
					messageText: event.message.message || 'noText',
					messageMedia: true,
					spoiler: event.message.media.spoiler,
					webPage: null,
					mediaPath: `./media/${fileName}.jpg`,
					fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
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

export async function saveDocumentMessage(event, prisma: PrismaClient, client) {
	const fileName = uuidv4();
	const fileExtension = await downloadDocument(event, client, fileName);

	if (event.message.media?.video == true) {
		prisma.message
			.create({
				data: {
					messageType: messageTypes.messageDocument,
					messageText: event.message.message || 'noText',
					messageMedia: true,
					spoiler: event.message.media.spoiler,
					video: true,
					round: event.message.media.round,
					webPage: null,
					mediaPath: `./media/${fileName}.${fileExtension}`,
					fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
				},
			})
			.catch(e => {
				throw e;
			})
			.finally(async () => {
				console.log('Done saving to DB!');
				await prisma.$disconnect();
			});
	} else if (event.message.media?.voice == true) {
		prisma.message
			.create({
				data: {
					messageType: messageTypes.messageDocument,
					messageText: event.message.message || 'noText',
					messageMedia: true,
					voice: true,
					webPage: null,
					mediaPath: `./media/${fileName}.${fileExtension}`,
					fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
				},
			})
			.catch(e => {
				throw e;
			})
			.finally(async () => {
				console.log('Done saving to DB!');
				await prisma.$disconnect();
			});
	} else {
		prisma.message
			.create({
				data: {
					messageType: messageTypes.messageDocument,
					messageText: event.message.message || 'noText',
					messageMedia: true,
					webPage: null,
					mediaPath: `./media/${fileName}.${fileExtension}`,
					fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
				},
			})
			.catch(e => {
				throw e;
			})
			.finally(async () => {
				console.log('Done saving to DB!');
				await prisma.$disconnect();
			});
	}
}

export async function saveWebPageMessage(event, prisma: PrismaClient) {
	await prisma.message
		.create({
			data: {
				messageType: messageTypes.messageWebPage,
				messageText: event.message.message || 'noText',
				messageMedia: true,
				webPage: event.message.media.webpage,
				mediaPath: 'noPath',
				fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
			},
		})
		.catch(e => {
			throw e;
		})
		.finally(async () => {
			console.log('Done saving to DB!');
			await prisma.$disconnect();
		});
}
