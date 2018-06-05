declare var window: any;
export function randomString(length: number = 8): string {
    let text = '';
    // we do not use I, J, O, 0 to avoid misinterpretations by humans
    const allowedCharacters = 'ABCDEFGHKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';

    if (typeof window !== 'undefined' && window.crypto) {
        let values = new Uint32Array(length);
        window.crypto.getRandomValues(values);
        for (let i = 0; i < length; i++) {
            text += allowedCharacters.charAt(values[i] % length);
        }
    } else {
        for (let i = 0; i < length; i++) {
            text += allowedCharacters.charAt(Math.floor(Math.random() * allowedCharacters.length));
        }
    }

    return text;
}