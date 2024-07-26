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
    // 商场
    {position: [117.129533, 36.685668]  , phone: '' ,            type: "orange",     name: "高新万达"} ,
    {position: [117.100261, 36.658804]  , phone: '' ,            type: "orange",     name: "万象城"} ,
    {position: [117.063358, 36.683155]  , phone: '' ,            type: "orange",     name: "印象城"} ,
    {position: [117.053734, 36.717434]  , phone: '' ,            type: "orange",     name: "华山-环宇城"} ,
    {position: [117.109686, 36.667901]  , phone: '' ,            type: "orange",     name: "龙湖天街"} ,
    {position: [117.023753, 36.663806] ,  phone: '' ,            type: "orange",     name: "恒隆广场"} ,
    {position: [117.197677, 36.671258] ,  phone: '' ,            type: "orange",     name: "融创茂"} ,
    {position: [117.003035, 36.662559] ,  phone: '' ,            type: "orange",     name: "经四万达"} ,
    {position: [117.002642, 36.593224] ,  phone: '' ,            type: "orange",     name: "贵和"} ,
    {position: [116.981724, 36.612771] ,  phone: '' ,            type: "orange",     name: "中海-环宇城"} ,
    {position: [116.978032, 36.649693] ,  phone: '' ,            type: "orange",     name: "和谐广场"} ,
    {position: [117.159784, 36.747578] ,  phone: '' ,            type: "orange",     name: "宜家"} ,

    // 车站
    {position: [116.893587, 36.66899] , phone: '' ,    type: "blue", name: "济南西" },
    {position: [117.029475, 36.681202] , phone: '' ,    type: "blue", name: "大明湖站" },
    {position: [117.159784, 36.747578] , phone: '' ,    type: "blue", name: "济南东" },

    // 车管所
    {position: [117.821953 , 36.138451] , phone: '06345667973' , type: "", name: "钢城区车辆管理所" } ,
    {position: [117.166785 , 37.245034] , phone: '84801008' ,    type: "", name: "商河钱隆机动车登记服务站" } ,
    {position: [117.699792 , 36.179012] , phone: '06346096277' , type: "", name: "莱芜区车辆管理所" } ,
    {position: [116.405267 , 36.270492] , phone: '66712345' ,    type: "", name: "平阴车辆管理所" } ,
    {position: [116.920532 , 36.656044] , phone: '66712345' ,    type: "", name: "槐荫车管分所" } ,
    {position: [117.153975 , 37.284018] , phone: '66712345' ,    type: "", name: "商河车辆管理所" } ,
    {position: [116.821744 , 36.619044] , phone: '83156888' ,    type: "", name: "济西新能源机动车登记服务站" } ,
    {position: [116.935087 , 36.711933] , phone: '66712345' ,    type: "", name: "天桥车管分所" } ,
    {position: [117.206635 , 36.720479] , phone: '66712345' ,    type: "", name: "历城车管分所" } ,
    {position: [117.163276 , 36.937575] , phone: '66712345' ,    type: "", name: "济阳车辆管理所" } ,
    {position: [116.840032 , 36.641677] , phone: '66712345' ,    type: "", name: "济南市车管所" } ,
    {position: [117.225284 , 36.661391] , phone: '66712345' ,    type: "", name: "历下车管分所" } ,
    {position: [116.981713 , 36.624219] , phone: '66712345' ,    type: "", name: "市中车管分所" } ,
    {position: [116.804331 , 36.587233] , phone: '66712345' ,    type: "", name: "长清区车辆管理所" } ,
    {position: [117.568698 , 36.684551] , phone: '66712345' ,    type: "", name: "章丘车辆管理所" },


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
                <div class="marker ${item.phone? '': 'no-content'} ${item.type}">
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
