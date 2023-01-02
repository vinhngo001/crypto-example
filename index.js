const hash = require("crypto-js/sha256");
class Block {
    constructor(prevHash, data) {
        this.prevHash = prevHash;
        this.data = data;
        this.timestamp = new Date();
        this.hash = this.caculateHash();
    }
    caculateHash(){
        return hash(this.prevHash + JSON.stringify(this.data) + this.timestamp)
    }
}

const block = new Block(prevHash='', data={
    hello: 'Coders Tokyo'
});

console.log(block)