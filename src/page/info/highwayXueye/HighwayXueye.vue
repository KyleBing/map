<template>
    <div class="map-container">
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>
        <route-detail-panel :line="{
            name: '济南籍莱钢段高速免费通行政策',
            area: '山东济南',
            road_type: '高速',
            note: `自 2022年12月1日 起，济南鲁A、鲁S车牌的小型客车（9座以下），在以下特定出入口通行高速的时候走 ETC 通道免费通行。
                官方说明地址：[济南市人民政府官方说明： 济莱高速济南籍小客车12月起免费通行](http://www.jinan.gov.cn/art/2022/11/17/art_1812_4932979.html)
           `
        }"/>
    </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
import { mapState } from 'vuex'
import mapConfig from "../../../mapConfig";
const MAP_CENTER = [117.582719, 36.42146]
import locations from './locations.json'
import RouteDetailPanel from "@/page/route/components/RouteDetailPanel.vue";
let AMap = null

export default {
    name: "HighwayXueye",
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
                key: mapConfig.appId, // 开发应用的 ID
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
                    zoom: 10, // 缩放级别
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
    computed: {
        ...mapState(['windowInsets'])
    },
    methods: {
        addMarker(map, item, index) {
            let marker = new AMap.Marker({
                position: item.position,
                offset: new AMap.Pixel(0,-20),
                content: `
              <div class="marker">
                  <div class="marker-index">
                       <div class="index">${index + 1}</div>
                      <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note">${item.note.replaceAll('|', '<br>')}</div>
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
