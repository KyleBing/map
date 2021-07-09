<template>
    <div class="map-container">
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>
    </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader';
import { mapState } from 'vuex'

// 显示地图行政区的深度
const DEPTH = {
    province: 0, // 省
    city: 1, // 市
    country: 2 // 县、区
}

let AMap = null


export default {
    name: "AreaJinan",
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
            layerCity: null, // 区域图层
            colors: {
                '370114': {color: 'rgba(190,194,161,0.8)', name: "章丘区"},
                '370116': {color: 'rgba(237,236,208,0.8)', name: "莱芜区"},
                '370117': {color: 'rgba(222,148,111,0.8)', name: "钢城区"},
                '370115': {color: 'rgba(103,104,099,0.8)', name: "济阳区"},
                '370112': {color: 'rgba(201,166,085,0.8)', name: "历城区"},
                '370124': {color: 'rgba(113,182,153,0.8)', name: "平阴县"},
                '370113': {color: 'rgba(205,087,085,0.8)', name: "长清区"},
                '370103': {color: 'rgba(208,198,170,0.8)', name: "市中区"},
                '370102': {color: 'rgba(212,227,206,0.8)', name: "历下区"},
                '370126': {color: 'rgba(214,201,193,0.8)', name: "商河县"},
                '370104': {color: 'rgba(212,144,167,0.8)', name: "槐荫区"},
                '370105': {color: 'rgba(242,242,218,0.8)', name: "天桥区"},
            },
            markers: [
                {"name": "平阴县", "position": [116.375526, 36.190518], "note": "370124"},
                {"name": "商河县", "position": [117.201343, 37.319686], "note": "370126"},
                {"name": "济阳区", "position": [117.085361, 37.002617], "note": "370115"},
                {"name": "钢城区", "position": [117.825907, 36.127458], "note": "370117"},
                {"name": "莱芜区", "position": [117.617702, 36.344708], "note": "370116"},
                {"name": "章丘区", "position": [117.517144, 36.706865], "note": "370114"},
                {"name": "历城区", "position": [117.250039, 36.639125], "note": "370112"},
                {"name": " 市中区", "position": [116.953408, 36.586214], "note": "370103"},
                {"name": "长清区", "position": [116.775567, 36.434444], "note": "370113"},
                {"name": "槐荫区", "position": [116.885431, 36.683741], "note": "370104"},
                {"name": "历下区", "position": [117.099664, 36.657856], "note": "370102"},
                {"name": "天桥区", "position": [116.985681, 36.769594], "note": "370105"},
            ]
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
                'AMap.DistrictLayer', // 定位
            ],
            AMapUI: {             // 是否加载 AMapUI，缺省不加载
                version: '1.1',   // AMapUI 缺省 1.1
                plugins: [],       // 需要加载的 AMapUI ui插件
            },
        }).then(map => {
            AMap = map
            this.map = new AMap.Map('container', {
                center:  [117.129533, 36.685668],
                zoom: 9, // 缩放级别
                mapStyle: 'amap://styles/whitesmoke'
            })

            this.map.setFeatures(['bg', 'point', 'road', 'building'])
            // bg 区域面
            // point 兴趣点
            // road 道路和道路标记
            // building 建筑物

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

            let CodeShandong = 370000
            this.initPro(CodeShandong, DEPTH.country)
            this.markers.forEach(item => {
                this.addMarker(this.map, item)
            })

        }).catch(e => {
            console.log(e);
        })

    },
    computed: {
        ...mapState(['windowInsets'])
    },
    methods: {
        initPro(code, dep) {
            this.layerCity && this.layerCity.setMap(null);

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
                        if (properties.adcode_cit.toString().indexOf('370100') === 0) {
                            let {NAME_CHN, adcode, x,y} = properties
                            // console.log(`{name: ${NAME_CHN}, adcode: ${adcode}, position: [${x},${y}]}`)
                            return this.colors[adcode].color;
                        }
                    },
                    'province-stroke': 'black',
                    'city-stroke': 'brown', // 中国地级市边界
                    'county-stroke': 'rgba(255,255,255,0.5)' // 中国区县边界
                }
            });

            this.layerCity.setMap(this.map);
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

        addMarker(map, item) {
            let marker = new AMap.Marker({
                position: item.position,
                offset: new AMap.Pixel(-10,-20),
                content: `
               <div class="marker">
                  <div class="title">${item.name}</div>
                  <div class="note">${item.note.replaceAll('|', '<br>')}</div>
               </div>`,
            });
            map.add(marker);
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