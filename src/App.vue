<template>
    <div>
        <RouterView/>
        <ElDialog center title="提示" width="50%"
                  :visible.sync="modalTip">
            <p class="text-center">地图多次拖动后会变得卡顿，刷新页面即可</p>
            <div slot="footer" class="dialog-footer">
                <ElButton size="small" type="primary" @click="checkTip">OK</ElButton>
            </div>
        </ElDialog>
    </div>
</template>

<script lang="ts" setup>

import {onMounted, ref} from "vue";
import {useProjectStore} from "@/pinia.ts";
import {getAuthorization} from "@/utility.ts";

const store = useProjectStore()

const modalTip = ref(false)
onMounted(() => {
    store.authorization = getAuthorization()
    modalTip.value = !localStorage.getItem('map-has-checked-tip')

    onResize()
    window.addEventListener('resize', ()=>{
        onResize()
    })
})

function onResize() {
    store.windowInsets.height = window.innerHeight
    store.windowInsets.width = window.innerWidth
}

function checkTip(){
    localStorage.setItem('map-has-checked-tip', 'true')
    modalTip.value = false
}

</script>

<style lang="scss">
@import "./scss/main";
</style>
