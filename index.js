const hash = require("crypto-js/sha256");
class Block {
    constructor(prevHash, data) {
        this.prevHash = prevHash;
        this.data = data;
        this.timestamp = new Date();
        this.hash = '';
    }
}