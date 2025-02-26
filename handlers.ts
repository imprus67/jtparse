import { messageTypes } from './types/messagetypes.js';
import {
	downloadDocument,
	downloadPhoto,
	savePhotoOrVideoFromAlbum,
} from './utils.js';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { Api, client, TelegramClient } from 'telegram';
import { message } from 'telegram/client/index.js';
import { v4 as uuidv4 } from 'uuid';

export async function saveTextMessage(event, prisma: PrismaClient) {
	await prisma.message
		.create({
			data: {
				messageType: messageTypes.messageText,
				messageText: event.message.message,
				entities: event.message.entities,
				messageMedia: false,
				attributesOfDocument: null,
				webPage: null,
				mediaPath: 'noPath',
				contact: null,
				fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
				fromChannel: event.message.peerId.channelId,
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
		let isGrouped = false;
		if (event.message.groupedId != null) {
			isGrouped = true;
		}
		prisma.message
			.create({
				data: {
					messageType: messageTypes.messagePhoto,
					messageText: event.message.message || 'noText',
					entities: event.message.entities,
					messageMedia: true,
					spoiler: event.message.media.spoiler,
					webPage: null,
					attributesOfDocument: null,
					mediaPath: `${process.env.MEDIA_PATH}/${fileName}.jpg`,
					contact: null,
					isGrouped,
					groupId: event.message.groupedId || 'null',
					fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
					fromChannel: event.message.peerId.channelId,
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
	if (
		event.message.media.video == true ||
		event.message.media.video == 'true'
	) {
		let isGrouped = false;
		if (event.message.groupedId != null) {
			isGrouped = true;
		}
		prisma.message
			.create({
				data: {
					messageType: messageTypes.messageDocument,
					messageText: event.message.message || 'noText',
					entities: event.message.entities,
					messageMedia: true,
					spoiler: event.message.media.spoiler,
					video: true,
					attributesOfDocument:
						event.message.media.document.attributes,
					webPage: null,
					mediaPath: `${process.env.MEDIA_PATH}/${fileName}.${fileExtension}`,
					contact: null,
					isGrouped,
					groupId: event.message.groupedId || 'null',
					fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
					fromChannel: event.message.peerId.channelId,
				},
			})
			.catch(e => {
				throw e;
			})
			.finally(async () => {
				console.log('Done saving to DB!');
				await prisma.$disconnect();
			});
	} else if (event.message.media.voice == true) {
		console.log('VOICE!!!!');
		await prisma.message
			.create({
				data: {
					messageType: messageTypes.messageDocument,
					messageText: event.message.message || 'noText',
					entities: event.message.entities,
					messageMedia: true,
					voice: true,
					attributesOfDocument:
						event.message.media.document.attributes,
					webPage: null,
					mediaPath: `${process.env.MEDIA_PATH}/${fileName}.${fileExtension}`,
					contact: null,
					fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
					fromChannel: event.message.peerId.channelId,
				},
			})
			.catch(e => {
				throw e;
			})
			.finally(async () => {
				console.log('Done saving to DB!');
				await prisma.$disconnect();
			});
	} else if (
		event.message.media.video == false &&
		event.message.media.round == true
	) {
		prisma.message
			.create({
				data: {
					messageType: messageTypes.messageDocument,
					messageText: event.message.message || 'noText',
					entities: event.message.entities,
					messageMedia: true,
					round: true,
					attributesOfDocument:
						event.message.media.document.attributes,
					webPage: null,
					mediaPath: `${process.env.MEDIA_PATH}/${fileName}.${fileExtension}`,
					contact: null,
					fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
					fromChannel: event.message.peerId.channelId,
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
		{
			prisma.message
				.create({
					data: {
						messageType: messageTypes.messageDocument,
						messageText: event.message.message || 'noText',
						entities: event.message.entities,
						messageMedia: true,
						webPage: null,
						attributesOfDocument:
							event.message.media.document.attributes,
						mediaPath: `${process.env.MEDIA_PATH}/${fileName}.${fileExtension}`,
						contact: null,
						fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
						fromChannel: event.message.peerId.channelId,
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
}

export async function saveWebPageMessage(event, prisma: PrismaClient) {
	await prisma.message
		.create({
			data: {
				messageType: messageTypes.messageWebPage,
				messageText: event.message.message || 'noText',
				entities: event.message.entities,
				messageMedia: true,
				webPage: event.message.media.webpage,
				attributesOfDocument: null,
				mediaPath: 'noPath',
				contact: null,
				fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
				fromChannel: event.message.peerId.channelId,
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
				entities: event.message.entities,
				messageMedia: true,
				attributesOfDocument: null,
				webPage: null,
				mediaPath: 'noPath',
				contact: event.message.media,
				fwdFrom: JSON.stringify(event.message.fwdFrom) || null,
				fromChannel: event.message.peerId.channelId,
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
