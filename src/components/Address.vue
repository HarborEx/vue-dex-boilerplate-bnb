<script lang="ts">
import { Observer } from "mobx-vue-lite";
import { useGlobalObservable } from "../store/store";

const store = useGlobalObservable();

export default {
  async mounted() {
    try {
      await store.value.getETHBalance();
      this.humanBalance = store.value.ethBalance
        .div(Math.pow(10, 18))
        .toFixed(6);
    } catch (error) {
      console.error(error);
    }
  },
  data() {
    return {
      humanBalance: "",
      store,
    };
  },
};
</script>

<template>
  <Observer>
    <div v-if="store.address" class="address-container">
      <p>{{ humanBalance }} BNB</p>
      <p>{{ `${store.address.slice(0, 6)}...${store.address.slice(36)}` }}</p>
    </div>
  </Observer>
</template>

<style scoped>
.address-container {
  position: fixed;
  top: 16px;
  right: 16px;
  padding: 8px;
  background-color: #e3e3e3;
  border-radius: 16px;
}
</style>
