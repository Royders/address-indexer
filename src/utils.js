const { dbblocks } = require('./leveldb_config')

const utils = {

  syncedHeight: () => {

    return new Promise(async (resolve) => {
      dbblocks.createReadStream({
        reverse: true,
        limit: 1
      }).on('data', ({ key: height }) => {
        resolve(height + 1)
      })
        .on('close', function () {
          resolve(0)
        })
    })
  }
}

module.exports = utils
