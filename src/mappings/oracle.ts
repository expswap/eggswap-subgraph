/* eslint-disable prefer-const */
import { PriceStore } from '../types/schema'
import { Oracle, PriceUpdate } from '../types/Oracle/Oracle'
import { Address, EthereumBlock, json, JSONValueKind } from '@graphprotocol/graph-ts'
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'
import { BI_18, exponentToBigDecimal, convertEthToDecimal } from './helpers'
import { ZERO_BD } from './helpers'

const ORACLE_ADDRESS = '0xc3711801626c2fb96bDbA3B31FF644Db531f6040' // created block 4531836

export function getEthPriceInUSD(): BigDecimal {
  // fetch price from market oracle
  let oracle = PriceStore.load(ORACLE_ADDRESS)
  if (oracle === null) {
    return ZERO_BD
  }
  return oracle.usd
}

export function priceUpdate(event: PriceUpdate): void {

  let oracle = PriceStore.load(ORACLE_ADDRESS)

  if( oracle === null ){
    oracle = new PriceStore(ORACLE_ADDRESS)
    oracle.usd = convertEthToDecimal(BigInt.fromI32(17)) // should be about 10 cents
  }

  let contract = Oracle.bind(Address.fromString(ORACLE_ADDRESS))

  if(contract !== null){
    let data: BigInt = contract.getPriceUsd()
    if (data !== null) {
        oracle.usd = data.toBigDecimal().div(exponentToBigDecimal(BI_18))
    }
  }

  oracle.save()
}
