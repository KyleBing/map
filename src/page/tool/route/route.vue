<template>
    <div class="map-container">
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>
        <route-panel
            @pointAdd="handleAddRoutePoint"
            @print="printRoute"
            @showLine="showLine"
            :lng="positionPicked.lng"
            :lat="positionPicked.lat"
            v-model="routeData"></route-panel>
    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader';
import ICON from "@/page/route/icons";
import RoutePanel from "@/page/tool/route/components/RoutePanel";

import { mapState } from 'vuex'


const MY_POSITION = [117.129533, 36.685668]
let AMap = null
export default {
    name: "tool",
    components: {RoutePanel},
    data() {
        return {
            isLoading: false,
            contentHeight: 400,
            map: null,
            currentRouting: null,  // 当前导航路线
            routeData: [
/*                {
                    name: '',
                    position: [lng,lat]
                    note: '', // 备注
                },*/
            ], // 对应点的范围数据

            positionPicked: {
                lng: 0,
                lat: 0,
            },
        }
    },
    created() {

        this.contentHeight = window.innerHeight

        AMapLoader.load({
            key: "581591b581149549d9035d039e83e368", // 开发应用的 ID
            version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [
                'AMap.ToolBar',
                'AMap.Scale', // 比例尺
                'AMap.Geolocation', // 定位
            ],
            AMapUI: {             // 是否加载 AMapUI，缺省不加载
                version: '1.1',   // AMapUI 缺省 1.1
                plugins: [],       // 需要加载的 AMapUI ui插件
            },
        }).then(map => {
            AMap = map
            this.map = new AMap.Map('container', {
                center: MY_POSITION,
                zoom: 11
            })

            this.map.addControl(new AMap.ToolBar())
            this.map.addControl(new AMap.Scale())

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
            this.map.on('click', res =>{
                this.positionPicked = {
                    lng: res.lnglat.lng,
                    lat: res.lnglat.lat
                }
            })

        }).catch(e => {
            console.log(e);
        })

    },
    computed: {
        ...mapState(['windowInsets'])
    },
    methods: {
        // 添加新标记点和圆圈
        handleAddRoutePoint(routePoint){
            this.routeData.unshift({
                name: routePoint.name,
                position: [this.positionPicked.lng, this.positionPicked.lat],
                note: routePoint.note,
            })
            this.addMarker(this.map, {
                position: routePoint.potition,
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
            console.log(JSON.stringify(this.routeData))
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
                    path.push(point.position)
                })
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
                // 查询导航路径并开启拖拽导航
                route.search()
                this.currentRouting = route
            })
        },

        // 添加路线 label 线路信息
        loadLineLabels(map, line) {
            line.paths.forEach(item => {
                this.addMarker(map, item)
            })
        },
        addMarker(map, item) {
            let marker = new AMap.Marker({
                position: item.position,
                content: `
               <div class="marker">
                  <div class="title">${item.name}</div>
                  <div class="note">${item.note.replaceAll('|', '<br>')}</div>
               </div>`,
            });
            map.add(marker);
        }

    },
    watch: {
        routeData(newValue){
            if (newValue.length <= 0) return
            this.map.clearMap()
            newValue.forEach(item => {
                this.addMarker(this.map, item)
            })
        }
    }
}


</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";
.map-container {
    position: relative;
}

</style>