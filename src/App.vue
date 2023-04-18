<template>
    <div>
        <router-view/>
        <el-dialog
            center
            title="提示"
            :visible.sync="modalTip"
            width="50%">
            <p class="text-center">如果界面卡死，稍安勿躁，刷新页面即可</p>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" type="primary" @click="checkTip">OK</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {mapMutations} from "vuex";

export default {
    name: 'App',
    data(){
        return {
            modalTip: false,
        }
    },
    mounted() {
        this.SET_AUTHORIZATION(this.$utility.getAuthorization())
        this.modalTip = !localStorage.getItem('map-has-checked-tip')
    },
    methods: {
        ...mapMutations(['SET_AUTHORIZATION']),
        checkTip(){
            localStorage.setItem('map-has-checked-tip', 'true')
            this.modalTip = false
        },
    }
}


</script>

<style lang="scss">
@import "./scss/main";
</style>
