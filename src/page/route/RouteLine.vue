<template>
    <div class="map-container">
        <div class="button-float btn-router-list"
             @click="isRouteListShowed = true"
             v-if="!isRouteListShowed && store.isInPortraitMode">
            <ElIcon><Tickets/></ElIcon>
        </div>

        <!-- 路线列表 -->
        <div class="float-route-list-panel" v-if="isRouteListShowed" :style="`height: ${store.windowInsets.height - 40}px`">
            <RouteLineListPanel
                @choseLine="changeLine"
                @labelToggle="toggleLabel"/>
        </div>

        <!-- DETAIL INFO -->
        <RouteDetailPanel
            v-if="activeLineObj && (!store.isInPortraitMode || !isRouteListShowed)"
            :line="activeLineObj"
            :drivingInfo="drivingInfo"
            @openInGaodeApp="openInGaodeApp"
        />

        <!-- 地图 -->
        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>


    </div>
</template>

<script lang="ts" setup>
import AMapLoader from '@amap/amap-jsapi-loader'
import ICON from "@/assets/icons"
import RouteDetailPanel from "./components/RouteDetailPanel.vue"

import {Base64} from "js-base64"
import RouteLineListPanel from "@/page/route/components/RouteLineListPanel.vue";
import axios from "axios";
import {useProjectStore} from "@/pinia";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {key_service, key_web_js, thumbnail1000_suffix, thumbnail1500_suffix} from "@/mapConfig.ts";
import {EntityRoute} from "@/page/route/Route.ts";
import routeApi from "@/api/routeApi.ts";

const MY_POSITION = [117.129533, 36.685668]

let AMap = null
let mapInstance = null
let currentDragRouting = null  // 当前导航路线


const store = useProjectStore()
const route = useRoute()
const router = useRouter()

const isLoading = ref(false)
const activeLineObj = ref<EntityRoute>(null) // 当前 Line 对象

const isMarkerShowed = ref(true)
const currentMarkers = ref([]) // 地图上的 markers

// Driving Info
const drivingInfo = ref({
    distance: '',
    time: ''
})

onMounted(() => {
    AMapLoader
        .load({
            key: key_web_js, // 开发应用的 ID
            version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [
                'AMap.ToolBar', // 缩放按钮
                'AMap.Scale', // 比例尺
                'AMap.DragRoute', // 拖拽路线
                'AMap.Driving', // 导航
            ],
        })
        .then(mapItem => {
            AMap = mapItem
            mapInstance = new AMap.Map('container', {
                center: MY_POSITION,
                zoom: 11
            })
            mapInstance.addControl(new AMap.ToolBar())
            mapInstance.addControl(new AMap.Scale())
            if (route.query.lineId) {
                getLineInfo(route.query.lineId!)
            }
        })
        .catch(e => {
            console.log(e)
        })
})

// 切换路线的标签显示
function toggleLabel(){
    currentMarkers.value.forEach(item => {
        if (isMarkerShowed.value){
            item.hide()
        } else {
            item.show()
        }
    })
    isMarkerShowed.value = !isMarkerShowed.value
}
function openInGaodeApp(){
    let originLnglat = activeLineObj.value.pathArray[0].position // [lng, lat]
    let destLnglat = activeLineObj.value.pathArray[activeLineObj.value.pathArray.length - 1].position // [lng, lat]
    mapInstance.plugin('AMap.Driving', () => {
        let currentDriving = new AMap.Driving({
            map: mapInstance,
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
                        origin:result.origin,
                        destination:result.destination
                    });
                    console.log(status, result)
                    console.log('绘制驾车路线完成')
                } else {
                    console.log('获取驾车数据失败')
                }
            });
    })
}


// change line
function changeLine(lineId: number){
    router.push({
        name: 'RouteLine',
        query: {
            lineId
        }
    })
    if (innerWidth < 500){
        isRouteListShowed.value = false
    }
}

function getLineInfo(lineId: string) {
    routeApi
        .detail({
            id: lineId
        })
        .then(res => {
            activeLineObj.value = res.data
            activeLineObj.value.pathArray = JSON.parse(Base64.decode(activeLineObj.value.paths))
            loadLine(mapInstance, activeLineObj.value)
            loadLineLabels(mapInstance, activeLineObj.value)
        })
}

function resizeMap() {
    let mapContainer = document.getElementById('container')!
    mapContainer.style.height = window.innerHeight + "px"
    mapContainer.style.width = window.innerWidth + "px"
}

