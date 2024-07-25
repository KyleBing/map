<template>
    <div class="map-container">
        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>
        <div class="float-panel">
            <!-- 搜索面板 -->
            <div class="search-panel card mb-1">
                <ElForm inline @submit="search" size="small" label-width="80px">
                    <ElFormItem class="mb-0" label="搜索地址">
                        <ElInput style="width: 200px" placeholder="输入较完整的地址" v-model="searchAddress"></ElInput>
                    </ElFormItem>
                    <ElFormItem class="mb-0" label="">
                        <ElButton type="primary" @click="search" icon="Search">搜索</ElButton>
                    </ElFormItem>
                </ElForm>

                <ElForm inline class="mt-1" size="small" >
                    <ElFormItem class="mb-0" label="经度" label-width="80px">
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

            <RoutePanel
                ref="routePanel"
                class="mt-1"
                @pointAdd="handleAddRoutePoint"
                @print="printRoute"
                @showLine="showLine"
                @changeCurrentPolicy="changePolicy"
                :policyArray="policyArray"
                :policy="currentPolicy"
                :lng="positionPicked.lng"
                :lat="positionPicked.lat"
                v-model="routeData"
            />
        </div>
        <route-detail-panel
            class="detail-panel mt-1"
            v-if="activeLineObj"
            :line="activeLineObj"
        />

    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader';
import ICON from "@/assets/icons";
import RoutePanel from "@/page/tool/route/components/RoutePanel.vue";
import {key_web_js} from "@/mapConfig";
import RouteDetailPanel from "@/page/route/components/RouteDetailPanel.vue";
import axios from "axios";
import {policyArray} from "@/page/route/DrivingPolicy";
import {useProjectStore} from "@/pinia";

