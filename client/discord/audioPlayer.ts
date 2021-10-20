import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, EndBehaviorType, entersState, joinVoiceChannel, VoiceConnection, VoiceConnectionStatus, VoiceReceiver } from "@discordjs/voice";
import { createDiscordJSAdapter } from "./adapter";
import * as fs from 'fs'
import { createWriteStream } from "fs";
import { pipeline } from "stream";
import { opus } from "prism-media";
const { exec } = require("child_process");

export function _createAudioPlayer(): AudioPlayer {
    return createAudioPlayer()
}

export async function playAudio(audioPlayer: AudioPlayer, resource) {
    if (audioPlayer === null || audioPlayer === undefined ||
        resource === null || resource === undefined) return

    await audioPlayer.play(resource)
    await entersState(audioPlayer, AudioPlayerStatus.Playing, 5e3)
}

export async function connectToVoiceChannel(channel): Promise<VoiceConnection> {
    if (channel === null || channel === undefined) return

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        selfMute: false,
        selfDeaf: false,
        adapterCreator: createDiscordJSAdapter(channel)
    });

    try {
        await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
        return connection
    } catch (error) {
        connection.destroy();
        console.log(error);
    }
}

export async function createListeningStream(receiver: VoiceReceiver, userId: string) {
    const opusStream = await receiver.subscribe(userId, {
		end: {
			behavior: EndBehaviorType.AfterSilence,
			duration: 100,
		},
	});

	const oggStream = await new opus.OggLogicalBitstream({
		opusHead: new opus.OpusHead({
			channelCount: 2,
			sampleRate: 48000,
		}),
		pageSizeControl: {
			maxPackets: 10,
		},
	});

	const filename = `./recordings/${Date.now()}.ogg`;

	const out = await createWriteStream(filename);

	console.log(`👂 Started recording ${filename}`);

	await pipeline(opusStream, oggStream, out, (err) => {
		if (err) {
			console.warn(`❌ Error recording file ${filename} - ${err.message}`);
		} else {
			console.log(`✅ Recorded ${filename}`);
		}
	});
    /*console.log('creating stream')
    const buffer = []
    const stream = receiver.subscribe(userId, {
        end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: 1000
        }
    })
    //const rawAudio = stream.pipe(new opus.Decoder({ frameSize: 960, channels: 2, rate: 48000 }));
    console.log('created stream')
    
    stream.pipe(fs.createWriteStream('ss.opus'))
    stream.on('close', async () => {
        const _buffer = Buffer.concat(buffer)
        console.log('stream closed')
        const base64 = _buffer.toString('base64')
        
        const cmd = 'ffmpeg -i ss.opus song.wav';
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
        //console.log(base64);
    });
    stream.on('data', (data) => {
        buffer.push(data)
    });*/
}
