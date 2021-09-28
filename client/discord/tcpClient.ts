import * as net from 'net'
import { client } from './discord-client'

let tcpClient: net.Socket

export function initClient(ip, port) {
    if (process.env.LOAD_DISCORD_LOGGER === 'True') {
        console.log('connecting')
        tcpClient = new net.Socket()
        tcpClient.connect(port, ip, function() {
            console.log('connected')
        })
        tcpClient.on('data', function(data) {
            if (client !== undefined && client.log_user !== undefined) {
                client.log_user.send('log: ' + data)
            }
        })
    }
}