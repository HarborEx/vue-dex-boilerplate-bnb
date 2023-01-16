# Vue BNB swap boilerplate
 
```sh
# install dependencies
> npm i
# serve with hot reload
> npm run dev
```

- [x] - Connect MetaMask
- [x] - Show BNB balance
- [x] - Show token's list
- [x] - Approve tokens to pancake swap
- [x] - Swap token to another token
- [ ] - Change network, if metamask give not BSC
- [ ] - Add support other networks
- [ ] - Refactor

## Contracts

- Use 1inch oracle to get token's rate.
- USDT to get token -> dollar price. 
- Pancake Swap to swap tokens

```typescript
// src/utils/conracts.ts
export const contractAddresses = {
  oneInchOracle: "0xfbD61B037C325b959c0F6A7e69D8f37770C2c550",
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  pancakeSwap: "0x10ed43c718714eb63d5aa57b78b54704e256024e",
};
```

## Contacts

Contact us [Telegram](https://t.me/aplinaxy9plin)

## Donation
ETH/BNB/Polygon - 0xef8d23c5402630cc94d142eeee34c3e10035238e
