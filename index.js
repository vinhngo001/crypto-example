const hash = require("crypto-js/sha256");
class Block {
    constructor(prevHash, data) {
        this.prevHash = prevHash;
        this.data = data;
        this.timestamp = new Date();
        this.hash = this.caculateHash();
    }
    caculateHash() {
        return hash(this.prevHash + JSON.stringify(this.data) + this.timestamp).toString()
    }
}

class BlockChain {
    constructor() {

        const genesisBlock = new Block('0000', {
            isGenesis: true
        });
        this.chain = [genesisBlock];
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data) {
        const lastBlock = this.getLastBlock();
        const newBlock = new Block(lastBlock.hash, data)
        this.chain.push(...this.chain, newBlock);
    }
}

const wibuChain = new BlockChain();
wibuChain.addBlock({
    from: "Wibu",
    to: "Koo koo",
    amount: 400
});

wibuChain.addBlock({
    from :"Wibu",
    to: "Vigga",
    amount: 100
});

console.log(wibuChain.chain);