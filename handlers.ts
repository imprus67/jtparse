import { messageTypes } from './types/messagetypes';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import random from 'random';
import { Api, TelegramClient } from 'telegram';
import { NewMessageEvent } from 'telegram/events';
import { v4 as uuidv4 } from 'uuid';

// const prisma = new PrismaClient();
export async function sendMessageCustom(client, peer: string, message: string) {
	await client.connect(); // This assumes you have already authenticated with .start()

	const result: Api.Updates = await client.invoke(
		new Api.messages.SendMessage({
			peer,
			message,
			randomId: random.int(1, 9999999999999),
			noWebpage: true,
			noforwards: true,
			scheduleDate: 43,
			sendAs: peer,
		})
	);
	console.log(result); // prints the result
}

export async function downloadPhoto(event, client: TelegramClient) {
	const photo = event.message.photo;
	const buffer = await client.downloadFile(
		new Api.InputPhotoFileLocation({
			id: photo.id,
			accessHash: photo.accessHash,
			fileReference: photo.fileReference,
			thumbSize: 'y',
		}),
		{
			dcId: photo.dcId,
			//fileSize: "y",
		}
	);

	fs.writeFileSync(uuidv4() + '.jpg', buffer);
}

export async function saveTextMessage(
	event: NewMessageEvent,
	prisma: PrismaClient
) {
	await prisma.message
		.create({
			data: {
				messageType: messageTypes.messageText,
				messageText: event.message.message,
				messageMedia: false,
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
	event: NewMessageEvent,
	prisma: PrismaClient
) {
	await prisma.message
		.create({
			data: {
				messageType: messageTypes.messagePhoto,
				messageText: event.message.message || 'noText',
				messageMedia: true,
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
