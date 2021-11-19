import Bluebird = require('bluebird');
import { IgApiClient, IgLoginTwoFactorRequiredError } from 'instagram-private-api';
import { sample } from 'lodash';
import { postgres } from '../postgres';
import { tcpClient } from '../tcpClient';
import { instagramPacketHandler } from './instagramPacketHandler';

export const createInstagramClient = async () => {
    const username = process.env.IG_USERNAME
    const password = process.env.IG_PASSWORD
    if (!username || !password) return console.warn("No Instagram credentials found, skipping");

    const ig = new IgApiClient()
    ig.state.generateDevice(username);

    await ig.simulate.preLoginFlow()
    const loggedInUser = await ig.account.login(username, password)
    process.nextTick(async () => await ig.simulate.postLoginFlow())
    
    new instagramPacketHandler(ig)

    const history = { 
        pending: await ig.feed.directInbox().items(),
        unread:[]
    }

    for (var idx in history.pending) {
        let pending = history.pending[idx]
        if (pending.last_permanent_item.item_type === 'text') {
            await postgres.getInstance.messageExists('instagram', 
                pending.thread_id, 
                pending.last_permanent_item.item_id + '',
                pending.last_permanent_item.user_id === loggedInUser.pk ? process.env.BOT_NAME : pending.thread_title,
                pending.last_permanent_item.text, 
                parseInt(pending.last_permanent_item.timestamp) / 1000)
        }
    }

    setInterval(async () => {
        const inbox = { 
            pending: await ig.feed.directInbox().items()
        }

        for (var idx in inbox.pending) {
            let pending = inbox.pending[idx]
            if (pending.last_permanent_item.item_type === 'text') {
                if (pending.last_permanent_item.user_id === loggedInUser.pk) {
                    await postgres.getInstance.messageExists('instagram', 
                        pending.thread_id, 
                        pending.last_permanent_item.item_id + '',
                        pending.last_permanent_item.user_id === loggedInUser.pk ? process.env.BOT_NAME : pending.thread_title,
                        pending.last_permanent_item.text, 
                        parseInt(pending.last_permanent_item.timestamp) / 1000)

                    continue
                }

                await postgres.getInstance.messageExistsAsyncWitHCallback('instgram', 
                    pending.thread_id,
                    pending.last_permanent_item.item_id + '',
                    pending.users[0].username, 
                    pending.last_permanent_item.text, 
                    parseInt(pending.last_permanent_item.timestamp), () => {
                        const timestamp = parseInt(pending.last_permanent_item.timestamp)
                        var date = new Date(timestamp / 1000);
                        const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
                        const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
            
                        console.log('got new message: ' + pending.last_permanent_item.text)
                        tcpClient.getInstance.sendMessage(pending.last_permanent_item.text,
                            pending.last_permanent_item.item_id + '', 
                            'instagram',
                            pending.thread_id, 
                            utcStr, 
                            false, 
                            pending.users[0].username)
                    
                        postgres.getInstance.addMessageInHistoryWithDate('instagram',
                            pending.thread_id, 
                            pending.last_permanent_item.item_id + '', 
                            pending.users[0].username, 
                            pending.last_permanent_item.text, 
                            utcStr)
                    })
            }
        }
    }, 5000)
}