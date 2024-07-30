<template>
    <div class="map-container">
        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>
        <div class="float-panel">
            <!-- 搜索面板 -->
            <div class="search-panel card mb-1">
                <ElForm inline @submit="search" size="small">
                    <ElFormItem class="mb-0" label="搜索地址">
                        <ElInput style="width: 150px" placeholder="输入较完整的地址" v-model="searchAddress"></ElInput>
                    </ElFormItem>
                    <ElFormItem class="mb-0">
                        <ElButton type="primary" @click="search" icon="Search">搜索</ElButton>
                    </ElFormItem>
                </ElForm>

                <ElForm inline class="mt-1" size="small" >
                    <ElFormItem class="mb-0" label="经度">
                        <ElInput style="width:120px" placeholder="lng" v-model="positionPicked.lng"></ElInput>
                    </ElFormItem>
                    <ElFormItem class="mb-0" label="纬度">
                        <ElInput style="width:120px" placeholder="lat" v-model="positionPicked.lat"></ElInput>
                    </ElFormItem>
                </ElForm>
            </div>

            <div class="result card mt-1" v-if="resultText">
                {{resultText}}
            </div>

            <CirclePanel
                ref="refCirclePanel"
                class="mt-1"
                :search-address="resultText"
                :lng="positionPicked.lng"
                :lat="positionPicked.lat"
                v-model="circleData"/>
        </div>


    </div>
</template>

<script lang="ts" setup>

import AMapLoader from '@amap/amap-jsapi-loader'
import CirclePanel from "@/page/tool/circle/components/CirclePanel.vue"
import axios from "axios";
import {useProjectStore} from "@/pinia";
import {useRoute, useRouter} from "vue-router";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {key_service, key_web_js} from "@/mapConfig.ts";
import {generateMarkerContent} from "@/page/MyMapLib.ts";


const refCirclePanel = ref()

const MY_POSITION = [117.129533, 36.685668]
let AMap = null

const store = useProjectStore()
const route = useRoute()
const router = useRouter()


const isLoading = ref(false)

interface EntityCircle {
    name: string,
    center: [number, number]
    radius: number, // 半径
    color?: string //
}

const circleData = ref<Array<EntityCircle>>([]) // 对应点的范围数据
const positionPicked = ref({
    lng: 0,
    lat: 0,
})
const searchAddress = ref('')  // 地址搜索关键字
const resultText = ref('')

onMounted(() => {
    AMapLoader
        .load({
            key: key_web_js, // 开发应用的 ID
            version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [
                // 'AMap.ToolBar', // 缩放按钮
                'AMap.Scale', // 比例尺
                'AMap.Geolocation', // 定位
            ],
        })
        .then(mapItem => {
            AMap = mapItem
            window.map = new AMap.Map('container', {
                center: MY_POSITION,
                zoom: 11
            })

            // map.addControl(new AMap.ToolBar())
            window.map.addControl(new AMap.Scale())
            window.map.addControl(new AMap.Geolocation())

            // 定位
            let geolocation = new AMap.Geolocation({
                // 是否使用高精度定位，默认：true
                enableHighAccuracy: true,
                // 设置定位超时时间，默认：无穷大
                timeout: 10000,
                // 定位按钮的停靠位置的偏移量，默认：Pixel(10, 20)
                buttonOffset: new AMap.Pixel(10, 20),
                //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                zoomToAccuracy: true,
                //  定位按钮的排放位置,  RB表示右下
                buttonPosition: 'RB'
            })

            // 获取用户当前位置
            if (store.isShowUserSelfLocation){
                geolocation.getCurrentPosition(setMapCenterToUserLocation)
            }

            // 地图选点操作
            window.map.on('click', res => {
                positionPicked.value = {
                    lng: res.lnglat.lng,
                    lat: res.lnglat.lat
                }
            })
        })
        .catch(e => {
            console.log(e)
        })
})


function search(){
    const url = 'https://restapi.amap.com/v3/geocode/geo'
    axios({
        url,
        method: 'get',
        params: {
            key: key_service,
            address: searchAddress.value
        }
    })
        .then(response => {
            let res = response.data
            let geoLocation = res.geocodes[0].location
            let locationInfo = res.geocodes[0]
            console.log(geoLocation)
            let locationArray = geoLocation.split(',')

            positionPicked.value = {
                lng: Number(locationArray[0]),
                lat: Number(locationArray[1])
            }
            resultText.value = `${locationInfo.level}：${locationInfo.formatted_address}`

            // 定位地图中心到搜索的地点
            window.map.setCenter(locationArray, false, 1000)

            refCirclePanel.value.name = searchAddress.value
        })
}
// 设置地图中心点：用户坐标
function setMapCenterToUserLocation(status, res){
    if (status === 'complete') {
        let center = [res.position.lng, res.position.lat]
        window.map.setCenter(center)
        addMarker(window.map, {
            position: center,
            name: '我',
            note: ''
        })
    } else {
        console.log(res)
    }
}


function addCircle(map, position: [number, number], borderColor: string = '#52c7f9', radius: number) {
    let circle = new AMap.Circle({
        center: position,         // 圆心位置
        radius: radius * 1000,    // 圆半径
        // fillColor: '#ffffff',       // 圆形填充颜色
        // fillOpacity: 0.3,           // 填充透明度
        strokeColor: borderColor, // 描边颜色
        strokeOpacity: 1,         // 描边透明度
        strokeWeight: 1,          // 描边宽度
    })
    map.add(circle)
}

function addMarker(map, item: EntityCircle, index: number) {
    let marker = new AMap.Marker({
        position: item.center,
        draggable: true,
        content: generateMarkerContent(item.name, `${item.radius} km`),
        extData: {
            arrayIndex: index, // 元素在数组中的位置 index
        }
    })
    marker.on('dragstart', handleMarkerDragging)
    marker.on('dragging', handleMarkerDragStart)
    marker.on('dragend', handleMarkerDragEnd)
    map.add(marker)
}

function handleMarkerDragging(event){
    // console.log(event)
    const markerIndex =  event.target._opts.extData.arrayIndex  // 在新建 marker 的时候提前定义的数据
    circleData.value[markerIndex].center = [event.lnglat.lng, event.lnglat.lat]
}
function handleMarkerDragStart(event){
    // console.log(event)
    const markerIndex =  event.target._opts.extData.arrayIndex  // 在新建 marker 的时候提前定义的数据
    circleData.value[markerIndex].center = [event.lnglat.lng, event.lnglat.lat]
}
function handleMarkerDragEnd(event){
    // console.log(event)
    const markerIndex =  event.target._opts.extData.arrayIndex  // 在新建 marker 的时候提前定义的数据
    circleData.value[markerIndex].center = [event.lnglat.lng, event.lnglat.lat]
}


watch(circleData, newValue => {
    if (window.map){
        window.map.clearMap()
    }
    if (newValue.length > 0){
        newValue.forEach((item, index) => {
            addCircle(window.map, item.center, item.color, item.radius)
            addMarker(
                window.map,
                {
                    center: item.center,
                    name: item.name,
                    radius: item.radius
                },
                index
            )
        })
    }
}, {deep: true})

onUnmounted(() => {
    window.map.clearMap() // 删除地图上的所有标记
    // window.map.destroy() // 销毁地图，释放内存
    // window.map = null
})


</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";
.map-container {
    position: relative;
}
.float-panel{
    width: 400px;
    position: absolute;
    left: 20px;
    top: 20px;
}
.search-panel{
    background-color: white;
    padding: 10px;
}
.result{
    background-color: white;
    padding: 10px;
}

</style>
