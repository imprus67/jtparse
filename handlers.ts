import { messageTypes } from './types/messagetypes';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import random from 'random';
import { Api, TelegramClient } from 'telegram';
import { v4 as uuidv4 } from 'uuid';

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

export async function downloadPhoto(
	event,
	client: TelegramClient,
	fileName: string
) {
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

	fs.writeFileSync(`./media/${fileName}.jpg`, buffer);
	console.log('Done downloading!');
}

export async function saveTextMessage(event, prisma: PrismaClient) {
	await prisma.message
		.create({
			data: {
				messageType: messageTypes.messageText,
				messageText: event.message.message,
				messageMedia: false,
				mediaPath: 'null',
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
