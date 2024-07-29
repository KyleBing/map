<template>
    <div class="map-container">
        <div class="card p-1 float-panel"
             @click="isPointerListShowed = true">
            <div class="mb-2">
                <input accept=".gpx" id="inputFile" type="file" @change="fileChange($event.target.files)">
                <label for="inputFile">
                    <ElTag size="small" type="primary" icon="el-icon-tickets">选择 gpx 文件</ElTag>
                </label>
            </div>

            <ElDescriptions border size="small" :column="1" direction="horizontal" v-if="xmlObj && xmlObj.gpx">
                <ElDescriptionsItem label="文件名">{{xmlFile.name}}</ElDescriptionsItem>
                <ElDescriptionsItem label="路线名">{{xmlObj.gpx.trk.name}}</ElDescriptionsItem>
                <ElDescriptionsItem label="数据点">{{pathPointers.length}}个</ElDescriptionsItem>
                <ElDescriptionsItem label="时间">{{dateFormatter(new Date(pathPointers[0].time))}} ~ {{dateFormatter(new Date(pathPointers[pathPointers.length - 1].time), 'hh:mm:ss')}}</ElDescriptionsItem>
                <ElDescriptionsItem label="总用时">{{timeCost}} 分钟</ElDescriptionsItem>
                <ElDescriptionsItem v-if="path" label="总长">{{pathLength}}</ElDescriptionsItem>
            </ElDescriptions>

            <ElForm inline size="small" class="mt-1" label-width="70px">

                <div class="move-pad mb-1">
                    <div class="up">
                        <ElButton size="small"  @click=offsetMoveUp(5) type="primary" class="p-1">↑</ElButton>
                    </div>
                    <div class="middle">
                        <ElButton size="small"  @click=offsetMoveLeft(5) type="primary" class="mr-2 p-1" >←</ElButton>
                        <ElButton size="small"  @click=offsetMoveRight(5) type="primary" class="ml-2 p-1" >→</ElButton>
                    </div>
                    <div class="down">
                        <ElButton size="small"  @click=offsetMoveDown(5) type="primary" class="p-1">↓</ElButton>
                    </div>
                </div>
                <ElFormItem label="偏移量" class="mb-1">
                    <ElInput type="number" :step="5" v-model="offsetN">
                        <template #prepend>向北</template>
                        <template #append>米</template>
                    </ElInput>
                </ElFormItem>
                <ElFormItem label="偏移量" class="mb-1">
                    <ElInput type="number" :step="5" v-model="offsetE">
                        <template #prepend>向东</template>
                        <template #append>米</template>
                    </ElInput>
                </ElFormItem>
                <ElFormItem label="间隔点" class="mb-1">
                    <ElInput type="number" :step="5" v-model="gapCount">
                        <template #prepend>间隔</template>
                        <template #append>个数据点</template>
                    </ElInput>
                </ElFormItem>
            </ElForm>

            <div class="mt-1">
                <ElButton type="primary" size="small" icon="PriceTag" @click="toggleMarkerDisplay">{{isMarkerShowed? '隐藏': '显示'}}标签</ElButton>
                <ElButton type="primary" size="small" icon="Location" @click="togglePathDisplay">{{isPathShowed? '隐藏': '显示'}}路径</ElButton>
                <!--                <ElButton type="success" size="small" icon="el-icon-suitcase-1" @click="saveMapConfig">保存偏移量设置</ElButton>-->
                <!--                <ElButton type="success" size="small" icon="el-icon-medal-1" @click="toggleKmDisplay"-->
                <!--                           v-if="pathPointers[0] && pathPointers[0].extensions && pathPointers[0].extensions.distance">切换公里数显示</ElButton>-->
            </div>
        </div>

        <!-- 地图 -->
        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>

        <!-- DETAIL INFO -->
        <PointerDetailPanel
            v-if="activePointerObj && (!store.isInPortraitMode || !isPointerListShowed)"
            :pointer="activePointerObj"
            @openInGaodeApp="openInGaodeApp"
        />
    </div>
