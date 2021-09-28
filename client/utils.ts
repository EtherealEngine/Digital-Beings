export function getRandomNumber(min, max): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const emptyResponse: string[] = [ 
    'Idk',
    'You tell me',
    'If you tell me, we will both know',
    'It\'s a sectret',
    'Some things you should figure by your self',
    'No you',
    'I don\'n know'
]
export function getRandomEmptyResponse(): string {
  return emptyResponse[getRandomNumber(0, emptyResponse.length - 1)]
}

export function startsWithCapital(word){
  return word.charAt(0) === word.charAt(0).toUpperCase()
}