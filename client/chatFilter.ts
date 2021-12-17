import { postgres } from './postgres'

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

    isBadWord(text: string, user: string, client: string, rating5: Function, rating10: Function): string[] {
        let rating = 0
        const words: string[] = []
        const _text = text.toLowerCase()

        for(let i = 0; i < this.badWords.length; i++) {
            if (_text.includes(this.badWords[i].word.toLowerCase())) {
                rating += this.badWords[i].rating
                words.push(this.badWords[i].word)
            }
        }

        if (rating > 0) this.handleBadWord(user, client, rating, rating5, rating10)
        return words
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

                if (this.userHistory[i].rating >= this.half && this.userHistory[i].rating < this.max) {
                    rating5(user, this.userHistory[i].rating);
                }
                else if (this.userHistory[i].rating >= this.max) {
                    rating10(user, this.userHistory[i].rating)
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