</template>

<script lang="ts" setup>
import AMapLoader from '@amap/amap-jsapi-loader'
import PointerDetailPanel from "../pointer/components/PointerDetailPanel.vue"
import {key_web_js} from "@/mapConfig";
import pointerApi from "@/api/pointerApi";
import {XMLParser, XMLBuilder, XMLValidator} from "fast-xml-parser"

import {Base64} from "js-base64"
import PointerListPanel from "../pointer/components/PointerListPanel.vue";
import {dateFormatter} from "@/utility";
import ICON from "@/assets/icons";

import Moment from "moment"
import { colors } from "@/lib/colors";
import {useProjectStore} from "@/pinia";
import {useRoute, useRouter} from "vue-router";
import {computed, onMounted, onUnmounted, ref, watch} from "vue";


const store = useProjectStore()
const route = useRoute()
const router = useRouter()

const MY_POSITION = [117.129533, 36.685668]
let AMap = null
let map = null
let loca = null // LOCA
let cluster = null  // 点聚合的对象


const isLoading = ref(false)
const currentPointerId = ref(0)
const activePointerObj = ref(null) // 当前 Line 对象

// xml
const xmlFile = ref(null)
const xmlText = ref('')
const xmlObj = ref(null)

// 偏移量
const offsetN = ref(45) // 北
const offsetE = ref(545) // 东
const gapCount = ref(100) // 间隔多少个数据点展示一个 marker

// 路径
const path = ref(null)
const isPathShowed = ref(true)

// 路径上的 markers
const isMarkerShowed = ref(true)

interface EntityGpxPoint{
    height: number,
    lnglat: any,
    label: string,
}
const pathPointers = ref<Array<EntityGpxPoint>>([])
const markers = ref([])
// 公里标记显示
const kmMarkers = ref([])

// float route list
const isPointerListShowed = true // route list 是否显示




onMounted(() => {
    getMapConfig()

    AMapLoader
        .load({
            key: key_web_js, // 开发应用的 ID
            version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [
                'AMap.ToolBar', // 缩放按钮
                'AMap.Scale', // 比例尺
            ],
            Loca: {
                version: '2.0.0',
            },
            AMapUI: {             // 是否加载 AMapUI，缺省不加载
                version: '1.1',   // AMapUI 缺省 1.1
                plugins: [],       // 需要加载的 AMapUI ui插件
            },
        })
        .then(mapItem => {
            AMap = mapItem
            map = new AMap.Map('container', {
                viewMode: '3D',
                zoom: 20,
                pitch: 32,
                center: MY_POSITION,
                // mapStyle: 'amap://styles/grey',
                showBuildingBlock: true, // 显示建筑物
                // showLabel: false, // 不显示地名什么的
            })
            // 文字图层
            let labelLayer = new AMap.LabelsLayer({
                rejectMapMask: true,
                collision: true,
                animation: true,
            })
            map.add(labelLayer)
            loca = new Loca.Container({
                map: map,
            })
            map.on('complete', () => {
                // loca.animate.start()
            })
        })
        .catch(e => {
            console.log(e)
        })
})


const pathLength = computed(() => {
    let length = path.value.getLength(true)
    if (length > 10000){
        return `${(length/1000).toFixed(2)} km`
    } else {
        return `${length} m`
    }
})
const timeCost = computed(() => {
    let start = Moment(pathPointers.value[0].time)
    let end = Moment(pathPointers.value[pathPointers.value.length - 1].time)
    return end.diff(start, 'minutes')
})




