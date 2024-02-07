import { assertNotNull } from '@subsquid/substrate-processor'
import { ProcessorConfig, ChainApi, IChainData } from './interfaces'
import {
  KnownArchivesSubstrate,
  lookupArchive,
} from '@subsquid/archive-registry'
import fs from 'fs'

function getChain(): { api: ChainApi; config: ProcessorConfig } {
  const chainName = assertNotNull(
    process.env.CHAIN,
    'Missing env variable CHAIN'
  )
  const chainNameKebab = chainName.split('_').join('-')
  const chainAPI = require(`./${chainNameKebab}`).default

  let chainsConfig: IChainData[]
  try {
    const data = fs.readFileSync('assets/chains-data.json')
    chainsConfig = JSON.parse(data.toString())
  } catch (err) {
    console.error("Can't read chain config from 'assets/chains-data.json : ")
    throw err
  }

  const chainConfig = chainsConfig.find((chain) => chain.network === chainName)
  if (!chainConfig) {
    throw new Error(`Chain ${chainName} not found in assets/chains-data.json`)
  }

  const customChainNodeUrl = process.env.CHAIN_NODE_URL
  const customChainArchiveUrl = process.env.CHAIN_ARCHIVE_URL
  const blockFrom = process.env.BLOCK_START
  const blockTo = process.env.BLOCK_TO

  if(!customChainNodeUrl){
    throw new Error(`CHAIN_NODE_URL must be set`)
  }

  if(!customChainArchiveUrl){
    throw new Error(`CHAIN_ARCHIVE_URL must be set`)
  }

  let processorConfig:ProcessorConfig = {
    chainName: chainConfig.network,
    dataSource: {
      archive: customChainArchiveUrl,
      chain: customChainNodeUrl,

    },
    prefix: chainConfig.prefix,
  }


  if(blockFrom){
    if(isNaN(parseInt(blockFrom))){
      throw new Error(`BLOCK_START should be a number`)
    }

    processorConfig.blockRange = {from: parseInt(blockFrom)}
    if(blockTo) {
      if (isNaN(parseInt(blockFrom))) {
        throw new Error(`BLOCK_TO should be a number`)
      }

      processorConfig.blockRange = {...processorConfig.blockRange, to: parseInt(blockTo)}
    }
  }

  if (chainAPI.customConfig) {
    Object.assign(processorConfig, chainAPI.customConfig)
  }

  return { api: chainAPI.api, config: processorConfig }
}

export const chain = getChain()
