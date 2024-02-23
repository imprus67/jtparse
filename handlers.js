import fs from 'fs';
import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from 'uuid';
import sql from './db.js';
import * as bigintCryptoUtils from 'bigint-crypto-utils'

export async function download(event, buffer, currentMessage) {
   try {
     const file = await fileTypeFromBuffer(buffer);
     if (file?.ext) {
         let current = uuidv4();
         var dir = `./downloads/${currentMessage}`;
   
         if (!fs.existsSync(dir)){
             fs.mkdirSync(dir, { recursive: true });
         }
         // Define the output file name with the correct extension
         const outputFileName = `${dir}/${current}.${file.ext}`;
   
         // Create a write stream and save the image
         fs.createWriteStream(outputFileName).write(buffer);

         return outputFileName;

      } else {
         console.log('File type could not be reliably determined! The binary data may be malformed! No file saved!');
         console.log(event)
      }
   }
   catch (error) {
     console.log(error)
     console.log('Error in download')
   }
  
 }
 
export async  function downloadDocument(event, buffer, currentMessage) {
 
   try {
     
        // let file = await fileTypeFromBuffer(buffer);
        // let current = uuidv4();
        let filename = uuidv4();

         event.message.media.document.attributes?.map((obj) => {
              if (obj.fileName !== undefined) {

                filename = obj.fileName

              } 
              // else {
                
              //   filename = `${current}.${file.ext}`
              // }
            });

          
         var dir = `./downloads/${currentMessage}`;
   
         if (!fs.existsSync(dir)){
             fs.mkdirSync(dir, { recursive: true });
         }
         // Define the output file name with the correct extension
         const outputFileName = `${dir}/${filename}`;
   
         // Create a write stream and save the image
         fs.createWriteStream(outputFileName).write(buffer);
         return outputFileName;
      
   }
   catch (error) {
    console.log(error)
    console.log('Error in downloadDocument')
   }
  
 }

export function isLinks (event) {
   try {
     console.log('There are ', event.message.entities.length, ' urls in message')
     console.log(event.message.entities)
     let temp_array = [];
     for (const [key, value] of Object.entries(event.message.entities)) {
        
       console.log(value.url)
     }
   } catch (e) {
     console.log('No links in message')
   }
 
 }

export async function saveMessageToDB (
  message_text = 'noText', 
  entities = {},
  media = 'noMedia',
  grouped_id = 0,
  type_of_media = 'noMedia',
  document = 'noDocuments',
  date = new Date(),
  fwd_from = {},
  webpage = null,
  channel_sender = 111
    ) {

  let is_media = false;
  let is_grouped = false;
  let is_document = false;
  media != 'noMedia' ? is_media = true : is_media = false;
  grouped_id != 0 ? is_grouped = true : is_grouped = false;
  document != 'noDocuments' ? is_document = true : is_document = false;

  const message = await sql`
    insert into messages
      (message_text, entities, is_media, media, is_grouped, grouped_id, type_of_media, is_document, document, date, fwd_from, webpage, channel_sender)
    values
      (${message_text},
       ${entities},
       ${is_media},
       ${media},
       ${is_grouped},
       ${grouped_id},
       ${type_of_media},
       ${is_document},
       ${document},
       ${date},
       ${fwd_from},
       ${webpage},
       ${channel_sender})
    returning message_text, entities, is_media, media, is_grouped, grouped_id, type_of_media, is_document, document, date, fwd_from, webpage, channel_sender
  `
  
  return message
}
export async function downloadVoiceMessage(event, buffer, currentMessage) {
  try {
       
        let current = uuidv4();
        var dir = `./downloads/${currentMessage}`;
  
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        // Define the output file name with the correct extension
        const outputFileName = `${dir}/${current}.ogg`;
  
        // Create a write stream and save the image
        fs.createWriteStream(outputFileName).write(buffer);

        return outputFileName;

      
  }
  catch (error) {
    console.log(error)
    console.log('Error in downloadVoiceMessage')
  }
 
}

export async function sendMsg (client, peer = '2029370461', message = 'Hello there', Api) {
  
  (async function run() {
      
    const result = await client.invoke(
      new Api.messages.SendMessage({
        peer,
        message,
        randomId: bigintCryptoUtils.randBetween(2n ** 64n),
        noWebpage: true,
        noforwards: true,
        scheduleDate: 43,
      })
    );
    
  })();

}
export async function sendMsgWithMedia (client, msg) {
  await client.sendMessage("me", { message: "__Server is running__" });
}
export async function sendMsgWithMultiMedia (client, msg) {
  await client.sendMessage("me", { message: "__Server is running__" });
}
