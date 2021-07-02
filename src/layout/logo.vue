<template>
    <div class="logo-container" :style="`height: ${height}px`">
        <div class="logo">
            <img src="../assets/logo.png" alt="LOGO">
        </div>
    </div>

</template>

<script>
export default {
    props: {
        height: { // 高度
            type: Number,
            default: 100
        }
    },
    name: "logo"
}
</script>

<style lang="scss" scoped>
@import "../scss/plugin";
$height-logo: 60px;
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
}

</style>