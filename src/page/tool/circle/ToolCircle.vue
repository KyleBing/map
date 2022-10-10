<template>
    <div class="map-container">
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>
        <circle-panel
            @circleAdd="handleCircleAdd"
            :lng="positionPicked.lng"
            :lat="positionPicked.lat"
            v-model="circleData"></circle-panel>
    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader'
import CirclePanel from "@/page/tool/circle/components/CirclePanel"

import { mapState } from 'vuex'
import mapConfig from "../../../mapConfig";


const MY_POSITION = [117.129533, 36.685668]
let AMap = null
export default {
    name: "ToolCircle",
    components: {CirclePanel},
    data() {
        return {
            isLoading: false,
            contentHeight: 400,
            map: null,
            circleData: [
/*                {
                    name: '',
                    center: [lng,lat]
                    radius: 2.4, // 半径
                    color: '#000000' //
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
            key: mapConfig.appId, // 开发应用的 ID
            version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [
                // 'AMap.ToolBar', // 缩放按钮
                'AMap.Scale', // 比例尺
                'AMap.Geolocation', // 定位
            ],
        }).then(map => {
            AMap = map
            this.map = new AMap.Map('container', {
                center: MY_POSITION,
                zoom: 11
            })

            // this.map.addControl(new AMap.ToolBar())
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
            console.log(e)
        })

    },
    computed: {
        ...mapState(['windowInsets'])
    },
    methods: {
        // 添加新标记点和圆圈
        handleCircleAdd(circle){
            this.circleData.push({
                name: circle.name,
                center: [this.positionPicked.lng, this.positionPicked.lat],
                radius: circle.radius,
                color: '#00b8e5',
            })
            this.addMarker(this.map, {
                position: circle.center,
                name: circle.name,
                note: circle.radius + ' km'
            })
            this.addCircle(this.map, circle.center, '#00b8e5', circle.radius)
        },

        // 设置地图中心点：用户坐标
        setMapCenterToUserLocation(status, res){
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

        addCircle(map, position, borderColor, radius) {
            let circle = new AMap.Circle({
                center: position,         // 圆心位置
                radius: radius * 1000,    // 圆半径
                // fillColor: '#ffffff',       // 圆形填充颜色
                // fillOpacity: 0.3,           // 填充透明度
                strokeColor: borderColor, // 描边颜色
                strokeOpacity: 1,         // 描边透明度
                strokeWeight: 2,          // 描边宽度
            })
            map.add(circle)
        },
        addMarker(map, item) {
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
        circleData(newValue){
            if (this.map){
                this.map.clearMap()
            }
            if (newValue.length > 0){
                newValue.forEach(item => {
                    this.addCircle(this.map, item.center, item.color, item.radius)
                    this.addMarker(this.map, {
                        position: item.center,
                        name: item.name,
                        note: item.radius + ' km'
                    })
                })
            }
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


</style>
