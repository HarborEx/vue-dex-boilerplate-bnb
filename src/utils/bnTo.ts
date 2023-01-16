import { BigNumber } from 'bignumber.js';

export const numToBNDecimals = (num: string | number, decimals=0) => {
  return new BigNumber(num);
}