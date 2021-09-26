import { exec } from "child_process"

export async function speechToText(file: string, callback: (res: string) => void) {
    const selfPath = process.cwd()
    const cmd = "deepspeech --model deepspeech-0.9.3-models.pbmm --scorer deepspeech-0.9.3-models.scorer --audio test.wav"// " + file

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.log('error: ' + error.message)
            return
        }
        if (stderr) {
            console.log('stderr: ' + stderr)
        }
        
        callback(stdout)
    })
}