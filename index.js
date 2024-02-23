import "dotenv/config.js";
import fs from 'fs';
import os from 'os';
import chalk from 'chalk';
import { v4 as uuidv4 } from 'uuid';
import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import input from "input"; // npm i input
import { download, 
  downloadDocument, 
  saveMessageToDB, 
  downloadVoiceMessage,
  sendMsg } from "./handlers.js";
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
   //MessageMediaWebPage?
   //===============================================================================

    let entities,
    media,
    groupedId,
    typeOfMedia = 'noMedia',
    document,
    date = new Date(),
    fwdFrom = null,
    webpage = null,
    channel_sender = event.message.peerId.channelId.value,
    peer = '2029370461'

    //Checking if there is only text

    // if (event.message.media === null ) {
    //   await sendMsg(client, peer, event.message.message, Api)
    // }

    // Checking if this is poll

    if (event.message.media?.className === 'MessageMediaPoll') {
      console.log(chalk.bgGreenBright('Poll'))
    }

    // Checking if there is a webpage object
    if (event.message.media?.className == 'MessageMediaWebPage') {
      webpage = event.message.media?.webpage;
      typeOfMedia = 'MessageMediaWebPage'
    }

    // Checking if media in message and that this media is not document

    if (event.message.media && 
      !event.message.media.document?.fileReference &&
      event.message.media?.className !== 'MessageMediaPoll' &&
      event.message.media?.className !== 'MessageMediaWebPage') {

      typeOfMedia = event.message.media?.className;
      
      if (event.message.media?.document?.mimeType && event.message.media.document.mimeType.indexOf('video') != -1) {
        typeOfMedia = 'video';
      }
      
        let currentMessage =  '' + uuidv4();
        const buffer = await client.downloadMedia(event.message.media, {
            workers: 1,
        });

        media = await download(event, buffer, currentMessage);

    }

    //Checking if there are more then one media

    event.message.groupedId ? groupedId = event.message.groupedId : groupedId = 0;

    //Checking if there is document

    if ( event.message.media?.document?.fileReference && 
          event.message.media?.className !== 'MessageMediaPoll') {

      typeOfMedia = 'document';
      let currentMessage =  '' + uuidv4();
      let buffer = await client.downloadMedia(event.message.media, {
            workers: 1,
        });

      // If this is voice message

      if (event.message.media.document.mimeType === 'audio/ogg') {
        typeOfMedia = 'voice_message';
        document = await downloadVoiceMessage(event, buffer, currentMessage);
        event.message.entities ? entities = event.message.entities : entities = null;
        
      } 
      else if (event.message.media?.document?.mimeType && event.message.media.document.mimeType.indexOf('video') != -1) {
        typeOfMedia = 'video';
        document = await download(event, buffer, currentMessage);
      } else {      
        buffer = event.message.media.document.fileReference;
        document = await downloadDocument(event, buffer, currentMessage);

      }



    } else {
      document = 'noDocuments'
    }

    event.message.entities ? entities = event.message.entities : entities = null;
    event.message.fwdFrom ? fwdFrom = event.message.fwdFrom : fwdFrom = null;

    saveMessageToDB(
      event.message.message,
      entities,
      media,
      groupedId,
      typeOfMedia,
      document,
      date,
      fwdFrom,
      webpage,
      channel_sender


      );
    
   if (event.message.media?.className) {
    console.log(event.message?.media?.className  )
   } else {
    console.log('With no media')
    console.log(event)
   }

  //=========================================================================
  
  }

  client.addEventHandler(handler, new NewMessage({}));

})();