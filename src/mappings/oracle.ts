/* eslint-disable prefer-const */
import { PriceStore } from '../types/schema'
import { Oracle, PriceUpdate } from '../types/Oracle/Oracle'
import { log, Address, EthereumBlock, json, JSONValueKind } from '@graphprotocol/graph-ts'
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts/index'
import { convertTokenToDecimal, BI_18, exponentToBigDecimal, convertEthToDecimal } from './helpers'
import { ZERO_BD } from './helpers'

const ORACLE_ADDRESS = '0xc3711801626c2fb96bDbA3B31FF644Db531f6040' // created block 4531836

export function getEthPriceInUSD(): BigDecimal {
  // fetch price from market oracle
  let oracle = PriceStore.load(ORACLE_ADDRESS)
  if( oracle === null ){
    log.info('The oracle is null so we are making a new one and setting the price to 10 cents', [])
    oracle = new PriceStore(ORACLE_ADDRESS)
    oracle.usd = BigDecimal.fromString('100000000000000000').div(exponentToBigDecimal(BI_18)) // should be about 10 cents
    oracle.save()
  } 
	log.info('GET ETH PRICE WAS CALLED : PRICE IS ===> {} <====', [oracle.usd.toString()])
  return oracle.usd;
}

export function priceUpdate(event: PriceUpdate): void {

  let oracle = PriceStore.load(ORACLE_ADDRESS)

  if( oracle === null ){
    log.info('The oracle is null so we are making a new one and setting the price to 10 cents', [])
    oracle = new PriceStore(ORACLE_ADDRESS)
    oracle.usd = convertEthToDecimal(BigInt.fromI32(17)) // should be about 10 cents
  }

  oracle.save()

  let currency = event.params.symbol.toHexString();
  let value: BigDecimal = convertTokenToDecimal(event.params.price, BI_18)

  log.info('Currency: {} Value: {}', [currency, value.toString()])

  if(currency.includes('555344')){
    oracle.usd = value;
  }

  oracle.save()

}
