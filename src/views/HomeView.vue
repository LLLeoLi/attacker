<template>
  <div>
    <Header></Header>
    <div class="main">
      <HomePage/>
    </div>
    <Footer></Footer>
  </div>
</template>
<script setup>
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"
import HomePage from "./HomePage.vue"
</script>
<style lang="scss" scoped>
.main{
  overflow: hidden;
  background-color: #eff7f8;
}
</style>