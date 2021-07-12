<template>
    <div class="logo-container" :style="`height: ${height}px`">
        <div :class="['logo', {narrow: navMenuIsClosed}]" @click="handleCollapseToggle">
            <img src="../assets/logo.png" alt="LOGO">
        </div>
    </div>

</template>

<script>
import {mapMutations, mapState} from "vuex";

export default {
    props: {
        height: { // 高度
            type: Number,
            default: 100
        }
    },
    name: "logo",
    computed: {
        ...mapState(['navWidth', 'navMenuIsClosed'])
    },
    methods: {
        ...mapMutations(['SET_NAV_WIDTH', 'SET_NAV_MENU_STATUS']),
        handleCollapseToggle() {
            this.SET_NAV_MENU_STATUS(!this.navMenuIsClosed)
            this.SET_NAV_WIDTH(this.navMenuIsClosed ? 64 : 200)
        },
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