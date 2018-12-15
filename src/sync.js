const client = require('./client')
const { Transform } = require('stream')
const { dbblocks, dbutx, dbaddress } = require('./leveldb_config')

async function synchronize (from, to) {
  let nodeHeight = await client.height()


  //  call syncedHeight method to get the last inserted block to dbBlocks
  // console.log(`Start syncing from Block #${from}`)
  // Use the value and pass it into the range stream as the "from" parameter
  client.blockStream(from, to, 7, 2)
  // pipe the readstream through a Transformstream to create a write Stream
    .pipe(new Transform({
      // we are working with object and not bits
      objectMode: true,
      // here comes the transforming part
      transform: async ({ height, time, hash, tx, nTx }, encoding, next) => {

        try {
          const outPutTempBatch = dbutx.batch()
          const addressBatch = dbaddress.batch()
          for (const { txid, vout } of tx) {
            // Start to loop over the Outputs first - because not Input without Output
            for (const [index, output] of vout.entries()) {
              const address = output.scriptPubKey.addresses
              const amount = output.value
              // store the Information about the unspend output into the "temp-db"
              // will need that later to retrieve the amougit punt and the address
              outPutTempBatch.put({ txid, index }, { amount, height, time, address })
              // increase the total balance of an address
              addressBatch.put({ address, height: height, time, txid, index, type: "r" }, { amount: amount })
            }
          }
          // Output Loop ends here - need to write the OutputTemp Batch to the db
          await outPutTempBatch.write()
          // need to open a second batch because the first one is already burned
          const outPutTempBatch2 = dbutx.batch()
          for (const { txid, vin } of tx) {
            // Inputs
            for (const [index, input] of vin.entries()) {
              if (input.coinbase) {
                // no useful information here - just skip that entry
              } else {
                try {
                  // take the txid and the vout.index to perform a lookup in the "temp-db" to get the amount and the address the input
                  // was coming from
                  const search = { txid: input.txid, index: input.vout }
                  // console.log(search)
                  const check = await dbutx.get(search)
                  // console.log(check)
                  // take the found value and make it negative
                  //  const mamount = (parseFloat(check.amount) * -1)
                  // delete the entry in the "temp-db" since it wont be needed anymore
          
                  // now decrease the total balance of the address the input was coming from with the following information:
                  /*
              address:  which address was spending the ouput
              height:   at which height was it spent
              id:       the value was spent
              txid:     at which txid was it spent
              index:    the index auf the vin entry of the txid where it was spent
              mamount:  (minus-amount) how much was spent
               { amount: check.amount, txid: txid, index: index, height: height, time: time, type:'s' })        
              */
                  addressBatch.put({ address: check.address, height: height, time: time, txid: txid, index: index, type: "s" }, { amount: check.amount, txid: input.txid, index: input.vout, height: check.height, time: check.time, type:'s' })
                  addressBatch.put({ address: check.address, height: check.height, time: check.time, txid: input.txid, index: input.vout, type: "r" }, { amount: check.amount, txid: txid, index: index, height: height, time: time, type:'s' }) 
                  // The id is somehow needed, even though it is never used
                  // what's missing:
                  // where did the money go to
                  /*
              Information in vin:
              - txid
              - vout => Both are required to the retrieve the address
              */
                } catch (error) {
                  console.log(`could not find value for ${txid}`)
                }
              }
            }
          }
          /*
      End of one cycle:
       - save block to dbBlocks
       - create entries for all addresses inside the batch
       - delete all entries in the "temp-db"
       - call next() function to get to the next block
      */
          await outPutTempBatch2.write()
          
          await addressBatch.write()
          await dbblocks.put(height, { time, hash }, () => {
            console.log(`Block # ${height} with ${nTx} Transactions inserted to the dbblocks `)
          })
          let heightCheck = height
          // ! Bei jedem Turn wird gecheckt ob der zuletzt gesyncte Block die maximale Höhe ist
          if (heightCheck === nodeHeight || heightCheck > nodeHeight) {
            //! Wenn wir bei der NodeHeight angekommen sind, ist diese in der zwischenzeit größer geworden
            //! Beim initialsync sind nun 4h vergangen ==> Aktualisieren der NodeHeight
            nodeHeight = await client.height()
            console.log(nodeHeight)
            //! Jetzt wird nochmal gecheckt ob der zuletzt gespeicherte Block gleich der NodeHeight ist
            //! Dies wird beim ersten, zweiten und dritten mal sicher noch nicht der Fall sein und der Initialsync geht weiter und die
            //! DB bleibt weiter blockiert
            if (heightCheck === nodeHeight) {
              // await dbblocks.close()
              // await dbutx.close()
              // await dbaddress.close()
              // console.log(dbblocks.isOpen())
              // console.log(dbaddress.isOpen())
              // console.log(dbutx.isOpen())
              let nextBlock = nodeHeight + 1
              console.log('Waiting for Block :' + nextBlock)
            }
          }
          next()
        } catch (error) {
          console.log(error)
          console.log(`error syncing block ${height}`)
        }
      }
    }))
}

module.exports = synchronize
