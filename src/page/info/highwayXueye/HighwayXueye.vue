<template>
    <div class="map-container">
        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>
        <RouteDetailPanel :line="{
            name: '济南籍莱钢段高速免费通行政策',
            area: '山东济南',
            road_type: '高速',
            note: `自 2022年12月1日 起，济南鲁A、鲁S车牌的小型客车（9座以下），在以下特定出入口通行高速的时候走 ETC 通道免费通行。
                官方说明地址：[济南市人民政府官方说明： 济莱高速济南籍小客车12月起免费通行](http://www.jinan.gov.cn/art/2022/11/17/art_1812_4932979.html)
           `
        }"/>
    </div>
</template>

<script lang="ts" setup>
import AMapLoader from '@amap/amap-jsapi-loader'
const MAP_CENTER = [117.582719, 36.42146]
import RouteDetailPanel from "@/page/route/components/RouteDetailPanel.vue";
import {useProjectStore} from "@/pinia";
import {onMounted, onUnmounted, ref} from "vue";
import {key_web_js} from "@/mapConfig.ts";

const MARKERS  = [
    {"id": 1, "name": "济南港沟收费站", "position": [117.176286, 36.629877], "note": "", "img": ""},
    {"id": 2, "name": "济南蟠龙收费站", "position": [117.22368, 36.628116], "note": "", "img": ""},
    {"id": 3, "name": "济南彩石收费站", "position": [117.331852, 36.613561], "note": "", "img": ""},
    {"id": 4, "name": "济南埠村收费站", "position": [117.477718, 36.596841], "note": "", "img": ""},
    {"id": 5, "name": "莱芜雪野收费站", "position": [117.53072, 36.454232], "note": "", "img": ""},
    {"id": 6, "name": "莱芜北收费站", "position": [117.654006, 36.303329], "note": "", "img": ""},
    {"id": 7, "name": "济南辛庄收费站", "position": [117.828939, 36.236879], "note": "", "img": ""},
    {"id": 8, "name": "济南莱芜高新区收费站", "position": [117.724462, 36.253729], "note": "", "img": ""},
    {"id": 9, "name": "莱芜东收费站", "position": [117.743891, 36.193472], "note": "", "img": ""},
    {"id": 10, "name": "钢城西收费站", "position": [117.700759, 36.137489], "note": "", "img": ""},
    {"id": 11, "name": "济南钢城收费站", "position": [117.793175, 36.075276], "note": "", "img": ""}
]

const store = useProjectStore()

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
                center: MAP_CENTER,
                zoom: 11, // 缩放级别
            })

            map.addControl(new AMap.ToolBar())
            map.addControl(new AMap.Scale())


            MARKERS.forEach((item, index) => {
                addMarker(map, item, index)
            })

        })
        .catch(e => {
            console.log(e)
        })
})

function addMarker(map, item, index: number) {
    let marker = null
    if (item.note) {
        marker = new AMap.Marker({
            position: item.position,
            offset: new AMap.Pixel(0, -20),
            content: `
              <div class="marker">
                  <div class="marker-index">
                       <div class="index">${index + 1}</div>
                      <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note">${item.note.replace(/\|/, '<br>')}</div>
                  </div>
               </div>
`
        })
    } else {
        marker = new AMap.Marker({
            position: item.position,
            offset: new AMap.Pixel(0, -20),
            content: `
              <div class="marker">
                  <div class="marker-index">
                       <div class="index">${index + 1}</div>
                      <div class="title">${item.name}</div>
                  </div>
              </div>`
        })
    }
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
