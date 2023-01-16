<script>
import { Observer } from "mobx-vue-lite";
import { useGlobalObservable } from "../store/store";
export default {
  data() {
    return {
      store: useGlobalObservable(),
    }
  }
}
</script>

<template>
  <Observer>
    <v-btn
      v-if="!store.address"
      @click="store.connectMetamask"
      variant="outlined"
      width="100%"
      height="48px"
      >Connect wallet</v-btn
    >
    <v-btn
      v-else-if="!store.isApproved"
      :loading="store.isApproveLoading"
      :disabled="store.isApproveLoading"
      @click="store.approveToken"
      variant="outlined"
      width="100%"
      height="48px"
      >Approve</v-btn
    >
    <v-btn
      v-else
      :loading="store.isLoadingSendTx"
      :disabled="store.isLoadingSendTx"
      @click="store.swap"
      variant="outlined"
      width="100%"
      height="48px"
      >Swap</v-btn
    >
  </Observer>
</template>
