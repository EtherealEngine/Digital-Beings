import { exec } from 'child_process'
import * as fs from 'fs'
import * as _path from 'path'

export async function generateVoice(text: string, callback: (buf, path: string) => void, deleteFile: boolean) {
    if (text === undefined || text === '') return

    const selfPath = process.cwd()
    const cmd = `tts --text \"${text}\" --model_name \"tts_models/en/ljspeech/tacotron2-DCA\" --vocoder_name \"vocoder_models/universal/libri-tts/fullband-melgan\" --out_path ${selfPath}`

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.log('error: ' + error.message)
            return
        }
        if (stderr) {
            console.log('stderr: ' + stderr)
        }
        
        //console.log('stdout: ' + stdout)
        let path: string = ''

        const lines: string[] = stdout.split('\n')
        for(let i = 0; i < lines.length; i++) {
            if (lines[i].includes('> Saving output to')) {
                path = lines[i].substring('> Saving output to '.length)
            }
        }

        if (path !== undefined && path !== '') {
            path = process.cwd() + '/' + path.replace(/^.*[\\\/]/, '')
            fs.stat(path, (err, stat) => {
                if (err == null) {
                    fs.open(path, 'r', (_err, fd) => {
                        if (_err) throw _err
                        const _buffer = []
                        var buffer  = Buffer.alloc(1)
                        while(true) {
                            const num = fs.readSync(fd, buffer, 0, 1, null)
                            if (num === 0)
                            break
                            _buffer.push(buffer[0])
                        }
        
                        callback(_buffer, path)
                        if (deleteFile)
                        fs.unlinkSync(path)
                    })
                }
            })
        }
    })
}