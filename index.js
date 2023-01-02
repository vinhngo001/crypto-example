const hash = require("crypto-js/sha256");
class Block {
    constructor(prevHash, data) {
        this.prevHash = prevHash;
        this.data = data;
        this.timestamp = new Date();
        this.hash = this.caculateHash();
        this.minVar = 0;
    }
    caculateHash() {
        return hash(this.prevHash + JSON.stringify(this.data) + this.timestamp + this.minVar).toString()
    }

    mine(difficulty) {
        while (!this.hash.startsWith('0'.repeat(difficulty))) {
            this.minVar++;
            this.hash = this.caculateHash();
        }
    }
}

class BlockChain {
    constructor(difficulty) {

        const genesisBlock = new Block('0000', {
            isGenesis: true
        });
        this.difficulty = difficulty;
        this.chain = [genesisBlock];
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(data) {
        const lastBlock = this.getLastBlock();
        const newBlock = new Block(lastBlock.hash, data);

        console.log("Start mining");
        console.time("mining");
        newBlock.mine(this.difficulty);
        console.timeEnd('mine');
        console.log("end mining", newBlock);

        this.chain.push(newBlock);
    }

    isValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const prevBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.caculateHash()) {
                return false;
            }

            if (currentBlock.prevHash !== prevBlock.hash) {
                console.log({ currentBlock })
                console.log({ prevBlock })
                return false;
            }
        }
        return true;
    }
}

const wibuChain = new BlockChain(5);
console.log(wibuChain);

wibuChain.addBlock({
    from: "Wibu",
    to: "Koo koo",
    amount: 400
});

wibuChain.addBlock({
    from: "Wibu",
    to: "Vigga",
    amount: 100
});

// wibuChain.addBlock({
//     filmHelo: 'gitbuz.cc'
// });

// console.log(wibuChain.chain);
// console.log("Chain valid", wibuChain.isValid())