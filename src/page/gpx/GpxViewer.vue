<template>
    <div class="map-container">
        <div class="card float-panel"
             @click="isPointerListShowed = true">
            <i class="el-icon-tickets"></i>
            <input type="file" @change="fileChange($event.target.files)">
        </div>

        <!-- 地图 -->
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>

        <!-- DETAIL INFO -->
        <pointer-detail-panel
            v-if="activePointerObj && (!isInPortraitMode || !isPointerListShowed)"
            :pointer="activePointerObj"
            @openInGaodeApp="openInGaodeApp"
        />
    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader'
import PointerDetailPanel from "../pointer/components/PointerDetailPanel"
import {mapGetters, mapState} from "vuex"
import mapConfig from "../../mapConfig";
import pointerApi from "@/api/pointerApi";
import {XMLParser, XMLBuilder, XMLValidator} from "fast-xml-parser"

import {Base64} from "js-base64"
import PointerListPanel from "../pointer/components/PointerListPanel";

const MY_POSITION = [117.129533, 36.685668]
let AMap = null

export default {
    name: "PointerViewer",
    components: {PointerListPanel, PointerDetailPanel},
    data() {
        return {
            isLoading: false,
            map: null,
            cluster: null,  // 点聚合的对象

            currentPointerId: 0,
            activePointerObj: null, // 当前 Line 对象

            // xml
            xmlText: '',
            xmlObj: null,

            // float route list
            isPointerListShowed: true, // route list 是否显示
        }
    },
    mounted() {

        AMapLoader
            .load({
                key: mapConfig.key_web_js, // 开发应用的 ID
                version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
                plugins: [
                    'AMap.ToolBar', // 缩放按钮
                    'AMap.Scale', // 比例尺
                ],
            })
            .then(map => {
                AMap = map
                this.map = new AMap.Map('container', {
                    center: MY_POSITION,
                    zoom: 11
                })
                this.map.addControl(new AMap.ToolBar())
                this.map.addControl(new AMap.Scale())

                if (this.$route.query.pointerId){
                    this.getPointerInfo(this.$route.query.pointerId)
                }
            })
            .catch(e => {
                console.log(e)
            })
    },

    computed: {
        ...mapGetters(["isAdmin", 'isInPortraitMode']),
        ...mapState(['windowInsets', 'authorization', 'isShowingMenuToggleBtn']),
    },
    methods: {

        fileChange(files){
            if(files.length){
                let file = files[0]
                let reader = new FileReader()
                let that = this
                reader.onload = function(){
                    that.xmlText = this.result
                    let xmlParser = new XMLParser({
                        ignoreAttributes: false,  // 读取xml节点的属性值
                        attributeNamePrefix : "_"
                    })
                    that.xmlObj = xmlParser.parse(this.result)
                    // console.log(xmlParser.parse(this.result))
                    that.loadAllPointer()
                }
                reader.readAsText(file)
            }
        },

        loadAllPointer(){
/*            pointer = {
                "ele": 18,
                "time": "2023-11-18T12:08:53Z",
                "extensions": {
                    "heartrate": 96,
                    "distance": 13
                },
                "_lat": "36.7426527",
                "_lon": "117.0671413"
            }*/

            let pointers = this.xmlObj.gpx.trk.trkseg.trkpt
            let pathPointers = pointers.map(item => {
                let lnglat = new AMap.LngLat(item._lon, item._lat)
                return lnglat.offset(535,40)  // E,N 向东，向北移动距离，单位：米
            })
            this.loadGpxPath(this.map, pathPointers)
        },

        loadGpxPath(map, ptArray){

            this.addMarker(map, ptArray[0], '起点')
            this.addMarker(map, ptArray[ptArray.length - 1], '终点')

            let polyline = new AMap.Polyline({
                path: ptArray,           // Array<[number, number]>
                isOutline: true,
                outlineColor: '#ffeeff', // 路线边框颜色
                borderWeight: 3,         // 路线边框宽度
                strokeColor: "#3366FF",  // 路线颜色
                strokeOpacity: 1,        // 路线透明度
                strokeWeight: 6,         // 路线宽度
                strokeStyle: "solid",    // solid | dashed
                strokeDasharray: [10, 5],// 虚线间隔
                lineJoin: 'round',       // 折线拐点的绘制样式，默认值为'miter'尖角，其他可选值：'round'圆角、'bevel'斜角
                lineCap: 'round',        // 折线两端线帽的绘制样式，默认值为'butt'无头，其他可选值：'round'圆头、'square'方头
                zIndex: 50,
                showDir: true,           // 显示方向箭头， 宽度 > 6 时有效
                geodesic: false,         // 是否显示大地线
                extraData: {}            // any
            })
            polyline.on('mouseover', data => {
                console.log(data)
            })
            map.add([polyline]);
            map.setFitView();
        },


        openInGaodeApp(){
            let originLnglat = this.activePointerObj.pointerArray[0].position // [lng, lat]
            let destLnglat = this.activePointerObj.pointerArray[this.activePointerObj.pointerArray.length - 1].position // [lng, lat]
            this.map.plugin('AMap.Driving', () => {
                let currentDriving = new AMap.Driving({
                    map: this.map,
                    policy: AMap.DrivingPolicy.LEAST_TIME
                })
                currentDriving.search(
                    new AMap.LngLat(...originLnglat),
                    new AMap.LngLat(...destLnglat),
                    function (status, result) {
                        // result 即是对应的驾车导航信息，相关数据结构文档请参考
                        // https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
                        if (status === 'complete') {
                            currentDriving.searchOnAMAP({
                                origin:result.origin,
                                destination:result.destination
                            });
                            console.log(status, result)
                            console.log('绘制驾车点图完成')
                        } else {
                            console.log('获取驾车数据失败')
                        }
                    });
            })

        },


        getPointerInfo(pointerId) {
            pointerApi
                .detail({
                    id: pointerId
                })
                .then(res => {
                    this.activePointerObj = res.data
                    this.activePointerObj.pointerArray = JSON.parse(Base64.decode(this.activePointerObj.pointers))
                    this.loadPointerLabels(this.map, this.activePointerObj)
                })
        },


        resizeMap() {
            let mapContainer = document.getElementById('container')
            mapContainer.style.height = window.innerHeight + "px"
            mapContainer.style.width = window.innerWidth + "px"
        },


        /**
         * 获取区域对角线的两点坐标，即这个区域内的最小坐标值和最大坐标值
         *
         * @param pointerArray [[a,b],[c,d]]
         * @return Array {min:number[a,b], max:number[c,d]}
         */
        getMaxBoundsPointer(pointerArray){
            let lngArray = pointerArray.map(item => item[0])
            let latArray = pointerArray.map(item => item[1])

            return {
                min: [Math.min(...lngArray),  Math.min(...latArray)],
                max: [Math.max(...lngArray),  Math.max(...latArray)],
            }
        },

        // 添加点图 Label
        loadPointerLabels(map, pointer) {
            let pointers = pointer.pointerArray.map(item => {
                item.weight = 1
                item.lnglat = item.position
                return item
            })
            let count = pointers.length

            const _renderClusterMarker = function (context) {
                // console.log('context cluster: ', context)
                let factor = Math.pow(context.count / count, 1 / 18);
                let div = document.createElement('div');
                let Hue = 180 - factor * 180;
                let bgColor = 'hsla(' + Hue + ',100%,100%,1)';
                let fontColor = 'hsla(' + Hue + ',100%,50%,1)';
                let borderColor = 'hsla(' + Hue + ',100%,0%,1)';
                let shadowColor = 'hsla(' + Hue + ',100%,10%,0.3)';
                div.style.backgroundColor = bgColor;
                let size = Math.round(30 + Math.pow(context.count / count, 1 / 5) * 20);
                div.style.width = div.style.height = size + 'px';
                div.style.border = `solid 1px ${borderColor}`;
                div.style.borderRadius = size / 2 + 'px';
                div.style.boxShadow = `2px 2px 5px ${shadowColor}`;
                div.innerHTML = context.count;
                div.style.lineHeight = size + 'px';
                div.style.color = fontColor;
                div.style.fontSize = '18px';
                div.style.fontWeight = 'bold';
                div.style.textAlign = 'center';
                context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
                context.marker.setContent(div)
            };

            const _renderMarker = function(context) {
                // console.log('context normal: ', context)
                let item = context.data[0]
                context.marker.setContent(`
                       <div class="marker">
                          <div class="marker-index">
                              <div class="title">${item.name}</div>
                          </div>
                       </div>`)

                let offset = new AMap.Pixel(-9, -9);
                context.marker.setOffset(offset)
            }

            if (this.cluster){
                this.cluster.setData(pointers)
            } else {
                this.cluster = new AMap.MarkerCluster(
                    map,       // 地图实例
                    pointers,  // 海量点数据，数据中需包含经纬度信息字段 lnglat
                    {
                        gridSize: 30,
                        renderClusterMarker: _renderClusterMarker, // 自定义聚合点样式
                        renderMarker: _renderMarker, // 自定义非聚合点样式
                    }
                )
            }


            let maxLocations =  this.getMaxBoundsPointer(pointer.pointerArray.map(item => item.position))
            // 取区间的 1/4 作为地图的边界
            let lngGap = (maxLocations.max[0] - maxLocations.min[0]) / 4
            let latGap = (maxLocations.max[1] - maxLocations.min[1]) / 4

            // 新的区域极点坐标
            let min = new AMap.LngLat(maxLocations.min[0] - lngGap, maxLocations.min[1] - latGap)
            let max = new AMap.LngLat(maxLocations.max[0] + lngGap, maxLocations.max[1] + latGap)


            // 1. 多个点时，设置 bounds
            if (pointer.pointerArray.length > 1){
                let bounds = new AMap.Bounds(min, max)
                this.map.setBounds(bounds)
            }
            // 2. 一个点时，将其作为中心点
            else if (pointer.pointerArray.length === 1){
                console.log(pointer.pointerArray)
                let centerLngLat = new AMap.LngLat(...pointer.pointerArray[0].position)
                this.map.setCenter(centerLngLat)  // 设置地图中心点坐标
            }
            // 3.
            else {

            }
/*
            pointer.pointerArray.forEach((item, index) => {
                this.addMarker(map, item, index)
            })*/
        },

        addMarker(map, position, name) {
            let marker = new AMap.Marker({
                position: position,
                content: `<div class="marker">
                          <div class="marker-index">
                              <div class="title">${name}</div>
                          </div>
                       </div>`
            })
            map.add(marker)
        }

    },
    beforeDestroy() {
        this.map.clearInfoWindow() // 清除地图上的信息窗体
        this.map.clearMap() // 删除所有 Marker
        this.map.destroy() // 销毁地图，释放内存
        this.map = null
    }
}
</script>

<style lang="scss" scoped>
@import "../../scss/plugin";

.btn-router-list{
    position: absolute;
    top: 20px;
    left: 280px;
}

.map-container {
    position: relative
}

.float-panel{
    min-height: 300px;
    position: absolute;
    z-index: 1000;
    top: 20px;
    left: 20px;
}

@media (max-width: $screen-width-threshold) {
    .float-panel{
        left: 50%;
        transform: translateX(-50%);
    }
    .btn-router-list{
        left: auto;
        top: 10px;
        right: 10px;
    }
}

</style>
