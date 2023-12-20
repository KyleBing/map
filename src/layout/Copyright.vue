<template>
    <div class="copyright" :style="`height: ${height}px`">

        <dl><dt>用户：</dt>
            <dd v-if="authorization && authorization.nickname">{{ authorization.nickname }}
                <span @click="logout" class="btn-logout">退出</span>
            </dd>
            <dd v-else>
                <span @click="login" class="btn-logout">登录</span>
            </dd>
        </dl>
        <dl><dt>开源：</dt><dd><a :href="packageInfo['github']">github</a></dd></dl>
        <dl><dt>更新：</dt><dd>{{ packageInfo['date-update'] }}</dd></dl>
        <dl><dt>版本：</dt><dd>v{{ packageInfo['version'] }}</dd></dl>
        <dl><dt>API：</dt><dd><a href="https://lbs.amap.com/api/javascript-api/summary/">高德地图 v2.0.0</a></dd></dl>
    </div>
</template>

<script>
import packageInfo from "@/../package.json"
import {mapGetters, mapMutations, mapState} from "vuex";

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
        ...mapMutations(['SET_AUTHORIZATION']),
        logout(){
            this.$utility.deleteAuthorization()
            this.SET_AUTHORIZATION({})
        },
        login(){
            this.$router.push({
                name: 'Login'
            })
        }
    },
    computed: {
        ...mapState(['authorization'])
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
