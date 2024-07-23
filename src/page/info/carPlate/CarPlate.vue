<template>
    <div class="map-container">
        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>
    </div>
</template>

<script lang="ts" setup>
import AMapLoader from '@amap/amap-jsapi-loader';
import {useProjectStore} from "@/pinia";
import {onMounted, onUnmounted, ref} from "vue";
import {ColorsProvince} from "@/lib/colors.ts";
import {key_web_js} from "@/mapConfig.ts";

// 显示地图行政区的深度
const DEPTH = {
    province: 0, // 省
    city: 1, // 市
    country: 2 // 县、区
}

const store = useProjectStore()

let AMap = null
let map = null
let layerCity = null // 区域图层

const isLoading = ref(false)


const provinceMarkers = [
    {"name": "D", "position": [117.37981, 34.94708], "note": "枣庄"},
    {"name": "H", "position": [116.582207, 35.434777], "note": "济宁"},
    {"name": "R", "position": [115.721485, 35.158462], "note": "菏泽"},
    {"name": "L", "position": [119.14716, 35.612242], "note": "日照"},
    {"name": "Q", "position": [118.194627, 35.317809], "note": "临沂"},
    {"name": "J", "position": [117.052736, 36.012423], "note": "泰安"},
    {"name": "BU", "position": [120.266099, 36.613507], "note": "青岛"},
    {"name": "GV", "position": [118.980753, 36.622718], "note": "潍坊"},
    {"name": "C", "position": [117.886744, 36.618112], "note": "淄博"},
    {"name": "AS", "position": [117.16176, 36.677962], "note": "济南"},
    {"name": "K", "position": [122.050663, 37.177945], "note": "威海"},
    {"name": "FY", "position": [120.834175, 37.314978], "note": "烟台"},
    {"name": "E", "position": [118.602036, 37.606483], "note": "东营"},
    {"name": "M", "position": [117.804433, 37.524612], "note": "滨州"},
    {"name": "N", "position": [116.622374, 37.22365], "note": "德州"},
    {"name": "P", "position": [115.928058, 36.521334], "note": "聊城"}]

onMounted(() => {
    AMapLoader.load({
        key: key_web_js, // 开发应用的 ID
        version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [
            // 'AMap.ToolBar', // 缩放按钮
            'AMap.Scale', // 比例尺
            'AMap.DistrictLayer', // 定位
        ],
    }).then(mapItem => {
        AMap = mapItem
        map = new AMap.Map('container', {
            center: [118.785193, 36.38918],
            zoom: 7.5, // 缩放级别
            mapStyle: 'amap://styles/whitesmoke'
        })

        map.setFeatures(['bg'])
        // bg 区域面
        // point 兴趣点
        // road 道路和道路标记
        // building 建筑物

        // map.addControl(new AMap.ToolBar())
        map.addControl(new AMap.Scale())

        let CodeShandong = 370000
        initPro(CodeShandong, DEPTH.city)
        provinceMarkers.forEach(item => {
            addMarker(map, item)
        })

    }).catch(e => {
        console.log(e)
    })
})

function initPro(code, dep) {
    layerCity && layerCity.setMap(null)
    layerCity = new AMap.DistrictLayer.Province({
        zIndex: 8,
        adcode: [code],
        depth: dep,
        styles: {
            'fill': properties => {
                // properties为可用于做样式映射的字段，包含
                // NAME_CHN:中文名称
                // adcode_pro
                // adcode_cit
                // adcode
                if (properties.adcode.toString().indexOf('37') === 0) {
                    return ColorsProvince[properties.adcode].color
                }
            },
            'province-stroke': 'black',
            'city-stroke': 'white', // 中国地级市边界
            'county-stroke': 'rgba(255,255,255,0.5)' // 中国区县边界
        }
    })

    layerCity.setMap(map)
}

function addMarker(map, item) {
    let marker = new AMap.Marker({
        position: item.position,
        offset: new AMap.Pixel(0,-20),
        content: `
               <div class="marker-plate">
                  <div class="title">${item.name}</div>
                  <div class="note">${item.note.replaceAll('|', '<br>')}</div>
               </div>`,
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
