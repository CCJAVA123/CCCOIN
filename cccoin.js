const sha256=require('crypto-js/sha256')
const ecLib=require('elliptic').ec
const ec=new ecLib('secp256k1')
class Transaction{
    constructor(from,to,amount,timestamp) {
        this.from=from
        this.to=to
        this.amount=amount
    }
    computehash(){
        return sha256(this.from+this.to+this.amount).toString()
    }
    sign(key){
    this.hexSignature=key.sign(this.computehash(),'base64').toDER('hex')
    }
    check(){
        const KeyObj=ec.keyFromPublic(this.from,'hex')
        return KeyObj.verify(this.computehash(),this.hexSignature)
    }
}
class block {
    constructor(transactions,ph) {
        this.ph = ph
        this.hash = this.computehash()
        this.nonce = 1
        this.transactions=transactions
        this.timestamp=Date.now()

    }

    getanswer(difficult) {
        let answer = ''
        for (let i = 0; i < difficult; i++) {
            answer += '0'
        }
        return answer;
    }

    wakuang(difficult) {
       console.log('本区块难度'+difficult)
        while (true) {
            console.log(this.hash)
            this.hash = this.computehash()
            if (this.hash.substring(0, difficult) !== this.getanswer(difficult)) {
                this.nonce++
                this.hash = this.computehash()
            } else {
                break;
            }
        }
        console.log('挖矿结束', this.hash)
        this.hash = this.hash
    }

    computehash() {
        return sha256(this.ph + JSON.stringify(this.transactions) +
            this.nonce+ this.timestamp).toString()
    }
}



class chain {

    difficultChange(){
        let o=Math.random()*10
        let j=o.toString()
        let u=j.substring(0,1)
        let b=parseInt(u)
        if(b===0){
            b+=2
        }
        return b
    }
    constructor() {
        this.chain = [this.gennsisblock()]
        this.difficult = this.difficultChange()
        this.transactionPool=[]
        if(this.difficult<2){
            this.minerReward=50
        }else if(2<=this.difficult<5){
            this.minerReward=100
        }else if(5<=this.difficult<8){
            this.minerReward=150
        }else if (8<=this.difficult){
            this.minerReward=200
        }
}   addTransaction(transaction){
        if(!transaction.check()){
        throw Error('transaction的amount被篡改')
        }
        this.transactionPool.push(transaction)
    }
    gennsisblock() {
        const gblock = new block('gennsisblock', '');
        return gblock
    }

    getlastblock() {
        return this.chain[this.chain.length - 1]
    }

    addblockstochain(block) {
        block.ph = this.getlastblock().hash
        block.wakuang(this.difficult)
        this.chain.push(block)

    }
    mineTransactionPool(minerRewardAddress){
        const minerRewardTransaction=new Transaction(
            '',
            minerRewardAddress,
            this.minerReware
        )
        this.transactionPool.push(minerRewardTransaction)
        const newBlock=new block(this.transactionPool,this.getlastblock().hash)
        newBlock.wakuang(this.difficult)
        this.chain.push(newBlock)
        this.transactionPool=[]
    }

    check(){
        if(this.chain.length===1){
            if(this.chain[0].hash!==this.chain[0].computehash()){
                console.log('区块链错误')
                return false
            }
            console.log('区块链正常')
            return true
        }
        for(let i=1;i<=this.chain.length-1;i++){
            const blockcheck=this.chain[i]
            if (blockcheck.hash!==blockcheck.computehash()){
                console.log('数据篡改')
                return false
            }
            const beforeblock=this.chain[i-1]
            if (blockcheck.ph!==beforeblock.hash){
                console.log('前后数据链断裂')
                return  false
            }else{
                return true
            }
        }
    }
}
const schain=new chain()
const ps=ec.genKeyPair()
const pr=ec.genKeyPair()
const t1=new Transaction(ps,pr,10)
t1.sign(ps)
// t1.amount=2   ，尝试篡改t1的amount，测试是否throw错误
schain.addTransaction(t1)
//激动人心的时候到了
console.log('奖金池：'+schain.minerReward.toString())
schain.mineTransactionPool('addr3')
console.log(schain)
console.log(t1)
console.log(t1.check())
    
