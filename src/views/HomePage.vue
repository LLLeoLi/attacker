<template>
    <KeepAlive>
        <component :is="activeComponent" />
    </KeepAlive>
</template>

<script setup>
import ModelPage from "./ModelPage.vue"
const stepActive = ref(0);
let activeComponent = ModelPage;
</script>

<style lang="scss" scoped>
</style>