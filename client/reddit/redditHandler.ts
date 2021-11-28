import snoowrap = require("snoowrap");
import { postgres } from "../postgres";
import { reddit } from "./reddit-client";

export class redditHandler {
    static getInstance: redditHandler
    reddit: snoowrap;

    constructor(reddit: snoowrap) {
        redditHandler.getInstance = this
        this.reddit = reddit
    }

    async handleMessage(responses, messageId, chat_id, args) {
        Object.keys(responses).map(function(key, index) {
            if (args === 'isChat') {
                redditHandler.getInstance.reddit.getMessage(messageId).reply(responses[key]).then(res => {
                    postgres.getInstance.addMessageInHistory('reddit', chat_id, res.id, process.env.BOT_NAME, responses[key])
                })
            } else if (args === 'isPost') {
                reddit.getSubmission(chat_id).reply(responses[key]).then(res => {
                    postgres.getInstance.addMessageInHistory('reddit', chat_id, res.id, process.env.BOT_NAME, responses[key])
                })
            }
        })
    }
}