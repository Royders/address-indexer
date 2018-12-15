const BigNumber = require('bignumber.js')
const lexint = require('lexicographic-integer-encoding')('hex')

const blockStructure = {
  keyEncoding: lexint,
  valueEncoding: {
    buffer: false,
    type: 'Block',
    encode: (data) => {
      return `${data.time}:${data.hash}`
    },
    decode: (data) => {
      const [time, hash] = data.split(':')
      return { time, hash }
    }
  }
}
const utxStructure = {
  blockSize: 8 * 4096, // default: 4096, max: 121000 ~ 30 * 4096
  cacheSize: 8 * 1024 * 1024, // 8 MB
  writeBufferSize: 1 * 1024 * 1024 * 1024, // 256MB // default: 4 * 1024 * 1024
  maxFileSize: 100 * 1024 * 1024, // default: 2 * 1024 * 1024
  maxOpenFiles: 500, // default: 1000, but we'll run 2x level instances
  keyEncoding: {
    buffer: false,
    type: 'OutputTempKey',
    encode: (data) => {
    // console.log("encode" + data)
      return `${data.txid}:${data.index}`
    },
    decode: (data) => {
      // console.log("decode" + data)
      const [txid, index] = data.split(':')
      return { txid, index }
    }
  },
  valueEncoding: {
    buffer: false,
    type: 'OutputTempValue',
    encode: (data) => {
      return `${data.amount}:${data.height}:${data.time}:${data.address}`
    },
    decode: (data) => {
      const [amount, height, time, address] = data.split(':')
      return { amount: new BigNumber(amount), height, time, address }
    }
  }
}
const addressStructure = {
  blockSize: 8 * 4096, // default: 4096, max: 121000 ~ 30 * 4096
  cacheSize: 8 * 1024 * 1024, // 8 MB
  writeBufferSize: 1 * 1024 * 1024 * 1024, // 256MB // default: 4 * 1024 * 1024
  maxFileSize: 100 * 1024 * 1024, // default: 2 * 1024 * 1024
  maxOpenFiles: 500, // default: 1000, but we'll run 2x level instances
  keyEncoding: {
    buffer: false,
    type: 'AddressKey',
    encode: (data) => {
      return `${data.address}:${lexint.encode(data.height)}:${data.time}:${data.txid}:${data.index}:${data.type}`
    },
    decode: (data) => {
      const [address, height, time, txid, index, type] = data.split(':')
      return { address, height: lexint.decode(height), time, txid, index, type }
    }
  },

  // amount: check.amount, txid: txid, index: index, height: height, id: 's' }
  valueEncoding: {
    buffer: false,
    type: 'AddressValue',
    encode: (data) => {
      // console.log(data)
      if (data.type === 's') {
        return `${data.amount}:${data.txid}:${data.index}:${data.height}:${data.time}`
      } else {
        return `${data.amount}`
      }
    },
    decode: (data) => {
      const [amount,txid, index, height, time] = data.split(':')
      if (txid) {
        
        return { amount: new BigNumber(amount), txid, index, height, time }
      } else {
        return { amount: new BigNumber(amount)}
      }
    }
  }
}
module.exports = {
  blockStructure, addressStructure, utxStructure
}
