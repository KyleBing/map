<template>
    <div class="map-container">
        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>
    </div>
</template>

<script lang="ts" setup>
import AMapLoader from '@amap/amap-jsapi-loader';
import {useProjectStore} from "@/pinia";
import {onMounted, onUnmounted, ref} from "vue";
import {key_web_js} from "@/mapConfig.ts";

// 显示地图行政区的深度
const DEPTH = {
    province: 0, // 省
    city: 1, // 市
    country: 2 // 县、区
}

let AMap = null
let map = null
let layerCity = null // 区域图层


const store = useProjectStore()
const isLoading = ref(false)


let provinceMap = new Map()
const provinces = [
    { 'name': '北京市',          isAllow: true, position: '116.407394,39.904211', note: '' },
    { 'name': '天津市',          isAllow: true, position: '117.200983,39.084158', note: '' },
    { 'name': '河北省',          isAllow: true, position: '114.530235,38.037433', note: '' },
    { 'name': '山西省',          isAllow: true, position: '112.562678,37.873499', note: '' },
    { 'name': '内蒙古自治区',     isAllow: true, position: '111.76629,40.81739', note: '' },
    { 'name': '辽宁省',          isAllow: true, position: '123.431382,41.836175', note: '' },
    { 'name': '吉林省',          isAllow: false, position: '125.32568,43.897016', note: '' },
    { 'name': '黑龙江省',        isAllow: true, position: '126.661665,45.742366', note: '' },
    { 'name': '上海市',          isAllow: false, position: '121.473662,31.230372', note: '' },
    { 'name': '江苏省',          isAllow: false, position: '118.762765,32.060875', note: '' },
    { 'name': '浙江省',          isAllow: false, position: '120.152585,30.266597', note: '' },
    { 'name': '安徽省',          isAllow: true, position: '117.329949,31.733806', note: '' },
    { 'name': '福建省',          isAllow: false, position: '119.295143,26.100779', note: '' },
    { 'name': '江西省',          isAllow: false, position: '115.81635,28.63666', note: '' },
    { 'name': '山东省',          isAllow: false, position: '117.019915,36.671156', note: '' },
    { 'name': '河南省',          isAllow: false, position: '113.753394,34.765869', note: '' },
    { 'name': '湖北省',          isAllow: true, position: '114.341745,30.546557', note: '' },
    { 'name': '湖南省',          isAllow: true, position: '112.9836,28.112743', note: '' },
    { 'name': '广东省',          isAllow: true, position: '113.26641,23.132324', note: '' },
    { 'name': '广西壮族自治区',   isAllow: true, position: '108.327546,22.815478', note: '' },
    { 'name': '海南省',          isAllow: false, position: '110.349228,20.017377', note: '' },
    { 'name': '重庆市',          isAllow: false, position: '106.551643,29.562849', note: '' },
    { 'name': '四川省',          isAllow: false, position: '104.075809,30.651239', note: '' },
    { 'name': '贵州省',          isAllow: false, position: '106.70546,26.600055', note: '' },
    { 'name': '云南省',          isAllow: true, position: '102.710002,25.045806', note: '' },
    { 'name': '西藏自治区',       isAllow: true, position: '91.117525,29.647535', note: '' },
    { 'name': '陕西省',          isAllow: false, position: '108.954347,34.265502', note: '' },
    { 'name': '甘肃省',          isAllow: false, position: '103.826447,36.05956', note: '' },
    { 'name': '青海省',          isAllow: false, position: '101.780268,36.620939', note: '' },
    { 'name': '宁夏回族自治区',   isAllow: false, position: '106.259126,38.472641', note: '' },
    { 'name': '新疆维吾尔自治区', isAllow: true, position: '87.627704,43.793026', note: '' },
    { 'name': '台湾省',          isAllow: false, position: '121.509062,25.044332', note: '' },
    { 'name': '香港特别行政区',   isAllow: false, position: '114.171203,22.277468', note: '' },
    { 'name': '澳门特别行政区',   isAllow: false, position: '113.543028,22.186835', note: '' }
]

onMounted(() => {
    generateProvinceMap()
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

        initPro(DEPTH.province)
        provinces.forEach(item => {
            item.position = item.position.split(',')
            addMarker(map, item)
        })

    }).catch(e => {
        console.log(e)
    })
})

function generateProvinceMap(){
    provinceMap = new Map()
    provinces.forEach(item => {
        provinceMap.set(item.name, item)
    })
}
function initPro(dep) {
    layerCity && layerCity.setMap(null)
    layerCity = new AMap.DistrictLayer.Province({
        zIndex: 7,
        depth: dep,
        styles: {
            'fill': properties => {
                // properties为可用于做样式映射的字段，包含
                // NAME_CHN:中文名称
                // adcode_pro
                // adcode_cit
                // adcode
                console.log(properties)
                if (provinceMap.get(properties.NAME_CHN).isAllow) {
                    return "rgb(113,182,153)"
                } else {
                    return "rgb(205,087,085)"
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
                  <div class="note">${item.note.replace(/\|/, '<br>')}</div>
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
