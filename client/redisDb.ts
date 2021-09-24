import { Tedis } from 'tedis'

export class redisDb {
    tedis: Tedis = undefined

    async create() {
        this.tedis = new Tedis()
    }

    async setValue(key: string, value: any) {
        if (await this.hasKey(key)) return
        if (typeof value === 'object') value = JSON.stringify(value)
        await this.tedis.set(key, value)
    }
    async getValue(key: string) {
        if (await this.hasKey(key)) return await this.tedis.get(key)
        else return undefined
    }
    async deleteKey(key: string) {
        if (await this.hasKey(key))
        await this.tedis.del(key)
    }

    async hasKey(key: string) {
        return await this.tedis.exists(key)
    }
}