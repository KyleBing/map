<template>
    <div class="map-container">
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>
        <detail v-if="activeLineObj" :line="activeLineObj"></detail>
        <!-- 在有 activeLineObj 对象之后再显示 -->
    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader'
import mapData from './lines'
import ICON from "@/assets/icons"
import Detail from "./components/Detail"
import {mapState} from "vuex"
import mapConfig from "../../mapConfig";
import routeApi from "@/api/routeApi";

import {Base64} from "js-base64"

const MY_POSITION = [117.129533, 36.685668]
let AMap = null

export default {
    name: "RouteLine",
    components: {Detail},
    data() {
        return {
            isLoading: false,
            map: null,
            colors: mapData.COLORS,
            currentLineId: 0,
            activeLineObj: null, // 当前 Line 对象
            currentRouting: null,  // 当前导航路线
        }
    },
    mounted() {

        AMapLoader.load({
            key: mapConfig.appId, // 开发应用的 ID
            version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [
                'AMap.ToolBar', // 缩放按钮
                'AMap.Scale', // 比例尺
                'AMap.DragRoute', // 定位
            ],
        }).then(map => {
            AMap = map
            this.map = new AMap.Map('container', {
                center: MY_POSITION,
                zoom: 11
            })
            this.map.addControl(new AMap.ToolBar())
            this.map.addControl(new AMap.Scale())
            this.getLineInfo()
        }).catch(e => {
            console.log(e)
        })
    },

    computed: {
        ...mapState(['windowInsets'])
    },
    methods: {
        getLineInfo(){
            if (this.$route.query.routeId) {
                routeApi
                    .detail({
                        id: this.$route.query.routeId
                    })
                    .then(res => {
                        this.activeLineObj = res.data
                        this.activeLineObj.pathArray = JSON.parse(Base64.decode(this.activeLineObj.paths))
                        this.loadLine(this.map, this.activeLineObj)
                        this.loadLineLabels(this.map, this.activeLineObj)
                    })
            } else {
                this.$message.warning('没有指定路线 ID ')
            }
        },

        // 设置地图中心点：用户坐标
        setMapCenterToUserLocation(status, res){
            if (status === 'complete') {
                let center = [res.position.lng, res.position.lat]
                this.map.setCenter(center)
                this.addMarker(this.map, {
                    position: center,
                    name: '你的位置',
                    note: ''
                })
            } else {
                console.log(res)
            }
        },

        resizeMap() {
            let mapContainer = document.getElementById('container')
            mapContainer.style.height = window.innerHeight + "px"
            mapContainer.style.width = window.innerWidth + "px"
        },

        // 载入路线信息
        loadLine(map, line) {

            // path 是驾车导航的起、途径和终点，最多支持16个途经点
            let path = line.pathArray.map (item => item.position)
            let route = new AMap.DragRoute(map, path, AMap.DrivingPolicy.LEAST_FEE, {
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
        },

        // 添加路线 Label
        loadLineLabels(map, line) {
            line.pathArray.forEach(item => {
                this.addMarker(map, item)
            })
        },
        addMarker(map, item) {
            console.log(item)
            let marker = new AMap.Marker({
                position: item.position,
                content: `
               <div class="marker">
                  <div class="title">${item.name}</div>
                  <div class="note">${item.note.replaceAll('|', '<br>')}</div>
               </div>`,
            })
            map.add(marker)
        }

    },
    watch: {
        '$route'(to, from){
            if (this.currentRouting) {
                this.currentRouting.destroy() // 清除当前路线
                this.map.clearMap() // 删除所有 Marker
            }
            this.loadLine(this.map, this.activeLineObj)
            this.loadLineLabels(this.map, this.activeLineObj)
        },
    },
    beforeDestroy() {
        this.map.destroy() // 销毁地图，释放内存
        this.map = null
    }
}
</script>

<style lang="scss" scoped>
.map-container {
    position: relative
}

</style>
