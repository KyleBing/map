<template>
    <div class="map-container">
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>
    </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
import { mapState } from 'vuex'
import mapConfig from "../../../mapConfig";
const MY_POSITION = [117.129533, 36.685668]

let AMap = null

export default {
    name: "CarUsed",
    data() {
        return {
            isLoading: false,
            map: null,
            markers: [
                {position: [117.129533, 36.685668]  , phone: '' ,            type: "market",     name: "高新万达"} ,
                {position: [117.100261, 36.658804]  , phone: '' ,            type: "market",     name: "万象城"} ,
                {position: [117.063358, 36.683155]  , phone: '' ,            type: "market",     name: "印象城"} ,
                {position: [117.053734, 36.717434]  , phone: '' ,            type: "market",     name: "华山-环宇城"} ,
                {position: [117.109686, 36.667901]  , phone: '' ,            type: "market",     name: "龙湖天街"} ,
                {position: [117.063358, 36.683155] ,  phone: '' ,            type: "market",     name: "恒隆广场"} ,
                {position: [117.197677, 36.671258] ,  phone: '' ,            type: "market",     name: "融创茂"} ,
                {position: [117.003035, 36.662559] ,  phone: '' ,            type: "market",     name: "经四万达"} ,
                {position: [117.002642, 36.593224] ,  phone: '' ,            type: "market",     name: "贵和"} ,
                {position: [116.981724, 36.612771] ,  phone: '' ,            type: "market",     name: "中海-环宇城"} ,
                {position: [116.978032, 36.649693] ,  phone: '' ,            type: "market",     name: "和谐广场"} ,
                {position: [117.23,36.73] , phone: '' , type: "department", name: "济东二手车市场" } ,
                {position: [117.21,36.72] , phone: '' , type: "department", name: "济钢二手车市场" } ,
                {position: [116.83,36.63] , phone: '' , type: "department", name: "济西二手车市场" } ,
                {position: [116.95,36.70] , phone: '' , type: "department", name: "蓝翔路机动车交易市场" } ,
                {position: [116.98,36.72] , phone: '' , type: "department", name: "泺口二手车市场" } ,
                {position: [117.05,36.70] , phone: '' , type: "department", name: "华瑞源二手车网" } ,

            ]
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
                    center: MY_POSITION,
                    zoom: 11, // 缩放级别
                })

                this.map.addControl(new AMap.ToolBar())
                this.map.addControl(new AMap.Scale())


                this.markers.forEach(item => {
                    this.addMarker(this.map, item)
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
        addMarker(map, item) {
            let marker = new AMap.Marker({
                position: item.position,
                offset: new AMap.Pixel(0,-20),
                content: `
               <div class="marker ${item.type === 'market'? 'orange': ''}">
                  <div class="title">${item.name}</div>
                  <div class="note"><a href="tel:${item.phone}">${item.phone}</a></div>
               </div>`,
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
