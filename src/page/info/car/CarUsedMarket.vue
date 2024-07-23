<template>
    <div class="map-container">
        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>
    </div>
</template>

<script lang="ts" setup>
import AMapLoader from '@amap/amap-jsapi-loader'
import {useProjectStore} from "@/pinia";
import {onMounted, onUnmounted, ref} from "vue";
import {key_web_js} from "@/mapConfig.ts";
const MY_POSITION = [117.129533, 36.685668]
const store = useProjectStore()

const MARKERS = [
    {position: [117.129533, 36.685668]  , phone: '' ,            type: "market",     name: "高新万达"} ,
    {position: [117.100261, 36.658804]  , phone: '' ,            type: "market",     name: "万象城"} ,
    {position: [117.063358, 36.683155]  , phone: '' ,            type: "market",     name: "印象城"} ,
    {position: [117.053734, 36.717434]  , phone: '' ,            type: "market",     name: "华山-环宇城"} ,
    {position: [117.109686, 36.667901]  , phone: '' ,            type: "market",     name: "龙湖天街"} ,
    {position: [117.023753, 36.663806] ,  phone: '' ,            type: "market",     name: "恒隆广场"} ,
    {position: [117.197677, 36.671258] ,  phone: '' ,            type: "market",     name: "融创茂"} ,
    {position: [117.003035, 36.662559] ,  phone: '' ,            type: "market",     name: "经四万达"} ,
    {position: [117.002642, 36.593224] ,  phone: '' ,            type: "market",     name: "贵和"} ,
    {position: [116.981724, 36.612771] ,  phone: '' ,            type: "market",     name: "中海-环宇城"} ,
    {position: [116.978032, 36.649693] ,  phone: '' ,            type: "market",     name: "和谐广场"} ,
    {position: [117.228819, 36.725181] , phone: '' , type: "department", name: "济东二手车市场" } ,
    {position: [117.21,36.72] , phone: '' , type: "department", name: "济钢二手车市场" } ,
    {position: [116.829921, 36.626101] , phone: '' , type: "department", name: "济西二手车市场" } ,
    {position: [116.95,36.70] , phone: '' , type: "department", name: "蓝翔路机动车交易市场" } ,
    {position: [116.989477, 36.712772] , phone: '' , type: "department", name: "泺口二手车市场" } ,
    {position: [117.049659, 36.695429] , phone: '' , type: "department", name: "华瑞源二手车网" } ,
]

let AMap = null
let map = null
const isLoading = ref(false)

onMounted(() => {
    AMapLoader
        .load({
            key: key_web_js, // 开发应用的 ID
            version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [
                'AMap.ToolBar', // 缩放按钮
                'AMap.Scale', // 比例尺
                'AMap.DistrictLayer', // 定位
            ],
        })
        .then(mapItem => {
            AMap = mapItem
            map = new AMap.Map('container', {
                center: MY_POSITION,
                zoom: 11, // 缩放级别
            })

            map.addControl(new AMap.ToolBar())
            map.addControl(new AMap.Scale())


            MARKERS.forEach(item => {
                addMarker(map, item)
            })

        })
        .catch(e => {
            console.log(e)
        })
})

function addMarker(map, item) {
    let marker = new AMap.Marker({
        position: item.position,
        offset: new AMap.Pixel(0,-20),
        content: `
                <div class="marker  ${item.type === 'market'? 'orange': ''}">
                  <div class="marker-index">
                      <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note"><a href="tel:${item.phone}">${item.phone}</a></div>
                  </div>
               </div>
`,
    })
    map.add(marker)
}

onUnmounted(() => {
    map.clearInfoWindow() // 清除地图上的信息窗体
    map.destroy() // 销毁地图，释放内存
    map = null
})
</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";
.map-container {
    position: relative;
}
</style>
