<template>
    <el-container>
        <el-container>
            <transition
                enter-active-class="animate__bounceInDown"
                leave-active-class="animate__bounceOutUp"
            >
                <div v-show="isShowingMenuToggleBtn" class="menu-btn animate__animated " @click="toggleMenu">
                    <img src="../assets/logo.png" alt="logo">
                </div>
            </transition>

            <transition
                enter-active-class="animate__faster animate__slideInLeft"
                leave-active-class="animate__faster animate__slideOutRight"
            >
                <Aside class="animate__animated" v-show="!isShowingMenuToggleBtn"></Aside>
            </transition>
            <el-container>
                <el-main>
                    <router-view/>
                </el-main>
            </el-container>
        </el-container>
    </el-container>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex"

import Aside from "@/layout/aside";
export default {
    name: 'layout',
    components: {Aside},
    data() {
        return {
        }
    },
    created() {
        this.onResize()
        window.onresize = this.onResize
        this.SET_IS_SHOWING_MENU_TOGGLE_BTN(this.isInPortraitMode)
    },
    computed: {
        ...mapGetters(['isInPortraitMode']),
        ...mapState(['isShowingMenuToggleBtn'])
    },
    methods: {
        ...mapMutations([
            'SET_IS_SHOWING_MENU_TOGGLE_BTN',
            'SET_WINDOW_INSETS',
            'SET_IS_IN_MOBILE',
        ]),
        onResize(){
            this.SET_WINDOW_INSETS({
                height: window.innerHeight,
                width: window.innerWidth
            })
        },
        toggleMenu(){
            this.SET_IS_SHOWING_MENU_TOGGLE_BTN(!this.isShowingMenuToggleBtn)
        }
    }
}
</script>

<style lang="scss" scoped>

@import "../scss/plugin";

.el-main {
    padding: 0;
}
$height-menu-btn: 40px;
.menu-btn{
    @include box-shadow(1px 1px 3px rgba(0,0,0,0.1));
    background-color: white;
    overflow: hidden;
    padding: 6px;
    position: fixed;
    top: 10px;
    left: 10px;
    height: $height-menu-btn;
    width: $height-menu-btn;
    @include border-radius(100px);
    z-index: 999;
    img{
        width: 100%;
        display: block;
    }
    &.active{
        transform: translateY(2px);
    }
}
</style>
