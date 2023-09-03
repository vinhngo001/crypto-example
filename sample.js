const crypto = require("crypto"), SHA256 = message => crypto.createHash("sha256").update(message).digest("hex");

class Block {
    constructor(timestamp = "", data = []) {
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = "";
        this.hash = this.getHash();
        this.nonce = 0;
    }

    getHash() {
        return SHA256(this.prevHash + JSON.stringify(this.data) + this.timestamp + this.nonce).toString();
    }

    mine(difficulty) {
        while (!this.hash.startsWith((Array(difficulty + 1).join("0")))) {
            this.nonce++;
            this.hash = this.getHash();
        }
    }
}

class BlockChain {
    constructor() {
        const newBlock = new Block()
        this.chain = [{...newBlock, prevHash: "0000"}];
        this.difficulty = 1;
        this.blockTime = 30000;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(block) {
        block.prevHash = this.getLastBlock().hash;
        block.hash = block.getHash();

        // console.log("Start mine");
        // console.time('Mining');
        // block.mine(this.difficulty);
        // console.timeEnd("mine");
        // console.log("end mine", block);

        // add new block
        this.chain.push(Object.freeze(block));
        // this.difficulty += Date.now() - parseInt(this.getLastBlock().timestamp) < this.blockTime ? 1 : -1;
    }

    isValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const prevBlock = this.chain[i - 1];
            if (currentBlock.hash !== currentBlock.getHash()) {
                return false;
            }

            if (currentBlock.prevHash !== prevBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

// New block chain
const vinhChain = new BlockChain();

const block = new Block(new Date(), {
    from: "nhanmai",
    to: "vinhngo",
    amount: 400
});
vinhChain.addBlock(block);

const block1 = new Block(new Date(), {
    from: "vinhngo",
    to: "leehuy",
    amount: 100
});
vinhChain.addBlock(block1);

const block2 = new Block(new Date(), {
    filmHeo: "githubzz.ccc"
})
vinhChain.addBlock(block2);

console.log(vinhChain);
console.log(">>>>>>>>>Valid chain: ",vinhChain.isValid());

vinhChain.chain[1].data = {
    from: "A bú",
    to: "Yua Mikami",
    amount: 1000
}
vinhChain.chain[1].hash = vinhChain.chain[1].getHash()

console.log(vinhChain);
console.log(">>>>>>>>>>Valid chain: ",vinhChain.isValid());