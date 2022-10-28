<template>
    <div class="copyright" :style="`height: ${height}px`">
        <dl><dt>更新：</dt><dd>{{ packageInfo['date-update'] }}</dd></dl>
        <dl><dt>API：</dt><dd><a href="https://lbs.amap.com/api/javascript-api/summary/">高德地图</a></dd></dl>
        <dl><dt>首页：</dt><dd><a href="https://kylebing.cn">kylebing.cn</a></dd></dl>
    </div>
</template>

<script>
import packageInfo from "@/../package.json"

export default {
    props: {
        height: { // 高度
            type: Number,
            default: 100
        }
    },
    data(){
        return {
            packageInfo: packageInfo
        }
    },
    name: "copyright"
}
</script>

<style lang="scss" scoped>
@import "../scss/plugin";
.copyright{
    border-top: 1px solid $border-color-nav;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-end;
    padding: 30px;
    dl{
        font-size: 0.7rem;
        line-height: 1.5;
        color: $text-subtitle;
        display: flex;
        justify-content: space-between;
        dd{
        }
    }
}
a{
    &:hover{
        color: $color-main;
        text-decoration: underline;
    }
}

</style>