const MY_POSITION = [117.129533, 36.685668]
let AMap = null
export default {
    name: "ToolRoute",
    components: {RouteDetailPanel, RoutePanel},
    data() {
        return {
            store: useProjectStore(),

            activeLineObj: null,
            isLoading: false,
            map: null,
            currentRouting: null,  // 当前导航路线
            routeData: [
/*                {
                    name: '',
                    position: [lng,lat]
                    note: '', // 备注
                },*/
            ], // 对应点的范围数据

            policyArray,
            currentPolicy: 2, // 当前路径规则策略
            positionPicked: {
                lng: 0,
                lat: 0,
            },

            address: '',  // 地址搜索关键字
            resultText: ''
        }
    },
    mounted() {
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
            .then(map => {
                AMap = map
                this.map = new AMap.Map('container', {
                    center: MY_POSITION,
                    zoom: 11
                })

                // this.map.addControl(new AMap.ToolBar())
                this.map.addControl(new AMap.Scale())
                this.map.addControl(new AMap.Geolocation())

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

                geolocation.getCurrentPosition(this.setMapCenterToUserLocation)

                // 地图选点操作
                this.map.on('click', res => {
                    this.positionPicked = {
                        lng: res.lnglat.lng,
                        lat: res.lnglat.lat
                    }
                })

            })
            .catch(e => {
                console.log(e);
            })

    },
    methods: {
        changePolicy(policy){
            this.currentPolicy = policy
        },
        search(){
            const url = 'https://restapi.amap.com/v3/geocode/geo'
            axios({
                url,
                method: 'get',
                params: {
                    key: mapConfig.key_service,
                    address: this.address
                }
            })
                .then(response => {
                    let res = response.data
                    let geoLocation = res.geocodes[0].location
                    let locationInfo = res.geocodes[0]
                    console.log(geoLocation)
                    let locationArray = geoLocation.split(',')

                    this.positionPicked = {
                        lng: Number(locationArray[0]),
                        lat: Number(locationArray[1])
                    }
                    this.resultText = `${locationInfo.level}：${locationInfo.formatted_address}`

                    // 定位地图中心到搜索的地点
                    this.map.setCenter(locationArray, false, 1000)

                    this.$refs.routePanel.pointerName = this.address

                })
        },
        // 添加新标记点和圆圈
        handleAddRoutePoint(routePoint){
            this.routeData.unshift({
                name: routePoint.name,
                position: [this.positionPicked.lng, this.positionPicked.lat],
                note: routePoint.note,
            })
            this.map.setCenter(routePoint.position) // 定位到中心位置
            this.addMarker(this.map, {
                position: routePoint.position,
                name: routePoint.name,
                note: routePoint.note
            })
        },

        // 设置地图中心点：用户坐标
        setMapCenterToUserLocation(status, res){
            console.log(res)
            if (status === 'complete') {
                let center = [res.position.lng, res.position.lat]
                this.map.setCenter(center)
                this.addMarker(this.map, {
                    position: center,
                    name: '我',
                    note: ''
                })
            } else {
                console.log(res)
            }
        },
        // 结束拾取坐标
        pickLocationStop() {
            this.map.off('click', this.showLocation)
        },

        // 打印 路线数据
        printRoute(){
            console.log(JSON.stringify([...this.routeData].reverse()))
        },

        // 展示规划的路线
        showLine(){
            this.map.clearMap() // 删除地图上的所有标记
            if (this.currentRouting){
                this.currentRouting.destroy() // 删除之前的路线
            }
            let lineData = {
                paths: this.routeData,
            }
            this.loadLine(this.map, lineData)
            this.loadLineLabels(this.map, lineData)
        },

        // 载入线路信息
        loadLine(map, line) {
            map.plugin('AMap.DragRoute', () => {
                // path 是驾车导航的起、途径和终点，最多支持16个途经点
                let path = []
                line.paths.forEach(point => {
                    path.unshift(point.position) // 之前存入的是倒序的，所以现在给正过来
                })
                let route = new AMap.DragRoute(map, path, this.currentPolicy, {
                    startMarkerOptions: {
                        offset: new AMap.Pixel(-13, -40),
                        icon: new AMap.Icon({ // 设置途经点的图标
                            size: new AMap.Size(26, 40),
                            image: ICON.start,
                            // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                            imageSize: new AMap.Size(26, 40) // 指定图标的大小，可以压缩图片

                        }),
                    },
                    endMarkerOptions: {
                        offset: new AMap.Pixel(-13, -40),
                        icon: new AMap.Icon({ // 设置途经点的图标
                            size: new AMap.Size(26, 40),
                            image: ICON.end,
                            // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                            imageSize: new AMap.Size(26, 40) // 指定图标的大小，可以压缩图片

                        }),
                    },
                    midMarkerOptions: {
                        offset: new AMap.Pixel(-5, -10),
                        icon: new AMap.Icon({ // 设置途经点的图标
                            size: new AMap.Size(15, 15),
                            image: ICON.midIcon,
                            // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                            imageSize: new AMap.Size(15, 15) // 指定图标的大小，可以压缩图片

                        }),
                    },
                })

                route.on('complete', res => {
                    // 路线规划完成后，返回的路线数据：设置距离、行驶时间
                    let lineData = res.data.routes[0]
                    let distance =  (lineData.distance / 1000).toFixed(1) // m -> km
                    let time = (lineData.time / 60).toFixed() // second -> min
                    this.activeLineObj = {
                        name: '临时路线'
                    }
                    this.$set(this.activeLineObj, 'distance', distance)
                    this.$set(this.activeLineObj, 'time', time)
                })


                // 切换线路之前如果存在路线，销毁已存在的路线
                if (this.currentRouting){
                    this.currentRouting.destroy()
                    this.currentRouting = null
                }
                this.currentRouting = route

                // 查询导航路径并开启拖拽导航
                this.currentRouting.search()
            })
        },

        // 添加路线 label 线路信息
        loadLineLabels(map, line) {
            line.paths.forEach((item, index) => {
                this.addMarker(map, item, index)
            })
        },
        addMarker(map, item, index) {
            if (item.img){
                let marker = new AMap.Marker({
                    position: item.position,
                    content: `
               <div class="marker">
                  <div class="marker-index">
                       <div class="index">${index + 1}</div>
                      <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note">${item.note.replaceAll('|', '<br>')}</div>
                       <div class="view">
                           <a target="_blank" href="${item.img + '-' + mapConfig.thumbnail1500_suffix}">
                              <img src="${item.img + '-' + mapConfig.thumbnail1000_suffix}" alt="view">
                           </a>
                       </div>
                  </div>
               </div>`,
                })
                map.add(marker)
            } else {
                let marker = new AMap.Marker({
                    position: item.position,
                    content: `
               <div class="marker">
                  <div class="marker-index">
                       <div class="index">${index + 1}</div>
                       <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note">${item.note.replaceAll('|', '<br>')}</div>
                  </div>
               </div>`,
                })
                map.add(marker)
            }
        }

    },
    watch: {
        routeData(newValue){
            if (newValue.length <= 0) return
            this.map.clearMap()
            newValue.forEach((item,index) => {
                this.addMarker(this.map, item, index)
            })
        },
        currentPolicy(newValue){
            this.showLine()
        }
    },
    beforeDestroy() {
        this.map.destroy() // 销毁地图，释放内存
        this.map = null
    }
}


</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";
.map-container {
    position: relative;
}
.float-panel{
    width: 500px;
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
