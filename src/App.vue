<script setup>
const noSpace = reactive({
   autoInsertSpace: false,
})
</script>

<template>
    <el-config-provider :button="noSpace">
    <RouterView />
  </el-config-provider>
</template>

<style scoped>
@font-face {
  font-family: smileySans;
  src: url('./assets/fonts/SmileySans-Oblique.ttf');
  src: url('./assets/fonts/SmileySans-Oblique.ttf') format('truetype');
  src: url('./assets/fonts/SmileySans-Oblique.otf.woff2') format('woff2');
  src: url('./assets/fonts/SmileySans-Oblique.ttf.woff2') format('woff2');
  src: url('./assets/fonts/SmileySans-Oblique.otf') format('opentype');
}
</style>
