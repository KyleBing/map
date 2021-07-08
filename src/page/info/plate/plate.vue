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
    name: "InfoPlate",
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
            colors: {},
            markers: [
                {"name":"枣庄","position":[117.37981,34.94708],"note":""},
                {"name":"济宁","position":[116.582207,35.434777],"note":""},
                {"name":"菏泽","position":[115.721485,35.158462],"note":""},
                {"name":"日照","position":[119.14716,35.612242],"note":""},
                {"name":"临沂","position":[118.194627,35.317809],"note":""},
                {"name":"泰安","position":[117.052736,36.012423],"note":""},
                {"name":"青岛","position":[120.266099,36.613507],"note":""},
                {"name":"潍坊","position":[118.980753,36.622718],"note":""},
                {"name":"淄博","position":[117.886744,36.618112],"note":""},
                {"name":"济南","position":[117.16176,36.677962],"note":""},
                {"name":"威海","position":[122.050663,37.177945],"note":""},
                {"name":"烟台","position":[120.834175,37.314978],"note":""},
                {"name":"东营","position":[118.602036,37.606483],"note":""},
                {"name":"滨州","position":[117.804433,37.524612],"note":""},
                {"name":"德州","position":[116.622374,37.22365],"note":""},
                {"name":"聊城","position":[115.928058,36.521334],"note":""}]
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
                center: [118.785193, 36.38918],
                zoom: 8, // 缩放级别
                mapStyle: 'amap://styles/whitesmoke'
            })

            this.map.setFeatures(['bg'])
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
            this.initPro(CodeShandong, DEPTH.city)
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
                    'fill': function (properties) {
                        // properties为可用于做样式映射的字段，包含
                        // NAME_CHN:中文名称
                        // adcode_pro
                        // adcode_cit
                        // adcode
                        let adcode = properties.adcode;
                        return that.getColorByAdcode(adcode);
                    },
                    'province-stroke': 'cornflowerblue',
                    'city-stroke': 'white', // 中国地级市边界
                    'county-stroke': 'rgba(255,255,255,0.5)' // 中国区县边界
                }
            });

            this.layerCity.setMap(this.map);
        },

        getColorByAdcode(adcode) {
            if (!this.colors[adcode]) {
                let gb = Math.random() * 155 + 50;
                this.colors[adcode] = 'rgb(' + gb + ',' + gb + ',255)';
            }

            return this.colors[adcode];
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
                content: `
               <div class="marker">
                  <div class="title">${item.name}</div>
                  <div class="note">${item.note.replaceAll('|', '<br>')}</div>
               </div>`,
            });
            map.add(marker);
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