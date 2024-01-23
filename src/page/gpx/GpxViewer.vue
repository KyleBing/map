<template>
    <div class="map-container">
        <div class="card float-panel"
             @click="isPointerListShowed = true">
            <div class="mb-2">
                <input accept=".gpx" id="inputFile" type="file" @change="fileChange($event.target.files)">
                <label for="inputFile">
                    <el-tag size="mini" type="primary" icon="el-icon-tickets">选择 gpx 文件</el-tag>
                </label>
            </div>

            <el-descriptions border size="mini" :column="1" direction="horizontal" v-if="xmlFile && xmlFile.gpx">
                <el-descriptions-item label="文件名">{{xmlFile.name}}</el-descriptions-item>
                <el-descriptions-item label="路线名">{{xmlObj.gpx.trk.name}}</el-descriptions-item>
                <el-descriptions-item label="数据点">{{pathPointers.length}}个</el-descriptions-item>
                <el-descriptions-item label="时间">{{dateFormatter(new Date(pathPointers[0].time))}} ~ {{dateFormatter(new Date(pathPointers[pathPointers.length - 1].time), 'hh:mm:ss')}}</el-descriptions-item>
            </el-descriptions>

            <el-button type="primary" size="mini" @click="toggleMarkerDisplay">切换标签显示</el-button>
            <el-button type="primary" size="mini" @click="togglePathDisplay">切换路径显示</el-button>
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
import utility from "@/utility";
import ICON from "@/assets/icons";

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
            xmlFile: null,
            xmlText: '',
            xmlObj: null,

            // 路径
            path: null,
            isPathShowed: true,

            // 路径上的 markers
            isMarkerShowed: true,
            pathPointers: [],

            markers: [], //

            // float route list
            isPointerListShowed: true, // route list 是否显示

            //
            dateFormatter: utility.dateFormatter
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
        toggleMarkerDisplay(){
            if (this.isMarkerShowed){
                this.markers.forEach(item => {
                    let extData = item.getExtData()
                    if (extData && (extData.label === 'start' || extData.label === 'end')){
                        console.log(item)
                    } else {
                        item.hide()
                    }
                })
                this.isMarkerShowed = false
            } else {
                this.markers.forEach(item => {
                    let extData = item.getExtData()
                    if (extData && (extData.label === 'start' || extData.label === 'end')){
                        console.log(item)
                    } else {
                        item.show()
                    }
                })
                this.isMarkerShowed = true
            }
        },
        togglePathDisplay(){
            if (this.isPathShowed){
                this.path.hide()
                this.isPathShowed = false
            } else {
                this.path.show()
                this.isPathShowed = true
            }
        },

        fileChange(files){
            if(files.length){

                // reset map content
                this.map.clearInfoWindow() // 清除地图上的信息窗体
                this.map.clearMap() // 删除所有 Marker

                this.xmlFile = files[0]
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
                reader.readAsText(this.xmlFile)
            }
        },

        loadAllPointer(){
            this.isMarkerShowed = true
            this.isPathShowed = true
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
            this.pathPointers = pointers.map((item, index) => {
                item.lnglat = new AMap.LngLat(item._lon, item._lat)
                item.lnglat = item.lnglat.offset(545,45)

                // 给 pointers 添加 label: start | end，供后续对 marker 的操作
                if (index === 0){
                    item.label = 'start'
                }
                if ( index === pointers.length - 1){
                    item.label = 'end'
                }
                return item  // E,N 向东，向北移动距离，单位：米
            })
            this.loadGpxPath(this.map, this.pathPointers.map(item => item.lnglat))
            this.loadMarkers(this.map, this.pathPointers)
        },

        loadGpxPath(map, ptArray){
            this.path = new AMap.Polyline({
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
                extData: {}            // any
            })
            this.path.on('mouseover', data => {
                console.log(data)
            })
            map.add([this.path]);
            map.setFitView();
        },

        loadMarkers(map, ptArray){
            this.markers = []
            ptArray.forEach((item, index) => {
                if (item.label === 'start'){
                    // 起点
                    this.addMarker(map, item.lnglat, '起点',
                        {label: item.label}, // AMap.Marker.extData
                        new AMap.Icon({ // 设置途经点的图标
                            size: new AMap.Size(26, 43),
                            image: ICON.start,
                            // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                            imageSize: new AMap.Size(26, 43) // 指定图标的大小，可以压缩图片

                        }),
                        new AMap.Pixel(-13, -43)
                    )
                } else if (item.label === 'end'){
                    // 终点
                    this.addMarker(map, item.lnglat, '终点',
                        {label: item.label}, // AMap.Marker.extData
                        new AMap.Icon({ // 设置途经点的图标
                            size: new AMap.Size(26, 43),
                            image: ICON.end,
                            // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                            imageSize: new AMap.Size(26, 43) // 指定图标的大小，可以压缩图片
                        }),
                        new AMap.Pixel(-13, -43),
                    )
                } else {
                    if (index % 100 === 0){
                        this.addMarker(map, item.lnglat,  utility.dateFormatter(new Date(item.time), 'hh:mm'))
                        // this.addMarker(map, item.lnglat, item.extensions.heartrate)
                    }
                }
            })
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


        addMarker(map, position, name, extData, icon, offset) {
            let marker
            if (icon){
                marker = new AMap.Marker({
                    position: position,
                    icon: icon,
                    offset: offset,
                    extData
                })
            } else {
                marker = new AMap.Marker({
                    position: position,
                    content: `<div class="marker">
                              <div class="marker-index">
                                  <div class="title">${name}</div>
                              </div>
                           </div>`,
                })
            }
            this.markers.push(marker)
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

input[type=file]{
    display: none;
}

.btn-router-list{
    position: absolute;
    top: 20px;
    left: 280px;
}

.map-container {
    position: relative
}

.float-panel{
    width: 400px;
    min-height: 100px;
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
