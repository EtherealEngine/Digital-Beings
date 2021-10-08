export function getRandomNumber(min, max): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const emptyResponse: string[] = [ 
    'Idk',
    'You tell me',
    'If you tell me, we will both know',
    'It\'s a secret',
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

export function emojiToUnicode(emoji) {
  const TEN_BITS = parseInt('1111111111', 2)
  
  function u(codeUnit) {
    return '\\u' + codeUnit.toString(16).toUpperCase();
  }

  if (emoji <= 0xFFFF) {
    return u(emoji);
  }

  emoji -= 0x10000;
  const leadSurrogate = 0xD800 + (emoji >> 10);
  var tailSurrogate = 0xDC00 + (emoji & TEN_BITS)
  return u(leadSurrogate) + u(tailSurrogate);
}