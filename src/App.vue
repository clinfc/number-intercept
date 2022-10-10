<template>
  <div class="box" v-demo="binding">
    <input
      v-number-intercept="{ mode: 'float', integer: 6, min: -6, decimals: binding.x > 12 ? 6 : 3 }"
      v-model="mval"
    />
    <!-- <a-input
      v-number-intercept="{ mode: 'float', integer: 6, min: -6, decimals: 3 }"
      v-model:value="mval"
      suffix="%"
      type="number"
      placeholder="Basic usage"
    />
    <a-input v-model:value="mval" suffix="%" type="number" placeholder="Basic usage" /> -->
  </div>
  <div class="box">value: {{ mval }}</div>
  <input type="number" v-model.number="binding.x" name="" id="" />
</template>

<script lang="ts">
  import { defineComponent, reactive, ref, watch } from 'vue'

  export default defineComponent({
    setup() {
      const mval = ref()

      watch(mval, (nv) => console.log(nv))

      const dataNumber = ref()

      const binding = ref({ x: 12, y: 24 })

      return { mval, dataNumber, binding }
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
