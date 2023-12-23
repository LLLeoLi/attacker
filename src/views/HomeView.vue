<template>
  <div class="clear">
    <Header></Header>
    <div class="main">
      <RouterView></RouterView>
    </div>
    <Footer></Footer>
  </div>
</template>
<script setup>
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
</script>
<style lang="scss" scoped>
.clear{
  height: 100%;
}
.main{
  overflow: hidden;
  background-color: #eff7f8;
}
</style>