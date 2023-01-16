import { ONE_INCH_ORACLE_ABI } from "@/shared/1inch.abi";
import { ERC20_ABI } from "@/shared/erc20.abi";
import { PANCAKE_SWAP_ABI } from "@/shared/pancakeSwap.abi";
import { tokens } from "@/shared/token-lists";
import { contractAddresses } from "@/utils/conracts";
import { humanNumber } from "@/utils/humanNumbers";
import BigNumber from "bignumber.js";
import { createGlobalObservable, useLocalObservable } from "mobx-vue-lite";
import Web3 from "web3";
import type { AbiItem } from "web3-utils";
import type { IToken, ITokenStore } from "../models/token.model";

export const useGlobalObservable = createGlobalObservable(() => {
  return useLocalObservable(() => ({
    tokens: tokens.map(
      (item: IToken) => ({ ...item, balance: null } as ITokenStore)
    ),
    web3: new Web3(
      (localStorage.getItem("@address") && (window as any).ethereum) ||
        "https://rpc.ankr.com/bsc"
    ),
    rpcUrl: "https://rpc.ankr.com/bsc",

    address: localStorage.getItem("@address") || "",
    ethBalance: new BigNumber(0),
    fromTokenAddress: "",
    toTokenAddress: "",
    fromTokenAmount: new BigNumber(1),
    toTokenAmount: new BigNumber(0),
    fromTokenBalance: new BigNumber(0),

    fromUSDPrice: "0",
    toUSDPrice: "0",

    tokenRate: new BigNumber(0),

    fromTokenDecimals: 0,
    toTokenDecimals: 0,

    toTokenAmountHuman: "",

    isApproved: false,
    isApproveLoading: false,
    isLoadingSendTx: false,

    async connectMetamask() {
      const { ethereum } = window as any;
      if (typeof ethereum !== "undefined") {
        try {
          const accounts = await ethereum.request({
            method: "eth_requestAccounts",
          });
          if (accounts) {
            this.web3 = new Web3(ethereum);
            this.address = accounts[0];
            localStorage.setItem("@address", accounts[0]);
          }
        } catch (error) {
          console.error(error);
        }
        return;
      }
      alert("Need to install Metamask");
    },

    async getETHBalance() {
      const balance = new BigNumber(
        await this.web3.eth.getBalance(this.address)
      );
      this.ethBalance = balance;
    },

    async getAllERC20Balances(): Promise<void> {
      this.tokens = await Promise.all(
        this.tokens.map(async (item) => {
          const contract = new this.web3.eth.Contract(
            ERC20_ABI as AbiItem[],
            item.address
          );
          try {
            item.balance = new BigNumber(
              await contract.methods.balanceOf(this.address).call()
            );
          } catch (error) {
            console.log("Out of gas");
          }
          return item;
        })
      );
    },

    async setFromToken(address: string): Promise<void> {
      if (this.address) {
        const contract = new this.web3.eth.Contract(
          ERC20_ABI as AbiItem[],
          address
        );
        try {
          this.fromTokenBalance = new BigNumber(
            await contract.methods.balanceOf(this.address)
          );
        } catch (error) {
          console.log(error);
        }
        this.fromTokenAddress = address;
      }
    },

    // usd = USDT rate
    async tokenPriceUSD(address: string, from = true) {
      const contract = new this.web3.eth.Contract(
        ONE_INCH_ORACLE_ABI as AbiItem[],
        contractAddresses.oneInchOracle
      );
      let price = "0";
      try {
        price = new BigNumber(
          await contract.methods
            .getRate(address, contractAddresses.USDT, false)
            .call()
        )
          .div(Math.pow(10, 18))
          .toFixed(6);
      } catch (error) {
        // same tokens
      }
      if (address === contractAddresses.USDT) {
        price = "1.00";
      }
      if (from) {
        this.fromUSDPrice = price;
        return;
      }
      this.toUSDPrice = price;
    },

    async setTokenRate() {
      if (this.fromTokenAddress && this.toTokenAddress) {
        const contract = new this.web3.eth.Contract(
          ONE_INCH_ORACLE_ABI as AbiItem[],
          contractAddresses.oneInchOracle
        );
        let price = new BigNumber(0);
        try {
          price = new BigNumber(
            await contract.methods
              .getRate(this.fromTokenAddress, this.toTokenAddress, false)
              .call()
          );
        } catch (error) {
          console.log(error);
        }
        this.tokenRate = price;
      }
    },

    setTokenAddress(address: string, decimals: number, from = true) {
      if (from) {
        this.fromTokenAddress = address;
        this.fromTokenDecimals = decimals;
      } else {
        this.toTokenAddress = address;
        this.toTokenDecimals = decimals;
      }
    },

    setFromTokenAmount(amount: string) {
      this.fromTokenAmount = new BigNumber(amount);
    },

    setToTokenAmount() {
      this.toTokenAmount = new BigNumber(this.fromTokenAmount).multipliedBy(
        this.tokenRate
      );
      this.toTokenAmountHuman = humanNumber(
        this.toTokenAmount.div(Math.pow(10, this.toTokenDecimals)).toFixed(4)
      );
    },

    async approveToken() {
      this.isApproveLoading = true;
      const contract = new this.web3.eth.Contract(
        ERC20_ABI as AbiItem[],
        this.fromTokenAddress
      );
      try {
        const tx = await contract.methods
          .approve(
            contractAddresses.pancakeSwap,
            this.fromTokenAmount
              .multipliedBy(Math.pow(10, this.fromTokenDecimals))
              .toFixed(0)
          )
          .send({
            from: this.address,
          });
        console.log(tx);
        await this.checkIsMine(tx.transactionHash);
        this.isApproved = true;
      } catch (error) {
        console.log(error);
      }
      this.isApproveLoading = false;
    },

    async swap() {
      this.isLoadingSendTx = true;
      const contract = new this.web3.eth.Contract(
        PANCAKE_SWAP_ABI as AbiItem[],
        contractAddresses.pancakeSwap
      );
      try {
        let deadline: Date | string = new Date();
        deadline = (deadline.setDate(deadline.getDate() + 1) / 1000).toFixed(0);

        const tx = await contract.methods
          .swapExactTokensForTokens(
            this.fromTokenAmount
              .multipliedBy(Math.pow(10, this.fromTokenDecimals))
              .toFixed(0),
            this.toTokenAmount.toFixed(0),
            [this.fromTokenAddress, this.toTokenAddress],
            this.address,
            deadline,
          )
          .send({
            from: this.address,
          });
        await this.checkIsMine(tx.transactionHash);
      } catch (error) {
        console.log(error);
      }
      this.isApproved = false;
      this.isLoadingSendTx = false;
      alert("Success");
    },

    async checkIsMine(hash: string) {
      let isMined = false;
      while (!isMined) {
        const checkMine = await this.web3.eth.getTransactionReceipt(hash);
        await new Promise((r) => setTimeout(r, 300));
        if (checkMine) {
          console.log('isMined');
          isMined = true;
        }
      }
      return;
    },

    count: 0,
    get double() {
      return this.count * 2;
    },
    increment() {
      this.count++;
    },
  }));
});
