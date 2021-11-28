import { app } from "../webserver"
import { handleMessage } from "./message"

export const createMessengerClient = async () => {
  const token = process.env.MESSENGER_TOKEN
  const verify_token = process.env.MESSENGER_VERIFY_TOKEN
  
    if (!token || !verify_token) return console.warn("No API tokens for Messenger bot, skipping");

    app.get('/webhook', async function(req, res) {
        const VERIFY_TOKEN = verify_token
      
        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];
      
        console.log('get webhook - mode: ' + mode + ' - token: ' + token + ' challenge: ' + challenge + ' - ' + (VERIFY_TOKEN === token))
        if (mode && token) {
      
          if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
      
          } else {
            console.log('WEBHOOK_FORBIDDEN');
            res.sendStatus(403);
          }
        }
    });
    app.post('/webhook', async function(req, res) {
        let body = req.body;
      
        if (body.object === 'page') {
      
            await body.entry.forEach(async function(entry) {
      
            let webhookEvent = entry.messaging[0];
            console.log(webhookEvent);
      
            let senderPsid = webhookEvent.sender.id;
            console.log('Sender PSID: ' + senderPsid);
      
            if (webhookEvent.message) {
               await handleMessage(senderPsid, webhookEvent.message);
            }
          });
      
          res.status(200).send('EVENT_RECEIVED');
        } else {
      
          res.sendStatus(404);
        }
    });   
    console.log('facebook client created')
}