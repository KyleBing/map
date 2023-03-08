<template>
    <div class="map-container">
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>
    </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader';
import { mapState } from 'vuex'
import mapConfig from "../../../mapConfig";

// 显示地图行政区的深度
const DEPTH = {
    province: 0, // 省
    city: 1, // 市
    country: 2 // 县、区
}

let AMap = null


export default {
    name: "CarPlate",
    data() {
        return {
            isLoading: false,
            map: null,
            layerCity: null, // 区域图层
            colors: {
                '370600': {color: 'rgb(190,194,161)', name: "烟台市"},
                '371300': {color: 'rgb(237,236,208)', name: "临沂市"},
                '370200': {color: 'rgb(222,148,111)', name: "青岛市"},
                '370300': {color: 'rgb(103,104,099)', name: "淄博市"},
                '370700': {color: 'rgb(201,166,085)', name: "潍坊市"},
                '371100': {color: 'rgb(113,182,153)', name: "日照市"},
                '371500': {color: 'rgb(212,227,206)', name: "聊城市"},
                '370400': {color: 'rgb(208,198,170)', name: "枣庄市"},
                '370100': {color: 'rgb(205,087,085)', name: "济南市"},
                '371700': {color: 'rgb(214,201,193)', name: "菏泽市"},
                '370900': {color: 'rgb(212,144,167)', name: "泰安市"},
                '371400': {color: 'rgb(242,242,218)', name: "德州市"},
                '370800': {color: 'rgb(246,194,180)', name: "济宁市"},
                '371600': {color: 'rgb(200,239,186)', name: "滨州市"},
                '370500': {color: 'rgb(178,215,221)', name: "东营市"},
                '371000': {color: 'rgb(146,128,140)', name: "威海市"},
            },
            markers: [
                {"name": "D" , "position": [117.37981 , 34.94708] , "note": "枣庄"} ,
                {"name": "H" , "position": [116.582207, 35.434777], "note": "济宁"} ,
                {"name": "R" , "position": [115.721485, 35.158462], "note": "菏泽"} ,
                {"name": "L" , "position": [119.14716 , 35.612242], "note": "日照"} ,
                {"name": "Q" , "position": [118.194627, 35.317809], "note": "临沂"} ,
                {"name": "J" , "position": [117.052736, 36.012423], "note": "泰安"} ,
                {"name": "BU", "position": [120.266099, 36.613507], "note": "青岛"} ,
                {"name": "GV", "position": [118.980753, 36.622718], "note": "潍坊"} ,
                {"name": "C" , "position": [117.886744, 36.618112], "note": "淄博"} ,
                {"name": "AS", "position": [117.16176 , 36.677962], "note": "济南"} ,
                {"name": "K" , "position": [122.050663, 37.177945], "note": "威海"} ,
                {"name": "FY", "position": [120.834175, 37.314978], "note": "烟台"} ,
                {"name": "E" , "position": [118.602036, 37.606483], "note": "东营"} ,
                {"name": "M" , "position": [117.804433, 37.524612], "note": "滨州"} ,
                {"name": "N" , "position": [116.622374, 37.22365] , "note": "德州"} ,
                {"name": "P" , "position": [115.928058, 36.521334], "note": "聊城"}]

        }
    },
    mounted() {
        AMapLoader.load({
            key: mapConfig.appId, // 开发应用的 ID
            version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [
                // 'AMap.ToolBar', // 缩放按钮
                'AMap.Scale', // 比例尺
                'AMap.DistrictLayer', // 定位
            ],
        }).then(map => {
            AMap = map
            this.map = new AMap.Map('container', {
                center: [118.785193, 36.38918],
                zoom: 7.5, // 缩放级别
                mapStyle: 'amap://styles/whitesmoke'
            })

            this.map.setFeatures(['bg'])
            // bg 区域面
            // point 兴趣点
            // road 道路和道路标记
            // building 建筑物

            // this.map.addControl(new AMap.ToolBar())
            this.map.addControl(new AMap.Scale())

            let CodeShandong = 370000
            this.initPro(CodeShandong, DEPTH.city)
            this.markers.forEach(item => {
                this.addMarker(this.map, item)
            })

        }).catch(e => {
            console.log(e)
        })

    },
    computed: {
        ...mapState(['windowInsets'])
    },
    methods: {
        initPro(code, dep) {
            this.layerCity && this.layerCity.setMap(null)

            let that = this
            this.layerCity = new AMap.DistrictLayer.Province({
                zIndex: 8,
                adcode: [code],
                depth: dep,
                styles: {
                    'fill': properties => {
                        // properties为可用于做样式映射的字段，包含
                        // NAME_CHN:中文名称
                        // adcode_pro
                        // adcode_cit
                        // adcode
                        if (properties.adcode.toString().indexOf('37') === 0) {
                            return this.colors[properties.adcode].color
                        }
                    },
                    'province-stroke': 'black',
                    'city-stroke': 'white', // 中国地级市边界
                    'county-stroke': 'rgba(255,255,255,0.5)' // 中国区县边界
                }
            })

            this.layerCity.setMap(this.map)
        },

        addMarker(map, item) {
            let marker = new AMap.Marker({
                position: item.position,
                offset: new AMap.Pixel(0,-20),
                content: `
               <div class="marker-plate">
                  <div class="title">${item.name}</div>
                  <div class="note">${item.note.replaceAll('|', '<br>')}</div>
               </div>`,
            })
            map.add(marker)
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