function offsetMoveUp(step: number){
    offsetN.value = Number(offsetN.value) + step
}
function offsetMoveLeft(step: number){
    offsetE.value = Number(offsetE.value) - step
}
function offsetMoveRight(step: number){
    offsetE.value = Number(offsetE.value) + step
}
function offsetMoveDown(step: number){
    offsetN.value = Number(offsetN.value) - step
}
function getMapConfig() {
    let configString = localStorage.getItem('MapConfig')
    if (configString) {
        offsetE.value = Number(JSON.parse(configString).offset.E)
        offsetN.value = Number(JSON.parse(configString).offset.N)
    }
}
function saveMapConfig(){
    localStorage.setItem('MapConfig', JSON.stringify({
        offset: {
            E: offsetE.value,
            N: offsetN.value
        }
    }))
}
function toggleKmDisplay(){
    kmMarkers.value = []
    pathPointers.value.forEach(item => {
        if (item.extensions.distance % 1000 === 0){
            kmMarkers.value.push(item)
        }
    })
    markers.value.forEach(item => item.remove()) // 删除所有 Marker
    kmMarkers.value.forEach(item => {
        addMarker(map, item.lnglat, item.extensions.distance, item.ele)
    })

}
function toggleMarkerDisplay(){
    if (isMarkerShowed.value){
        markers.value.forEach(item => {
            let extData = item.getExtData()
            if (extData && (extData.label === 'start' || extData.label === 'end')){
            } else {
                item.hide()
            }
        })
        isMarkerShowed.value = false
    } else {
        markers.value.forEach(item => {
            let extData = item.getExtData()
            if (extData && (extData.label === 'start' || extData.label === 'end')){
            } else {
                item.show()
            }
        })
        isMarkerShowed.value = true
    }
}
function togglePathDisplay(){
    if (isPathShowed.value){
        path.value.hide()
        isPathShowed.value = false
    } else {
        path.value.show()
        isPathShowed.value = true
    }
}
function fileChange(files: File){
    if(files.length){

        // reset map content
        map.clearInfoWindow() // 清除地图上的信息窗体
        map.clearMap() // 删除所有 Marker

        xmlFile.value = files[0]
        let reader = new FileReader()
        reader.onload = function(){
            xmlText.value = this.result
            let xmlParser = new XMLParser({
                ignoreAttributes: false,  // 读取xml节点的属性值
                attributeNamePrefix : "_"
            })
            xmlObj.value = xmlParser.parse(this.result)
            // console.log(xmlParser.parse(this.result))
            loadAllPointer(true)
        }
        reader.readAsText(xmlFile.value)
    }
}

function showLineLayer(loca, gpxPointers){ // 显示 3D 路径
    let pointers = gpxPointers.map(item => {
        let lnglat = new AMap.LngLat(item._lon, item._lat)
        let lnglatAfterOffset = lnglat.offset(offsetE.value, offsetN.value) // offset 偏移量 E, N 单位：米，这个方法是变更返回值，而不是原对象的值。
        let lnglatArray = lnglatAfterOffset.toArray() // 转成 [lng, lat] 这类数据
        lnglatArray.push(item.ele) // 添加高度信息，变成 [lng, lat, ele] 数据
        return lnglatArray
    })
    console.log(pointers)
    let geoData = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {
                    type: 1
                },
                geometry: {
                    type: "LineString",
                    coordinates: pointers
                }
            }
        ]
    }
    // loca lineLayer
    let lineLayer = new Loca.LineLayer({
        loca: loca,
        zIndex: 120,
        opacity: 1,
        visible: true,
        zooms: [2,20]
    })
    // GEO Data, 这是个标准文件格式，参见: https://geojson.org/
    let geo = new Loca.GeoJSONSource({
        data: geoData
    })
    // 给 Loca.LineLayer 添加数据
    lineLayer.setSource(geo, {
        color: colors.magenta,
        lineWidth: 5,

    })
    // Loca 中添加这个线的图层
    loca.add(lineLayer)
}

