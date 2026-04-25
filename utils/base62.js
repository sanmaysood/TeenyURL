const BASE62 = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function encodeBase62(num) {
    if (num === 0) return "a";

    let result = "";

    while (num > 0) {
        result = BASE62[num % 62] + result;
        num = Math.floor(num / 62);
    }

    return result;
}

module.exports = encodeBase62;