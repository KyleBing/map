<template>
    <div class="logo-container" :style="`height: ${height}px`">
        <div :class="['logo', {narrow: store.navMenuIsClosed}]" @click="handleCollapseToggle">
            <img src="../assets/logo.png" alt="LOGO">
        </div>
    </div>

</template>

<script lang="ts" setup>
import {useProjectStore} from "@/pinia.ts";

const store = useProjectStore()

withDefaults(defineProps<{
    height?: number
}>(), {
    height: 100
})

function handleCollapseToggle() {
    if (innerHeight < innerWidth){
        store.navMenuIsClosed = !store.navMenuIsClosed
        store.navWidth = store.navMenuIsClosed ? 64 : 200
    } else {
        store.isShowingMenuToggleBtn = !store.isShowingMenuToggleBtn
    }
}
</script>

<style lang="scss" scoped>
@import "../scss/plugin";
$height-logo: 60px;
$height-logo-narrow: 40px;
.logo-container{
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid $border-color-nav;
}
.logo{
    cursor: pointer;
    height: $height-logo;
    width: $height-logo;
    img{
        display: block;
        width: 100%;
    }
    &.narrow{
        height: $height-logo-narrow;
        width: $height-logo-narrow;
    }
}

</style>