function loadAllPointer(isNeedFitToMap = false) {
    map.clearMap() // 删除所有 Marker path
    loca.clear() // 清除所有 loca 上的图层
    isMarkerShowed.value = true
    isPathShowed.value = true

    interface EntityGPXOriginalPoint {
        label: string,  // 手动新增属性
        lnglat?: any,   // 手动新增属性

        ele: number,
        height: number,

        time: string, // 2023-11-18T12:08:53Z
        extensions: {
            heartrate: number,
            distance: number
        },
        _lat: string, // 36.7426527
        _lon: string // 117.0671413
    }


    let pointers = xmlObj.value.gpx.trk.trkseg.trkpt as Array<EntityGPXOriginalPoint>
    pathPointers.value = pointers.map((item, index) => {
        item.lnglat = new AMap.LngLat(item._lon, item._lat)
        item.lnglat = item.lnglat.offset(offsetE.value, offsetN.value) // offset 偏移量 E, N 单位：米

        item.height = item.ele  // 高度，同时保留了原来的 ele 参数

        // 给 pointers 添加 label: start | end，供后续对 marker 的操作
        if (index === 0) {
            item.label = 'start'
        }
        if (index === pointers.length - 1) {
            item.label = 'end'
        }
        return item  // E,N 向东，向北移动距离，单位：米
    })
    loadGpxPath(map, pathPointers.value.map(item => item.lnglat), isNeedFitToMap)
    loadMarkers(map, pathPointers.value)
    showLineLayer(loca, pathPointers.value)
}

function loadGpxPath(map, ptArray: Array<[number, number]>, isNeedFitToMap: boolean){
    path.value = new AMap.Polyline({
        path: ptArray,           // Array<[number, number]>
        isOutline: true,
        outlineColor: '#ffeeff', // 路线边框颜色
        borderWeight: 3,         // 路线边框宽度
        strokeColor: "#3366FF",  // 路线颜色
        strokeOpacity: 1,        // 路线透明度
        strokeWeight: 6,         // 路线宽度
        strokeStyle: "solid",    // solid | dashed
        strokeDasharray: [10, 5],// 虚线间隔
        lineJoin: 'round',       // 折线拐点的绘制样式，默认值为'miter'尖角，其他可选值：'round'圆角、'bevel'斜角
        lineCap: 'round',        // 折线两端线帽的绘制样式，默认值为'butt'无头，其他可选值：'round'圆头、'square'方头
        zIndex: 50,
        height: 200,

        showDir: true,           // 显示方向箭头， 宽度 > 6 时有效
        geodesic: true,         // 是否显示大地线
        extData: {}            // any
    })
    path.value.on('mouseover', data => {
        console.log(data)
    })
    map.add([path.value])
    if (isNeedFitToMap) {
        map.setFitView()
    }
}

function loadMarkers(map, ptArray: Array<EntityGpxPoint>){
    markers.value = []
    ptArray.forEach((item, index) => {
        if (item.label === 'start') {
            // 起点
            addMarker(map, item.lnglat, item.height,'起点', {label: item.label}, // AMap.Marker.extData
                new AMap.Icon({ // 设置途经点的图标
                    size: new AMap.Size(26, 43),
                    image: ICON.start,
                    // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                    imageSize: new AMap.Size(26, 43) // 指定图标的大小，可以压缩图片

                }),
                new AMap.Pixel(-13, -43)
            )
        } else if (item.label === 'end') {
            // 终点
            addMarker(map, item.lnglat, item.height,'终点', {label: item.label}, // AMap.Marker.extData
                new AMap.Icon({ // 设置途经点的图标
                    size: new AMap.Size(26, 43),
                    image: ICON.end,
                    // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                    imageSize: new AMap.Size(26, 43) // 指定图标的大小，可以压缩图片
                }),
                new AMap.Pixel(-13, -43),
            )
        } else {
            if (index % gapCount.value === 0) {
                addMarker(map, item.lnglat, item.height, dateFormatter(new Date(item.time), 'hh:mm'))
                // addMarker(map, item.lnglat, item.extensions.heartrate)
            }
        }
    })
}


