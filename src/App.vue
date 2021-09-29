<template>
  <div class="app">
    <Editor v-model="state" ></Editor>
  </div>
</template>

<script>
import { ref } from "@vue/reactivity";
import data from "./data.json";
import Editor from "./package/editor";
import { registerConfig as config } from "./utils/editor.config.jsx";
import { provide } from "@vue/runtime-core";
export default {
  components: { Editor },
  setup() {
    const state = ref(data);
    // console.log(config)
    provide("config", config);
    return { state };
  },
};
</script>
