<template>
    <div class="header">
        <div class="title">
            <img src="../../assets/logo.png" height="64px"/>
        </div>
        <div class="logout">
        </div>
    </div>
</template>


<style lang="scss" scoped>
.header{
    height: 64px;
    background: rgb(255, 255, 255);
    box-shadow: rgb(204, 204, 204) 0.01rem 0.01rem 0.01rem;
    width: 100%;
    display: flex;
    justify-content: space-between;
    .title{
        text-align: center;
        display: flex;
        justify-content: center;
        flex-direction: column;
        margin-left: 1rem;
    }
}
</style>