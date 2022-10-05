<template>
  <div class="box">
    <input v-demo v-number-intercept="{ mode: 'float', integer: 6, min: -6, decimals: 3 }" v-model="mval" />
    <a-input
      v-demo
      v-number-intercept="{ mode: 'float', integer: 6, min: -6, decimals: 3 }"
      v-model:value="mval"
      suffix="%"
      type="number"
      placeholder="Basic usage"
    />
    <a-input v-model:value="mval" suffix="%" type="number" placeholder="Basic usage" />
  </div>
  <div class="box">value: {{ mval }}</div>
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from 'vue'

  export default defineComponent({
    setup() {
      const mval = ref()

      watch(mval, (nv) => console.log(nv))

      const dataNumber = ref()

      return { mval, dataNumber }
    },
  })
</script>

<style scoped>
  .box {
    width: 350px;
    margin: auto;
    margin-top: 35px;
  }
</style>
