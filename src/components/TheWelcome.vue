<script setup lang="ts">
import SelectToken from "./SelectToken.vue";
import ConnectWallet from "./ConnectWallet.vue";
import Address from "./Address.vue";
</script>

<template>
  <Address />
  <div class="container">
    <SelectToken from />
    <SelectToken />
    <ConnectWallet />
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  min-width: 400px;
  padding: 16px;
  border-radius: 16px;
  background: #fff;
  -webkit-box-shadow: 0px 0px 50px -6px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 0px 50px -6px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 0px 50px -6px rgba(0, 0, 0, 0.75);
}
</style>
