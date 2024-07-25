<template>
    <ElContainer>
        <ElContainer>
            <transition
                enter-active-class="animate__bounceInDown"
                leave-active-class="animate__bounceOutUp"
            >
                <div v-show="store.isShowingMenuToggleBtn" class="menu-btn animate__animated " @click="toggleMenu">
                    <img src="../assets/logo.png" alt="logo">
                </div>
            </transition>

            <transition
                enter-active-class="animate__faster animate__slideInLeft"
                leave-active-class="animate__faster animate__slideOutRight"
            >
                <Aside class="animate__animated" v-show="!store.isShowingMenuToggleBtn"/>
            </transition>
            <ElContainer>
                <ElMain>
                    <Container>
                        <RouterView/>
                    </Container>
                </ElMain>
            </ElContainer>
        </ElContainer>
    </ElContainer>
</template>

<script lang="ts" setup>
import Aside from "./Aside.vue";
import {useProjectStore} from "@/pinia.ts";
import Container from "@/layout/Container.vue";

const store = useProjectStore()

function toggleMenu() {
    store.isShowingMenuToggleBtn = !store.isShowingMenuToggleBtn
}
</script>

<style lang="scss" scoped>

@import "../scss/plugin";

.el-main {
    padding: 0;
}

.menu-btn {
    @include box-shadow(1px 1px 3px rgba(0, 0, 0, 0.1));
    background-color: white;
    overflow: hidden;
    padding: 6px;
    position: fixed;
    top: 10px;
    left: 10px;
    height: $width-float-btn;
    width: $width-float-btn;
    @include border-radius(100px);
    z-index: 999;

    img {
        width: 100%;
        display: block;
    }

    &.active {
        transform: translateY(2px);
    }
}
</style>
