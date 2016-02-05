
export class Util {

    public static randomString(length: number = 8): string {
        var text = '';
        var allowedCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++)
            text += allowedCharacters.charAt(Math.floor(Math.random() * allowedCharacters.length));

        return text;
    }
}
