import { IgApiClient } from "instagram-private-api";

export class instagramPacketHandler {
    static getInstance: instagramPacketHandler
    ig: IgApiClient

    constructor(ig: IgApiClient) {
        instagramPacketHandler.getInstance = this
        this.ig = ig
    }

    async handle(chatId, responses) {
        Object.keys(responses).map(async function(key, index) {
            const thread = instagramPacketHandler.getInstance.ig.entity.directThread(chatId)
            await thread.broadcastText(responses[key])
        })
    }
}