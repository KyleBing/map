<template>
    <el-container>
        <el-container>
            <el-aside :style="`min-height: ${asideHeight}px`" :width="`${navWidth}px`">
                <navbar/>
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
import {mapState} from "vuex"

export default {
    name: 'layout',
    components: {
        navbar,
    },
    data() {
        return {
            asideHeight: 0
        }
    },
    created() {
        this.asideHeight = window.innerHeight
    },
    computed: {
        ...mapState(['navWidth'])
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
