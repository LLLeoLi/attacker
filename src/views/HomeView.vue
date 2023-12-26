<template>
  <div>
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
.main{
  overflow: hidden;
  background-color: #eff7f8;
}
</style>