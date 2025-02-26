import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs';
import random from 'random';
import { Api, client, TelegramClient } from 'telegram';
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

	fs.writeFileSync(`${process.env.MEDIA_PATH}/${fileName}.jpg`, buffer);
	console.log('Done downloading!');
}

export async function downloadDocument(
	event,
	client,
	fileName: string
): Promise<string> {
	const media = event.message.media;

	const buffer = await client.downloadMedia(media, {
		workers: 1,
	});
	const fileExtension = await fileTypeFromBuffer(buffer);
	fs.writeFileSync(
		`${process.env.MEDIA_PATH}/${fileName}.${fileExtension.ext}`,
		buffer
	);
	return fileExtension.ext;
}

export async function savePhotoOrVideoFromAlbum(message, client) {
	let fileName = uuidv4();
	if (message.media.className == 'MessageMediaPhoto') {
		const photo = message.photo;
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

		fs.writeFileSync(`${process.env.MEDIA_PATH}/${fileName}.jpg`, buffer);
		console.log('Done downloading!');
		fileName = `${fileName}.jpg`;
	} else if (message.media.className == 'MessageMediaDocument') {
		const media = message.media;

		const buffer = await client.downloadMedia(media, {
			workers: 1,
		});
		// const fileExtension = await fileTypeFromBuffer(buffer);
		fs.writeFileSync(`${process.env.MEDIA_PATH}/${fileName}.mp4}`, buffer);
		fileName = `${fileName}.mp4`;
	}
	console.log(fileName);
	return fileName;
}
