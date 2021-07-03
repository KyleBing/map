<template>
    <div class="copyright" :style="`height: ${height}px`">
        <dl><dt>作者：</dt><dd><a href="https://kylebing.cn">邴新科</a></dd></dl>
        <dl><dt>更新：</dt><dd>2021/07/02</dd></dl>
        <dl><dt>邮箱：</dt><dd><a href="mailto:kylebing@163.com">kylebing@163.com</a></dd></dl>
        <dl><dt>首页：</dt><dd><a href="https://kylebing.cn">https://kylebing.cn</a></dd></dl>
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
    name: "copyright"
}
</script>

<style lang="scss" scoped>
@import "../scss/plugin";
.copyright{
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