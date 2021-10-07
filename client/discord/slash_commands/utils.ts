import { addMessageToHistory } from "../chatHistory"

export async function sendSlashCommandResponse(client, interaction, chat_id, text) {
    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                content: text
            }
        }
    }).then(() => { 
        addMessageToHistory(chat_id, interaction.id, process.env.BOT_NAME, text)
    }).catch(console.error)
}