function openInGaodeApp() {
    let originLnglat = activePointerObj.value.pointerArray[0].position // [lng, lat]
    let destLnglat = activePointerObj.value.pointerArray[activePointerObj.value.pointerArray.length - 1].position // [lng, lat]
    map.plugin('AMap.Driving', () => {
        let currentDriving = new AMap.Driving({
            map: map,
            policy: AMap.DrivingPolicy.LEAST_TIME
        })
        currentDriving.search(
            new AMap.LngLat(...originLnglat),
            new AMap.LngLat(...destLnglat),
            function (status, result) {
                // result 即是对应的驾车导航信息，相关数据结构文档请参考
                // https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
                if (status === 'complete') {
                    currentDriving.searchOnAMAP({
                        origin: result.origin,
                        destination: result.destination
                    });
                    console.log(status, result)
                    console.log('绘制驾车点图完成')
                } else {
                    console.log('获取驾车数据失败')
                }
            });
    })

}


function getPointerInfo(pointerId) {
    pointerApi
        .detail({
            id: pointerId
        })
        .then(res => {
            activePointerObj.value = res.data
            activePointerObj.value.pointerArray = JSON.parse(Base64.decode(activePointerObj.value.pointers))
            loadPointerLabels(map, activePointerObj.value)
        })
}


function resizeMap() {
    let mapContainer = document.getElementById('container')
    mapContainer.style.height = window.innerHeight + "px"
    mapContainer.style.width = window.innerWidth + "px"
}


/**
 * 获取区域对角线的两点坐标，即这个区域内的最小坐标值和最大坐标值
 *
 * @param pointerArray [[a,b],[c,d]]
 * @return Array {min:number[a,b], max:number[c,d]}
 */
function getMaxBoundsPointer(pointerArray) {
    let lngArray = pointerArray.map(item => item[0])
    let latArray = pointerArray.map(item => item[1])

    return {
        min: [Math.min(...lngArray), Math.min(...latArray)],
        max: [Math.max(...lngArray), Math.max(...latArray)],
    }
}


function addMarker(map, position: [number, number], height: number, name: string, extData: any, icon: string, offset: number) {
    let marker
    if (icon) {
        marker = new AMap.Marker({
            position: position,
            icon: icon,
            offset: offset,
            height,
            extData
        })
    } else {
        marker = new AMap.Marker({
            position: position,
            height,
            content: `<div class="marker no-content">
                          <div class="marker-index">
                              <div class="title">${name}</div>
                          </div>
                       </div>`,
        })
    }
    markers.value.push(marker)
    map.add(marker)
}


/**
 * 偏移操作
 */
watch(offsetN, () => {
    saveMapConfig()
    if (xmlObj.value){
        loadAllPointer()
    }
})
watch(offsetE, () => {
    saveMapConfig()
    if (xmlObj.value){
        loadAllPointer()
    }
})
watch(gapCount, () => {
    if (xmlObj.value){
        loadAllPointer()
    }
})

onUnmounted(() => {
    map.clearInfoWindow() // 清除地图上的信息窗体
    map.clearMap() // 删除所有 Marker
    map.destroy() // 销毁地图，释放内存
    map = null
})
</script>

<style lang="scss" scoped>
@import "../../scss/plugin";

input[type=file] {
    display: none;
}

.btn-router-list {
    position: absolute;
    top: 20px;
    left: 280px;
}

.map-container {
    position: relative
}

.float-panel {
    width: 400px;
    min-height: 100px;
    position: absolute;
    z-index: 1000;
    top: 20px;
    left: 20px;
}

@media (max-width: $screen-width-threshold) {
    .float-panel {
        left: 50%;
        transform: translateX(-50%);
    }
    .btn-router-list {
        left: auto;
        top: 10px;
        right: 10px;
    }
}

.move-pad {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column nowrap;

    .up, .middle, .down {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-flow: row nowrap;
    }

    .up {

    }

    .middle {

    }

    .down {

    }
}
</style>
