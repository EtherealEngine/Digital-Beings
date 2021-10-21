import * as fs from 'fs'

export class chatFilter {
    static getInstance: chatFilter

    userHistory: {user: string, client: string, rating: number, _timeout: any}[] = []

    badWords: { word: string, rating: number }[] = []

    constructor() {
        chatFilter.getInstance = this
        const data = fs.readFileSync('bad_words.txt', 'utf-8')
        const lines = data.split('\n')
        for(let i = 0; i < lines.length; i++) {
            const d = lines[i].split('=')
            if (d.length == 2) {
                const word = d[0].trim()
                const rating = parseInt(d[1].trim())
                this.badWords.push({ word: word, rating: rating })
            }
        }
        console.log('loaded ' + this.badWords.length + ' bad words')
    }

    isBadWord(text: string, user: string, client: string, rating5: Function, rating10: Function): boolean {
        let rating = 0
        const _text = text.toLowerCase()

        for(let i = 0; i < this.badWords.length; i++) {
            if (_text.includes(this.badWords[i].word.toLowerCase())) {
                rating += this.badWords[i].rating
            }
        }

        if (rating > 0) this.handleBadWord(user, client, rating, rating5, rating10)
        return rating > 0
    }
    handleBadWord(user: string, client: string, rating: number, rating5: Function, rating10: Function) {
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

                if (this.userHistory[i].rating >= 5 && this.userHistory[i].rating < 10) {
                    rating5(user, this.userHistory[i].rating);
                }
                else if (this.userHistory[i].rating >= 10) {
                    rating10(user, this.userHistory[i].rating)
                    if (this.userHistory[i]._timeout !== undefined) clearTimeout(this.userHistory[i]._timeout)
                }

                return
            }
        }


        if (rating >= 5 && rating < 10) {
            rating5(user, rating)
        }
        else if (rating >= 10) {
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