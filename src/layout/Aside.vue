<template>
    <ElAside :class="{mobile: store.isInPortraitMode}"
              :style="`min-height: ${heightAside}px`"
              :width="`${store.navWidth}px`">
       <div class="navbar">
           <logo :height="heightLogo"></logo>
           <Navbar class="side-menu" :height="heightNavbar"/>
           <copyright v-show="!store.navMenuIsClosed" :height="heightCopyright"></copyright>
       </div>
    </ElAside>
</template>

<script lang="ts" setup>

import Navbar from "./Navbar.vue"
import Copyright from "./Copyright.vue";
import Logo from "./Logo.vue";
import {onMounted, ref, watch} from "vue";

import {useProjectStore} from "@/pinia.ts";

const store = useProjectStore()

const heightAside = ref(0)
const heightNavbar = ref(0)
const heightLogo = ref(100)
const heightCopyright = ref(150)

onMounted(()=>{
    resizeComponents()
})

watch(store.windowInsets, newValue => {
    resizeComponents()
})

function  resizeComponents(){
    heightAside.value = store.isInPortraitMode? store.windowInsets.height - 50 : store.windowInsets.height// padding aside remove
    heightNavbar.value = heightAside.value - heightLogo.value - heightCopyright.value
    if (store.isInPortraitMode){
        store.navWidth = store.windowInsets.width
    } else {
        store.navWidth = 200// 当从移动端切到 PC 时，重新设置 NavMenu 的宽度
    }
}
</script>

<style lang="scss" scoped>
@import "../scss/plugin";

$border-color: #ddd;
.el-aside {
    &.mobile{
        z-index: 999;
        position: fixed;
        top: 0;
        left: 0;
        width: 100% !important;
        padding: 40px;
        background-color: transparent;
        .navbar{
            //border: 1px solid $border-color;
            border: none;
            @include box-shadow(1px 1px 3px rgba(0,0,0,0.2));
            @include border-radius(10px);
        }
    }
}
.navbar{
    border-right: 1px solid $border-color;
    overflow: hidden;
    background-color: white;
}

.side-menu{
    overflow: hidden;
    overflow-y: auto;
}
</style>
