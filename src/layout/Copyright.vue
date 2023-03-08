<template>
    <div class="copyright" :style="`height: ${height}px`">

        <dl v-if="authorization && authorization.nickname"><dt>用户：</dt><dd>{{ authorization.nickname }}<span @click="logout" class="btn-logout">退出</span></dd></dl>
        <dl><dt>更新：</dt><dd>{{ packageInfo['date-update'] }}</dd></dl>
        <dl><dt>版本：</dt><dd>{{ packageInfo['version'] }}</dd></dl>
        <dl><dt>API：</dt><dd><a href="https://lbs.amap.com/api/javascript-api/summary/">高德地图</a></dd></dl>
        <dl><dd>如果页面卡死，请手动刷新</dd></dl>
    </div>
</template>

<script>
import packageInfo from "@/../package.json"
import {mapGetters} from "vuex";

export default {
    name: "Copyright",
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
    methods: {
        logout(){
            this.$router.push({
                name: 'Logout'
            })
        }
    },
    computed: {
        ...mapGetters(['authorization'])
    }

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
.btn-logout{
    text-decoration: underline;
    margin-left: 10px;
    @extend .btn-like;
    &:hover{
        color: $color-main;
    }
}
a{
    &:hover{
        color: $color-main;
        text-decoration: underline;
    }
}

</style>
