<template>
    <el-aside :class="{mobile: isInPortraitMode}" :style="`min-height: ${heightAside}px`" :width="`${navWidth}px`">
       <div class="navbar">
           <logo :height="heightLogo"></logo>
           <navbar class="side-menu" :height="heightNavbar"/>
           <copyright v-show="!navMenuIsClosed" :height="heightCopyright"></copyright>
       </div>
    </el-aside>
</template>

<script>

import navbar from "@/layout/Navbar"
import {mapState, mapGetters, mapMutations} from "vuex"
import Copyright from "@/layout/Copyright";
import Logo from "@/layout/Logo";

export default {
    name: 'Aside',
    components: {
        Copyright,
        Logo,
        navbar,
    },
    data() {
        return {
            heightAside: 0,
            heightNavbar: 0,
            heightLogo: 100,
            heightCopyright: 150
        }
    },
    created() {
        this.resizeComponents()
    },
    computed: {
        ...mapGetters(['isInPortraitMode']),
        ...mapState(['windowInsets','navWidth', 'navMenuIsClosed', 'isInMobile', 'isShowingMenuToggleBtn'])
    },
    watch: {
        windowInsets(newValue){
            this.resizeComponents()
        }
    },
    methods:{
        ...mapMutations(['SET_NAV_WIDTH']),
        resizeComponents(){
            this.heightAside = this.isInPortraitMode? this.windowInsets.height - 50 : this.windowInsets.height// padding aside remove
            this.heightNavbar = this.heightAside - this.heightLogo - this.heightCopyright
            if (this.isInPortraitMode){
                this.SET_NAV_WIDTH(this.windowInsets.width)
            } else {
                this.SET_NAV_WIDTH(200) // 当从移动端切到 PC 时，重新设置 NavMenu 的宽度
            }
        }
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
        padding: 25px;
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
