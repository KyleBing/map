<template>
    <div class="logo-container" :style="`height: ${height}px`">
        <div :class="['logo', {narrow: navMenuIsClosed}]">
            <img src="../assets/logo.png" alt="LOGO">
        </div>
    </div>

</template>

<script>
import {mapState} from "vuex";

export default {
    props: {
        height: { // 高度
            type: Number,
            default: 100
        }
    },
    name: "logo",
    computed:{
        ...mapState(['navMenuIsClosed'])
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
}
.logo{
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