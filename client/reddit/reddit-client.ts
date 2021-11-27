import * as snoowrap from 'snoowrap'
import { postgres } from '../postgres';
import { tcpClient } from '../tcpClient';
import { wasHandled } from './chatHistory';
import { redditHandler } from './redditHandler';
const SnooStream = require('snoostream');

export let reddit: snoowrap;

export const createRedditClient = async () => {
    const appId = process.env.REDDIT_APP_ID;
    const appSecredId = process.env.REDDIT_APP_SECRED_ID;
    const oauthToken = process.env.REDDIT_OATH_TOKEN;
    //https://github.com/not-an-aardvark/reddit-oauth-helper
    if (!appId || !appSecredId) return console.warn("No API token for Reddit bot, skipping");
    
    const snooWrapOpptions: snoowrap.ConfigOptions =  {
        continueAfterRatelimitError: true,
        requestDelay: 1100
    }

    reddit = new snoowrap({
        userAgent: 'test_db_app',
        clientId: appId,
        clientSecret: appSecredId,
        refreshToken: oauthToken
    });
    reddit.config(snooWrapOpptions);
    const stream = new SnooStream(reddit)
    new redditHandler(reddit)
    console.log('loaded reddit client')

    const regex = new RegExp('((?:carl|sagan)(?: |$))', 'ig')

    let commentStream = stream.commentStream('test_db')
    commentStream.on('post', async (post, match) => {
        let _match;
        if (post.hasOwnProperty('body')) {
            _match = post.body.match(regex);
        } else if (post.hasOwnProperty('selftext')) {
            _match = post.selftext.match(regex);
        }
    
        if (_match) {
            console.log('got new commend')// - ' + JSON.stringify(post))
            const id = post.id
            const chat_id = post.link_url.split('/')[6]
            const senderId = post.author_fullname
            const author = post.author.name
            const body = post.body
            const timestamp = post.created_utc
            tcpClient.getInstance.sendMessage(body, id, 'reddit', chat_id, timestamp, false, author, 'isPost') 
            const date = new Date(post.created)
            const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
        
            postgres.getInstance.addMessageInHistoryWithDate('reddit', chat_id, id, author, body, utcStr)
        } else {
            await postgres.getInstance.messageExistsAsyncWitHCallback2('reddit', post.link_url.split('/')[6], post.id, post.author.name, post.body, post.timestamp, () => {
                console.log('got new commend')// - ' + JSON.stringify(post))
                const id = post.id
                const chat_id = post.link_url.split('/')[6]
                const senderId = post.author_fullname
                const author = post.author
                const body = post.body
                const timestamp = post.created_utc
                tcpClient.getInstance.sendMessage(body, id, 'reddit', chat_id, timestamp, false, author, 'isPost') 
                const date = new Date(post.created)
                const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
                const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
            
                postgres.getInstance.addMessageInHistoryWithDate('reddit', chat_id, id, author, body, utcStr)
            })
        }
    });
    let submissionStream = stream.submissionStream('test_db', { regex: '((?:carl|sagan)(?: |$))' })
    submissionStream.on('post', async (post, match) => {
        let _match;
        if (post.hasOwnProperty('body')) {
            _match = post.body.match(regex);
        } else if (post.hasOwnProperty('selftext')) {
            _match = post.selftext.match(regex);
        }
        
        if (_match) {
            console.log('got new post' + JSON.stringify(post))
            const id = post.id
            const chat_id = post.id
            const senderId = post.author_fullname
            const author = post.author.name
            const body = post.selftext
            const timestamp = post.created_utc
            tcpClient.getInstance.sendMessage(body, id, 'reddit', id, timestamp, false, author, 'isPost') 
            const date = new Date(post.created)
            const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
        
            postgres.getInstance.addMessageInHistoryWithDate('reddit', chat_id, id, author, body, utcStr)
        } else {
            await postgres.getInstance.messageExistsAsyncWitHCallback2('reddit', post.id, post.id, post.author.name, post.body, post.timestamp, () => {
                console.log('got new post')// - ' + JSON.stringify(post))
                const id = post.id
                const chat_id = post.id
                const senderId = post.author_fullname
                const author = post.author
                const body = post.selftext
                const timestamp = post.created_utc
                tcpClient.getInstance.sendMessage(body, id, 'reddit', id, timestamp, false, author, 'isPost') 
                const date = new Date(post.created)
                const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
                const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
            
                postgres.getInstance.addMessageInHistoryWithDate('reddit', chat_id, id, author, body, utcStr)
            })
        }
    });

    setInterval(async () => {
        (await reddit.getInbox()).forEach(async (message: any) => {
            const id = message.name;
            const senderId = message.id;
            const author = message.author.name;
            const body = message.body;
            const timestamp = message.created_utc
            if (!author.includes('reddit')) {
                //console.log('current message: ' + body)
                await postgres.getInstance.messageExistsAsyncWitHCallback('reddit', senderId, id, author, body, timestamp, () => {
                    console.log('got new message: ' + body)
                    tcpClient.getInstance.sendMessage(body, id, 'reddit', senderId, timestamp, false, author, 'isChat')
                    const date = new Date(timestamp)
                    const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
                    const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
                
                    postgres.getInstance.addMessageInHistoryWithDate('reddit', id, id, author, body, utcStr)
                })
            }
        })
    }, 1000)
    /*submissionStream.on('post', async (post, match) => {
        console.log('22')
        console.log('submission stream: ' + JSON.stringify(await post))    
    });*/
    
    /*reddit.getSubreddit('test_db')
        .submitSelfpost({
            subredditName: 'test_db',
            title: 'test',
            text: 'test'
        })*/

    /*;(await reddit.getSubreddit('test_db').getTop().then()).forEach(post => {
        console.log(post.title)
    })
    reddit.getSubreddit('test_db').getNew().then(posts => {
        posts.forEach(post => console.log(post.title))
    })

    await (await reddit.getInbox()).forEach(post => {
        console.log(post.body)
    })*/

    /*;(await reddit.getHot()).map(post => {
        const date = new Date(post.created)
        const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
        console.log(utcStr)
    });

    console.log(reddit.getSubmission('2np694'))
    console.log('author: ' + (reddit.getSubmission('2np694').then(console.log)))
    reddit.getSubreddit('test_db').getModqueue({limit: -1}).then(console.log)*/
}