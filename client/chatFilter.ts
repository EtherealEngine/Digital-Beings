import { postgres } from './postgres'
const OpenAI = require('openai-api')

export async function toxicityTest(text) {
    const label_options = ['0', '1', '2']
    const openai = new OpenAI(process.env.OPENAI_API_KEY)
    let output_label = null
    // This is the probability at which we evaluate that a '2' is likely real
    // vs. should be discarded as a false positive
    const toxic_threshold = -0.355
    // Get OpenAI response
    const gptResponse = await openai.complete({
        engine: 'content-filter-alpha',
        prompt: `<|endoftext|>${text}\n--\nLabel:`,
        temperature: 0,
        maxTokens: 1,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        logprobs: 10
    })
    // Get an output label value
    output_label = gptResponse.data['choices'][0]['text']
    // Fix the label using logprobs if needed
    if (output_label == '2') {
        // If the model returns "2", return its confidence in 2 or other output-labels
        let logprobs = gptResponse.data['choices'][0]['logprobs']['top_logprobs'][0]
        // If the model is not sufficiently confident in '2',
        // choose the most probable of '0' or '1'
        // Guaranteed to have a confidence for 2 since this was the selected token.
        if (logprobs['2'] < toxic_threshold) {
            let logprob_0 = '0' in logprobs ? logprobs['0'] : null
            let logprob_1 = '1' in logprobs ? logprobs['1'] : null
            // If both '0' and '1' have probabilities, set the output label
            // to whichever is most probable
            if (logprob_0 !== null && logprob_1 !== null) {
                if (logprob_0 >= logprob_1) {
                    output_label = '0'
                } else {
                    output_label = '1'
                }
            }
            else if (logprob_0 !== null) {
                // If only one of them is found, set output label to that one
                output_label = '0'
            }
            else if (logprob_1 !== null) {
                output_label = '1'
            }
            // If neither '0' or '1' are available, stick with '2'
            // by leaving output_label unchanged.
        }
    }
    // If the most probable token is none of '0', '1', or '2'
    // this should be set as unsafe.
    if (!label_options.includes(output_label)) {
        output_label = '2'
    }
    return parseInt(output_label, 10)
}

export class chatFilter {
    static getInstance: chatFilter

    userHistory: {user: string, client: string, rating: number, _timeout: any}[] = []

    half: number = 5
    max: number = 10
    badWords: { word: string, rating: number }[] = []

    constructor(half: number, max: number, badWords: { word: string, rating: number }[]) {
        chatFilter.getInstance = this
        this.half = half
        this.max = max
        this.badWords = badWords
        console.log('loaded ' + this.badWords.length + ' bad words, half: ' + half + ' max: ' + max)
        setInterval(() => {
            postgres.getInstance.getChatFilterData(false)
        }, 60000)
    }

    update(half: number, max: number, badWords: { word: string, rating: number }[]) {
        this.half = half
        this.max = max
        this.badWords = badWords
    }

    collectObscenities(text: string, user: string): string[] {
        let rating = 0
        const words: string[] = []
        const _text = text.toLowerCase()

        for(let i = 0; i < this.badWords.length; i++) {
            if (_text.includes(this.badWords[i].word.toLowerCase())) {
                rating += this.badWords[i].rating
                words.push(this.badWords[i].word)
            }
        }

        return words
    }

    handleObscenities(message, client: string, rating: number, rating5: Function, rating10: Function) {
        let user = message.author.id
        console.log('handle bad word, new rating: ' + rating)
        for(let i = 0; i < this.userHistory.length; i++) {
            if (this.userHistory[i].user === user && this.userHistory[i].client === client) {
                const old = this.userHistory[i].rating
                this.userHistory[i].rating += rating
                console.log(old + ' - ' + this.userHistory[i].rating + ' - ' + rating)
                if (this.userHistory[i]._timeout !== undefined) clearTimeout(this.userHistory[i]._timeout)
                this.userHistory[i]._timeout = setTimeout(() => { 
                    for(let i = 0; i < this.userHistory.length; i++) {
                        if (this.userHistory[i].user === user && this.userHistory[i].client === client) {
                            console.log('clearing user')
                            this.userHistory.splice(i, 1)
                            break
                        }
                    }
                 }, 72000)

                if (this.userHistory[i].rating >= this.half && this.userHistory[i].rating < this.max) {
                    rating5(user, this.userHistory[i].rating);
                }
                else if (this.userHistory[i].rating >= this.max) {
                    rating10(message, user, this.userHistory[i].rating)
                    if (this.userHistory[i]._timeout !== undefined) clearTimeout(this.userHistory[i]._timeout)
                }

                return
            }
        }

        if (rating >= this.half && rating < this.max) {
            rating5(user, rating)
        }
        else if (rating >= this.max) {
            rating10(user, rating)
            return
        }

        this.userHistory.push({
            user: user,
            client: client,
            rating: rating,
            _timeout: setTimeout(() => { 
                for(let i = 0; i < this.userHistory.length; i++) {
                    if (this.userHistory[i].user === user&& this.userHistory[i].client === client) {
                        console.log('clearing user 2')
                        this.userHistory.splice(i, 1)
                        break
                    }
                }
             }, 72000)
        });
    }
}