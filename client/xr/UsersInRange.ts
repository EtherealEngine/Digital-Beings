export const UsersInRange: { [user: string]: number } = {}
export const UsersInHarassmentRange: { [user: string]: number } = {}
export const UsersInIntimateRange: { [user: string]: number } = {}
export const UsersLookingAt: { [user: string]: number } = {}

export function isInRange(user: string): boolean {
    return UsersInRange[user] !== undefined || UsersInHarassmentRange[user] !== undefined || UsersInIntimateRange[user] !== undefined
}