<template>
    <div class="map-container">
        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>
        <route-detail-panel :line="{
            name: '济南常用地点停车收费说明',
            area: '山东济南',
            note: `记录一些自己常用的济南停车区域的停车价格说明`
        }"/>
    </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
import {key_web_js} from "@/mapConfig";
const MAP_CENTER =  [117.129533, 36.685668]
import locations from './parkingLocations.json'
import RouteDetailPanel from "@/page/route/components/RouteDetailPanel.vue";
import {useProjectStore} from "@/pinia";
let AMap = null
const store = useProjectStore()


export default {
    name: "ParkingInfo",
    components: {RouteDetailPanel},
    data() {
        return {
            isLoading: false,
            map: null,
            markers: locations
        }
    },
    mounted() {
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
            .then(map => {
                AMap = map
                this.map = new AMap.Map('container', {
                    center: MAP_CENTER,
                    zoom: 11, // 缩放级别
                })

                this.map.addControl(new AMap.ToolBar())
                this.map.addControl(new AMap.Scale())


                this.markers.forEach((item, index) => {
                    this.addMarker(this.map, item, index)
                })

            })
            .catch(e => {
                console.log(e)
            })

    },
    methods: {
        addMarker(map, item, index) {
            let marker = new AMap.Marker({
                position: item.position,
                offset: new AMap.Pixel(0,-20),
                content: `
              <div class="marker">
                  <div class="marker-index">
<!--                       <div class="index">${index + 1}</div>-->
                      <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note">${item.note.replace(/\|/, '<br>')}</div>
                  </div>
               </div>
`,
            })
            map.add(marker)
        }
    },
    beforeDestroy() {
        this.map.clearInfoWindow() // 清除地图上的信息窗体
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
