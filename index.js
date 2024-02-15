import "dotenv/config.js";
import fs from 'fs';
import os from 'os';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import input from "input"; // npm i input
import { download, downloadDocument, isLinks, saveMessageToDB } from "./handlers.js";
import { group } from "console";




const apiId = +process.env.API_ID;
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SESSION); // fill this later with the value from session.save()

(async () => {
  console.log("Loading interactive example...");
  console.log(chalk.bgBlue('Current os is: ', os.platform()))
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });
  console.log("You should now be connected.");

  await client.sendMessage("me", { message: "__Server is running__" });
//   console.log(client.session.save()); // Save this string to avoid logging in again
let previousGroupedIdMessage = '';
let currentGroupedIdMessage = '';

async function handler(event) {
    //Simple text without images, documents or videos and links
   //===============================================================================

    let entities,
    media,
    groupedId,
    typeOfMedia = 'noMedia',
    document,
    date = new Date(),
    channel_sender = event.message.peerId.channelId.value

    // Checking if media in message and that this media is not document
    if (event.message.media && !event.message.media?.document?.fileReference) {
      // Checkin type of media
      if (event.message.media?.document?.mimeType && event.message.media.document.mimeType.indexOf('video') != -1) {
        typeOfMedia = 'video'
      }
      
        let currentMessage =  '' + uuidv4();
        const buffer = await client.downloadMedia(event.message.media, {
            workers: 1,
        });

        media = await download(buffer, currentMessage);

    } else {

      media = 'noMedia';

    };

    //Checking if there are more then one media
    event.message.groupedId ? groupedId = event.message.groupedId : groupedId = 0;

    //Checking if there is document
    if ( event.message.media?.document?.fileReference ) {
      typeOfMedia = 'document';
      let currentMessage =  '' + uuidv4();
      let buffer = event.message.media.document.fileReference;
      document = await downloadDocument(event, buffer, currentMessage);
    } else {
      document = 'noDocuments'
    }

    event.message.entities ? entities = event.message.entities : entities = null;

    saveMessageToDB(
      event.message.message,
      entities,
      media,
      groupedId,
      typeOfMedia,
      document,
      date,
      channel_sender


      );
   //===============================================================================
//---------------------------------------------------------------------------------------------
    //   console.log(event);

    //   if (event.message.media == null) {
        
    //     try {
    //       saveMessageToDB(event.message.message, event.message.entities)
    //       console.log(chalk.bgBlue('Plain text: ', event.message.message));
    //       const sender = await event.message.entities;
    //       console.log(sender);

    //     } catch(e) {
    //       console.log(e)
    //     }
    //   }


    // // Message with text and just one photo
    // else if (event.message.media?.photo && !event.message.groupedId) {
    //   isLinks(event);
    //   console.log(chalk.bgBlue('Single image and text'));
    //   console.log(chalk.green(event.message?.message));


    //     let currentMessage =  '' + uuidv4();
    //     const buffer = await client.downloadMedia(event.message.media, {
    //         workers: 1,
    //     });

    //     download(buffer, currentMessage);
    // }


    // // Message with text and just one video
    // else if (event.message.media?.document?.mimeType && event.message.media.document.mimeType.indexOf('video') != -1 && !event.message.groupedId) {
    //   isLinks(event);
    //   console.log(chalk.bgBlue('Single video and text', event.message.media.document.mimeType));
    //   console.log(chalk.green(event.message?.message));


    //     let currentMessage =  '' + uuidv4();
    //     const buffer = await client.downloadMedia(event.message.media, {
    //         workers: 1,
    //     });

    //     download(buffer, currentMessage);
    // }


    // //Message with group of photo or video
    // else if (event.message.media && event.message.groupedId) {
    //   currentGroupedIdMessage = event.message.groupedId;
    //   if (currentGroupedIdMessage != previousGroupedIdMessage && event.message.message) {
    //     isLinks(event);
    //     console.log(chalk.green('Message: ', event.message?.message))
    //     previousGroupedIdMessage = currentGroupedIdMessage;
    //   } 

    //   console.log(chalk.bgCyan(event.message.groupedId))

      
    //   console.log(chalk.bgBlue('Group of images or videos'));
    //   // console.log(chalk.green(event.message?.message));

    //   let currentMessage =  event.message.groupedId.value;
    //   const buffer = await client.downloadMedia(event.message.media, {
    //       workers: 1,
    //   });
    //   download(buffer, currentMessage);
    // }


    // //Message with text and link
    // else if (event.message.media.webpage) {
    //   isLinks(event);
    //   console.log(chalk.bgBlue('Message with text and link'));
    //   console.log(chalk.green(event.message.message) + '/n/n/n');
    //   console.log(chalk.green(event.message.media.webpage.url));

    // }
    // // Voice message e.g. file ext is .ogg
    // else if (event.message.media.document?.mimeType == 'audio/ogg') {
    //   console.log(chalk.bgBlue('Voice message!'))

    //   let currentMessage =  '' + uuidv4();
    //   const buffer = await client.downloadMedia(event.message.media, {
    //       workers: 1,
    //   });

    //   download(buffer, currentMessage);
    // }
    // // Document in message:
    // else if (event.message.media.document) {
    //   console.log(event.message.media.document.attributes)
    //   let currentMessage =  '' + uuidv4();
    //     const buffer = await client.downloadMedia(event.message.media, {
    //         workers: 1,
    //     });

    //     downloadDocument(event, buffer, currentMessage);
    // }
    // else {
    //   isLinks(event);
    //   console.log(event.message.media.document)
    //   console.log(chalk.red('DO NOT FIND EXACT HANDLER!!!'))
    // }





    // else if (event.document) {
    //   console.log(chalk.blue('Document'))
    //   const buffer = event.document.fileReference;
    //   download(buffer, currentMessage);
    // }
    // else if (event.message.media?.webpage !== null && event.message.media?.webpage !== undefined) {
    //   console.log(chalk.blue(event.message.media.webpage))
    //   console.log(chalk.green(event))
    // }
//---------------------------------------------------------------------------------------------


  }

  client.addEventHandler(handler, new NewMessage({}));

})();