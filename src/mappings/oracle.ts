/* eslint-disable prefer-const */
import { PriceStore } from '../types/schema'
import { Oracle } from '../types/Oracle/Oracle'
import { Address, EthereumBlock, json, JSONValueKind } from '@graphprotocol/graph-ts'
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'
import { BI_18, exponentToBigDecimal } from './helpers'
import { ZERO_BD } from './helpers'

const ORACLE_ADDRESS = '0xc3711801626c2fb96bDbA3B31FF644Db531f6040' // created block 4531836


export function getEthPriceInUSD(): BigDecimal {
  // fetch price from market oracle
  let oracle = PriceStore.load(ORACLE_ADDRESS)
  if (oracle == null) {
    return ZERO_BD
  } else {
    return oracle.usd
  }
}

export function priceUpdate(block: EthereumBlock): void {

  let oracle = PriceStore.load(ORACLE_ADDRESS)
  if (oracle == null) {
    oracle = new PriceStore(ORACLE_ADDRESS)
    oracle.usd =  ZERO_BD
  } else {
    let contract = Oracle.bind(Address.fromString(ORACLE_ADDRESS))
    if (contract == null) {
      //GET data from historical data api, using the block.timestamp
      //make sure to convert the return
      oracle.usd =  ZERO_BD
    } else {
      let data: BigInt = contract.getPriceUsd()
      if (data == null) {
        oracle.usd = BigDecimal.fromString('1000000000000000000').div(exponentToBigDecimal(BI_18))
      } else {
        //make sure to convert from wei fromI32(18)
        oracle.usd = data.toBigDecimal().div(exponentToBigDecimal(BI_18))
      }
    }
  }
  oracle.save()
}
