import type { BigNumber } from "bignumber.js";

export interface IToken {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI?: string;
}

export interface ITokenStore extends IToken {
  balance: null | BigNumber;
}
