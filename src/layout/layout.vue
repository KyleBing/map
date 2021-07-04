<template>
    <el-container>
        <el-container>
            <el-aside :style="`min-height: ${heightAside}px`" :width="`${navWidth}px`">
                <logo :height="heightLogo"></logo>
                <navbar :height="heightNavbar"/>
                <copyright v-show="!navMenuIsClosed" :height="heightCopyright"></copyright>
            </el-aside>
            <el-container>
                <el-main>
                    <router-view/>
                </el-main>
            </el-container>
        </el-container>
    </el-container>
</template>

<script>

import navbar from "@/parts/navbar"
import {mapState, mapMutations} from "vuex"
import Copyright from "@/layout/copyright";
import Logo from "@/layout/logo";

export default {
    name: 'layout',
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
            heightCopyright: 200
        }
    },
    created() {
        this.heightAside = window.innerHeight
        this.onResize()
        window.onresize = this.onResize
    },
    computed: {
        ...mapState(['navWidth', 'navMenuIsClosed'])
    },
    methods: {
        ...mapMutations(['SET_WINDOW_INSETS']),
        onResize(){
            this.heightAside = window.innerHeight
            this.heightNavbar = this.heightAside - this.heightLogo - this.heightCopyright
            this.SET_WINDOW_INSETS({
                height: window.innerHeight,
                width: window.innerWidth
            })
        }
    }
}
</script>

<style lang="scss" scoped>
$border-color: #ddd;
.el-header {
    border-bottom: 1px solid $border-color;
}

.el-aside {
    border-right: 1px solid $border-color;
}
.el-main {
    padding: 0;
}
</style>
