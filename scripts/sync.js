const { syncedHeight } = require('../src/utils')
const synchronize = require('../src/sync')

async function streamForever () {
 
  const from = await syncedHeight()
  const to = Number.POSITIVE_INFINITY
  synchronize(from, to)
}

module.exports = {
  streamForever
}