// 载入路线信息
function loadLine(map, line) {
    currentMarkers.value = []
    isMarkerShowed.value = true

    // 切换线路之前如果存在路线，销毁已存在的路线
    if (currentDragRouting) {
        currentDragRouting.destroy()
        currentDragRouting = null
    }
    map.plugin('AMap.DragRoute', () => {
        // path 是驾车导航的起、途径和终点，最多支持16个途经点
        let path = line.pathArray.map (item => item.position)
        currentDragRouting = new AMap.DragRoute(map, path, line.policy, {
            startMarkerOptions: {
                offset: new AMap.Pixel(-13, -43),
                icon: new AMap.Icon({ // 设置途经点的图标
                    size: new AMap.Size(26, 43),
                    image: ICON.start,
                    // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                    imageSize: new AMap.Size(26, 43) // 指定图标的大小，可以压缩图片

                }),
            },
            endMarkerOptions: {
                offset: new AMap.Pixel(-13, -43),
                icon: new AMap.Icon({ // 设置途经点的图标
                    size: new AMap.Size(26, 43),
                    image: ICON.end,
                    // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                    imageSize: new AMap.Size(26, 43) // 指定图标的大小，可以压缩图片

                }),
            },
            midMarkerOptions: {
                offset: new AMap.Pixel(-9, -9),
                icon: new AMap.Icon({ // 设置途经点的图标
                    size: new AMap.Size(30, 30),
                    image: ICON.midIcon,
                    // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                    imageSize: new AMap.Size(18, 18) // 指定图标的大小，可以压缩图片

                }),
            },
        })

        // 路线规划完成时
        currentDragRouting.on('complete', res => {
            // 路线规划完成后，返回的路线数据：设置距离、行驶时间
            let lineData = res.data.routes[0]
            let distance =  (lineData.distance / 1000).toFixed(1) // m -> km
            let time = (lineData.time / 60).toFixed() // second -> min

            fetchWeatherFromRoute(lineData.steps)

            activeLineObj.value.distance = distance
            activeLineObj.value.time = time

            drivingInfo.value.distance = distance
            drivingInfo.value.time = time
        })

        // 查询导航路径并开启拖拽导航
        currentDragRouting.search()
    })
}

function fetchWeatherFromRoute(steps){
    let districtsMap = new Map()
    steps.forEach(item => {
        item.cities && item.cities.forEach(city => {
            city.districts.forEach(district => {
                if (districtsMap.has(district.adcode)){

                } else {
                    districtsMap.set(district.adcode, {name: [city.name, district.name], adcode: district.adcode})
                }
            })
        })
    })

    let weatherRequestArray = []
    districtsMap.forEach((value,key) => {
        weatherRequestArray.push(getWeather(key))
    })

    axios
        .all(weatherRequestArray)
        .then(response => {
            let weatherString = '\n\n### 途经地天气信息\n\n'
            response.forEach((res, index) => {
                let weatherData = res.data.lives[0]
                weatherString = weatherString.concat(`${index + 1}. ${weatherData.province}-${weatherData.city}: ${weatherData.temperature}℃ | ${weatherData.humidity}%RH, ${weatherData.weather}\n`)
            })
            activeLineObj.value.note = activeLineObj.value.note.concat(weatherString)
        })
}

function getWeather(adcode: string){
    return axios({
        url: 'https://restapi.amap.com/v3/weather/weatherInfo',
        params: {
            key: key_service,
            city: adcode
        }
    })
}

// 添加路线 Label
function loadLineLabels(map, line) {
    line.pathArray.forEach((item, index) => {
        addMarker(map, item, index)
    })
}
function addMarker(map, item, index) {
    let marker
    if (item.img){
        marker = new AMap.Marker({
            position: item.position,
            title: item.note,
            draggable: false,
            content: `
               <div class="marker ${(item.note || item.img) ? '': 'no-content'}">
                  <div class="marker-index">
                       <div class="index">${index + 1}</div>
                      <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note">${item.note.replaceAll('|', '<br>')}</div>
                       <div class="view">
                           <a target="_blank" href="${item.img + '-' + thumbnail1500_suffix}">
                              <img src="${item.img + '-' + thumbnail1000_suffix}" alt="view">
                           </a>
                       </div>
                  </div>
               </div>`,
        })
    } else {
        marker = new AMap.Marker({
            position: item.position,
            title: item.note,
            draggable: false,
            content: `
                           <div class="marker ${(item.note || item.img) ? '': 'no-content'}">
                              <div class="marker-index">
                                   <div class="index">${index + 1}</div>
                                   <div class="title">${item.name}</div>
                              </div>
                              <div class="marker-content">
                                   <div class="note">${item.note.replaceAll('|', '<br>')}</div>
                              </div>
                           </div>`,
        })
    }
    currentMarkers.value.push(marker)
    map.add(marker)
}

// float route list
const isRouteListShowed = ref(true) // route list 是否显示


watch(()=>route.query.lineId, newValue => {
    currentDragRouting && currentDragRouting.destroy() // 销毁行程规划
    mapInstance.clearInfoWindow() // 清除地图上的信息窗体
    mapInstance.clearMap() // 删除所有 Marker
    getLineInfo(newValue)
})

onUnmounted(() => {
    currentDragRouting && currentDragRouting.destroy() // 销毁行程规划
    mapInstance.clearInfoWindow() // 清除地图上的信息窗体
    mapInstance.clearMap() // 删除所有 Marker
    mapInstance.destroy() // 销毁地图，释放内存
    mapInstance = null
})
</script>

<style lang="scss" scoped>
@import "../../scss/plugin";

.btn-router-list{
    position: absolute;
    top: 20px;
    left: 280px;
}

.map-container {
    position: relative
}

.float-route-list-panel{
    min-height: 300px;
    position: absolute;
    z-index: 1000;
    top: 20px;
    left: 20px;
}

@media (max-width: $screen-width-threshold) {
    .float-route-list-panel{
        left: 50%;
        transform: translateX(-50%);
    }
    .btn-router-list{
        left: auto;
        top: 10px;
        right: 10px;
    }
}

</style>
