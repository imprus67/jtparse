import { messageTypes } from './types/messagetypes.js';
import {
	downloadDocument,
	downloadPhoto,
	savePhotoOrVideoFromAlbum,
} from './utils.js';
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
				mediaPath: { path: 'noPath' },
				contact: null,
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
					mediaPath: { path: `./media/${fileName}.jpg` },
					contact: null,
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
					mediaPath: { path: `./media/${fileName}.${fileExtension}` },
					contact: null,
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
		await prisma.message
			.create({
				data: {
					messageType: messageTypes.messageDocument,
					messageText: event.message.message || 'noText',
					messageMedia: true,
					voice: true,
					webPage: null,
					mediaPath: { path: `./media/${fileName}.${fileExtension}` },
					contact: null,
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
					mediaPath: { path: `./media/${fileName}.${fileExtension}` },
					contact: null,
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
				mediaPath: { path: 'noPath' },
				contact: null,
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

export async function saveContact(event, prisma: PrismaClient) {
	await prisma.message
		.create({
			data: {
				messageType: messageTypes.messageContact,
				messageText: event.message.message || 'noText',
				messageMedia: true,
				webPage: null,
				mediaPath: { path: 'noPath' },
				contact: event.message.media,
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

export async function saveAlbum(
	message,
	prisma: PrismaClient,
	client: TelegramClient
) {
	const fileName = uuidv4();
	await savePhotoOrVideoFromAlbum(message, client);
	/* then(res => {
		let video = true;
		res == 'mp4' ? (video = true) : (video = false);
		prisma.message
			.create({
				data: {
					messageType: messageTypes.messageDocument,
					messageText: message.message || 'noText',
					messageMedia: true,
					webPage: null,
					video,
					mediaPath: `./media/${fileName}.${res}`,
					contact: null,
					fwdFrom: JSON.stringify(message.fwdFrom) || null,
				},
			})
			.catch(e => {
				throw e;
			})
			.finally(async () => {
				console.log('Done saving to DB!');
				await prisma.$disconnect();
			});
	}); */
}
