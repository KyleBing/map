<template>
    <div class="map-container">
<!--        <el-cascader-->
<!--            v-model="value"-->
<!--            :options="options"-->
<!--            @change="handleChange"/>-->
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>
    </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
import {mapState} from 'vuex'
import mapConfig from "../../../mapConfig";
import axios from "axios";

// 显示地图行政区的深度
const DEPTH = {
    province: 0, // 省
    city: 1, // 市
    country: 2 // 县、区
}

const COLORS = [
    'rgba(190,194,161,0.8)',
    'rgba(237,236,208,0.8)',
    'rgba(222,148,111,0.8)',
    'rgba(103,104,099,0.8)',
    'rgba(201,166,085,0.8)',
    'rgba(113,182,153,0.8)',
    'rgba(205,087,085,0.8)',
    'rgba(208,198,170,0.8)',
    'rgba(212,227,206,0.8)',
    'rgba(214,201,193,0.8)',
    'rgba(212,144,167,0.8)',
    'rgba(242,242,218,0.8)',
]

let AMap = null


export default {
    name: "AreaJinan",
    data() {
        return {
            isLoading: false,
            map: null,
            layerCity: null, // 区域图层
        }
    },
    mounted() {
        AMapLoader
            .load({
                key: mapConfig.key_web_js, // 开发应用的 ID
                version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
                plugins: [
                    // 'AMap.ToolBar', // 缩放按钮
                    'AMap.Scale', // 比例尺
                    'AMap.Geolocation', // 定位
                    'AMap.DistrictLayer', // 定位
                    'AMap.DistrictSearch', // 区域信息搜索
                ],
                AMapUI: {             // 是否加载 AMapUI，缺省不加载
                    version: '1.1',   // AMapUI 缺省 1.1
                    plugins: [],       // 需要加载的 AMapUI ui插件
                },
            })
            .then(map => {
                AMap = map
                this.map = new AMap.Map('container', {
                    center: [117.129533, 36.685668],
                    zoom: 9, // 缩放级别
                    mapStyle: 'amap://styles/whitesmoke'
                })


                // 点击显示当地信息
                this.map.on('click', event => {
                    this.showDistrictInfoOf(event.lnglat)
                })

                this.map.setFeatures(['bg', 'point', 'road', 'building'])
                // bg 区域面
                // point 兴趣点
                // road 道路和道路标记
                // building 建筑物

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
            })
            .catch(e => {
                console.log(e)
            })

    },
    computed: {
        ...mapState(['windowInsets'])
    },
    methods: {
        showDistrictBounds(locationName){
            // 绘制当前区域边界
            this.districtSearch = new AMap.DistrictSearch({
                // 关键字对应的行政区级别
                level: 'district',
                // country：国家；province：省/直辖市；city：市；district：区/县；biz_area：商圈
                extensions: 'all',
                //  显示下级行政区级数，1表示返回下一级行政区
                subdistrict: 1
            })

            this.districtSearch.search(locationName, (status, result) => {
                console.log(result)
                // 获取边界信息
                let bounds = result.districtList[0].boundaries
                let polygons = []
                if (bounds) {
                    for (let i = 0, l = bounds.length; i < l; i++) {
                        // 生成行政区划polygon
                        let polygon = new AMap.Polygon({
                            map: this.map,
                            strokeWeight: 2,
                            path: bounds[i],
                            fillOpacity: 0.6,
                            fillColor: randomColor(),
                            strokeColor: '#CC66CC'
                        })
                        this.map.add(polygon)
                        polygons.push(polygon)
                    }
                    // 地图自适应
                    // this.map.setFitView()  // 以合适的比例展示内容区
                }

                result.districtList[0].districtList.forEach(item => {
                    this.addMarker(this.map, item)
                })
            })
        },

        // 获取坐标值的地理信息
        showDistrictInfoOf(location){
            axios({
                url: 'https://restapi.amap.com/v3/geocode/regeo?parameters',
                params: {
                    key: mapConfig.key_service,
                    location: `${location.lng},${location.lat}`
                }
            })
                .then(res => {
                    if (res.data && res.data.status === '1'){
                        let locationInfo =  res.data.regeocode.addressComponent
                        console.log(locationInfo)
                        this.initDistrict(locationInfo.adcode, DEPTH.district) // TODO
                        this.showDistrictBounds(locationInfo.city)
                    } else {
                        console.log(res)
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        },

        initDistrict(adcode, depth) {
            this.layerCity && this.layerCity.setMap(null)
            this.layerCity = new AMap.DistrictLayer.Province({
                zIndex: 8,
                adcode: [adcode],
                depth: depth,
                styles: {
                    'fill': properties => {
                        // properties为可用于做样式映射的字段，包含  // NAME_CHN:中文名称;  adcode_pro;  adcode_cit;  adcode
                        if (properties.adcode_cit.toString().indexOf('370100') === 0) {
                            let {NAME_CHN, adcode, x, y} = properties
                            // console.log(`{name: ${NAME_CHN}, adcode: ${adcode}, position: [${x},${y}]}`)
                            return randomColor()
                        }
                    },
                    'stroke-width': 1,
                    'coastline-stroke': 'white', // 海岸线颜色
                    'nation-stroke': 'blue', // 国境线颜色
                    'province-stroke': 'white', // 省界颜色
                    'city-stroke': 'black', // 地级市边界
                    'county-stroke': 'rgba(255,255,255,0.5)' // 区/县界颜色
                    // 参考：
                    // https://lbs.amap.com/api/javascript-api-v2/documentation#districtlayer
                }
            })
            this.layerCity.setMap(this.map)
        },

        // 设置地图中心点：用户坐标
        setMapCenterToUserLocation(status, res) {
            if (status === 'complete') {
                let center = [res.position.lng, res.position.lat]
                this.map.setCenter(center)
                this.addMarker(this.map, {
                    position: center,
                    name: '我的位置',
                    note: ''
                })
            } else {
                console.log(res)
            }
        },

        addMarker(map, item) {
            let marker = new AMap.Marker({
                position: [item.center.lng, item.center.lat],
                offset: new AMap.Pixel(-10, -20),
                content: `
                <div class="marker">
                  <div class="marker-index">
                      <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note">区号：${item.citycode}</div>
                       <div class="note">行政：${item.adcode}</div>
                  </div>
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

function randomColor(){
    let randomIndex = Math.floor(COLORS.length * Math.random())
    return COLORS[randomIndex]
}


</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";

.map-container {
    position: relative;
}


</style>
