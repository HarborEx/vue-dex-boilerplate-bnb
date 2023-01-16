<script lang="ts">
import { Observer } from "mobx-vue-lite";
import { useGlobalObservable } from "../store/store";
import { tokens } from "../shared/token-lists";
import type { IToken, ITokenStore } from "@/models/token.model";
import { humanNumber } from "../utils/humanNumbers";

const store = useGlobalObservable();
export default {
  async mounted() {
    if (!store.value.fromTokenAddress) {
      const currentTokenIndex = this.$props.from ? 0 : 1;
      await store.value.setFromToken(tokens[currentTokenIndex].address);
      this.$data.currentToken = tokens[currentTokenIndex];
      console.log(currentTokenIndex);
    }
  },
  computed: {
    amountComputed: {
      get: function () {
        return humanNumber(this.amount);
      },
      set: function (el: string) {
        this.amount = el.replace(/\s+/g, "");
        this.store.setFromTokenAmount(this.amount);
        if (this.from) {
          this.store.setToTokenAmount();
        }
      },
    },
  },
  data() {
    return {
      dialog: false,
      amount: "1",
      currentToken: null as null | IToken | ITokenStore,
      store,
    };
  },
  props: {
    from: Boolean,
  },
  methods: {
    changeToTokenAmount: function () {
      if (!this.$props.from) {
        const amount = humanNumber(
          this.store.toTokenAmount
            .div(Math.pow(10, this.store.toTokenDecimals))
            .toFixed(4) || ""
        );
        this.amount = amount !== "NaN" ? amount : "";
      }
    },
  },
  watch: {
    "$data.store.toTokenAmount": {
      handler() {
        this.changeToTokenAmount();
      },
      immediate: true,
    },
    "$data.dialog": {
      handler() {
        if (this.$data.dialog) {
          this.store.getAllERC20Balances();
        }
      },
      immediate: true,
    },
    "$data.currentToken": {
      async handler() {
        if (this.currentToken?.address) {
          this.store.setTokenAddress(
            this.currentToken.address,
            this.currentToken.decimals,
            this.from
          );
          await this.store.tokenPriceUSD(this.currentToken.address, this.from);
          await this.store.setTokenRate();
          this.store.setToTokenAmount();
        }
      },
      immediate: true,
    },
  },
};
</script>

<template>
  <Observer>
    <v-dialog v-model="dialog" scrollable>
      <template v-slot:activator="{ props }">
        <div v-if="currentToken" class="container-select-token">
          <p>{{ from ? "You sell" : "You buy" }}</p>
          <div class="flex-token">
            <div class="token-name" v-bind="props">
              <img class="token-icon" :src="currentToken.logoURI" />
              <p style="margin-left: 8px">{{ currentToken.symbol }}</p>
              <v-icon icon="mdi-vuetify"></v-icon>
            </div>
            <div style="width: 100%; text-align: right">
              <input v-if="from" v-model="amountComputed" class="sum-input" />
              <p v-else class="sum-input">{{ store.toTokenAmountHuman }}</p>
              <p v-if="from">
                ~${{
                  (
                    parseFloat(
                      store[from ? "fromUSDPrice" : "toUSDPrice"] || 0
                    ) * parseFloat(amount || 1)
                  ).toFixed(4)
                }}
              </p>
            </div>
          </div>
        </div>
      </template>
      <v-card>
        <v-card-title>Select Token</v-card-title>
        <v-divider></v-divider>
        <v-card-text style="height: 500px">
          <v-list lines="two">
            <v-list-item
              class="token-option"
              v-for="token in store.tokens"
              :key="token.address"
              :title="token.symbol"
              :subtitle="token.name"
              @click="
                currentToken = token;
                dialog = false;
              "
            >
              <template v-slot:prepend>
                <v-avatar>
                  <img :src="token.logoURI" />
                </v-avatar>
              </template>

              <template v-slot:append>
                <v-btn
                  v-if="!token.balance"
                  color="grey-lighten-1"
                  icon="mdi-loading"
                  variant="text"
                  >Loading...</v-btn
                >
                <p v-else>
                  {{
                    token.balance.div(Math.pow(10, token.decimals)).toString()
                  }}
                </p>
              </template>
            </v-list-item>

            <v-divider inset></v-divider>
          </v-list>
        </v-card-text>
        <v-divider></v-divider>
      </v-card>
    </v-dialog>
  </Observer>
</template>

<style scoped>
.container-select-token {
  margin-bottom: 16px;
  background-color: #f3f5fa;
  border-radius: 16px;
  padding: 16px;
}
.token-icon {
  width: 32px;
  height: 32px;
}
.token-name {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  font-size: 20px;
}
.token-name:hover {
  opacity: 0.7;
}
.flex-token {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sum-input {
  text-align: right;
  outline: 0;
  width: 100%;
  font-size: 20px;
}
.token-option:hover {
  cursor: pointer;
  opacity: 0.5;
}
</style>
