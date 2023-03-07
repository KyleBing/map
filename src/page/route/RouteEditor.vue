<template>
    <div class="map-container">
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>

        <detail
            class="detail-panel mt-1"
            v-if="activeLineObj"
            :line="activeLineObj"
        />

        <div class="card editor-form">
            <el-form
                v-if="formLine"
                :model="formLine"
                size="mini"
                ref="lineInfo" label-width="100px">
                <el-form-item label="路线名" prop="name">
                    <el-input v-model="formLine.name"/>
                </el-form-item>
                <el-form-item label="地域" prop="area">
                    <el-input v-model="formLine.area"/>
                </el-form-item>
                <el-form-item label="路线类型" prop="road_type">
                    <el-input v-model="formLine.road_type"/>
                </el-form-item>
                <el-form-item label="适用季节" prop="seasons">
                    <el-checkbox-group v-model="formLine.seasonsArray">
                        <el-checkbox-button label="春"></el-checkbox-button>
                        <el-checkbox-button label="夏"></el-checkbox-button>
                        <el-checkbox-button label="秋"></el-checkbox-button>
                        <el-checkbox-button label="冬"></el-checkbox-button>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="视频链接" prop="video_link">
                    <el-input v-model="formLine.video_link"/>
                </el-form-item>
                <el-form-item label="备注" prop="note">
                    <el-input type="textarea" :rows="5" v-model="formLine.note"/>
                </el-form-item>
                <el-form-item label="总里程" prop="distance">
                    <el-input disabled readonly v-model="formLine.distance">
                        <template slot="append">km</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="用时" prop="time">
                    <el-input disabled readonly v-model="formLine.time">
                        <template slot="append">分钟</template>
                    </el-input>
                </el-form-item>
            </el-form>
        </div>


        <div class="float-panel">
            <!-- 编辑面板 -->
            <div class="search-panel card">
                <el-form inline @submit="search" size="mini">
                    <el-form-item class="mb-0" label="地址">
                        <el-input style="width: 200px" placeholder="输入较完整的地址" v-model="address"></el-input>
                    </el-form-item>
                    <el-form-item class="mb-0" label="">
                        <el-button  type="primary" @click="search" icon="el-icon-search">搜索</el-button>
                    </el-form-item>
                </el-form>

                <el-form inline class="mt-1" size="mini">
                    <el-form-item class="mb-0" label="经度">
                        <el-input style="width:140px" placeholder="lng" v-model="positionPicked.lng"></el-input>
                    </el-form-item>
                    <el-form-item class="mb-0" label="纬度">
                        <el-input style="width:140px" placeholder="lat" v-model="positionPicked.lat"></el-input>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 结果面板 -->
            <div class="result card mt-1" v-if="resultText">
                {{resultText}}
            </div>

            <route-panel
                class="mt-1"
                @pointAdd="handleAddRoutePoint"
                @print="printRoute"
                @showLine="showLine"
                :lng="positionPicked.lng"
                :lat="positionPicked.lat"
                v-model="pathPointers"/>
        </div>

    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader';
import ICON from "@/assets/icons";
import RoutePanel from "@/page/tool/route/components/RoutePanel.vue";

import { mapState } from 'vuex'
import mapConfig from "../../mapConfig";
import Detail from "@/page/route/components/Detail.vue";
import axios from "axios";
import routeApi from "@/api/routeApi";
import {Base64} from "js-base64";


const MY_POSITION = [117.129533, 36.685668]
let AMap = null
export default {
    name: "RouteEditor",
    components: {Detail, RoutePanel},
    data() {
        return {
            activeLineObj: null,

            isLoading: false,
            map: null,
            currentRouting: null,  // 当前导航路线
            pathPointers: [
                /*                {
                    name: '',
                    position: [lng,lat]
                    note: '', // 备注
                },*/
            ], // 对应点的范围数据

            positionPicked: {
                lng: 0,
                lat: 0,
            },

            address: '',  // 地址搜索关键字
            resultText: '',

            // FORM
            formLine: { // 路线信息
                name: '', // *路线名
                area: '', // *地域
                road_type: '', // *路面类型
                seasonsArray: [], // *[适用季节]
                video_link: '', // 路径视频演示
                paths: [], // *路径点
                note: '', // 备注
                thumb_up: 0, // *点赞数
                is_public: 1, // *是否共享
            }
        }
    },
    mounted() {
        AMapLoader
            .load({
                key: mapConfig.appId, // 开发应用的 ID
                version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
                plugins: [
                    // 'AMap.ToolBar', // 缩放按钮
                    'AMap.Scale', // 比例尺
                    'AMap.Geolocation', // 定位
                ],
            })
            .then(map => {
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
                this.map.on('click', res => {
                    this.positionPicked = {
                        lng: res.lnglat.lng,
                        lat: res.lnglat.lat
                    }
                })
                // 地图准备好之后，获取路线信息
                this.getLineInfo()
            })
            .catch(e => {
                console.log(e);
            })

    },
    computed: {
        ...mapState(['windowInsets'])
    },
    methods: {
        // 获取路线信息
        getLineInfo(){
            if (this.$route.query.routeId) {
                routeApi
                    .detail({
                        id: this.$route.query.routeId
                    })
                    .then(res => {
                        this.formLine = res.data
                        this.$set(this.formLine, 'seasonsArray', this.formLine.seasons.split('、'))
                        this.activeLineObj = res.data
                        this.pathPointers = JSON.parse(Base64.decode(this.activeLineObj.paths)).reverse()
                        this.loadLine(this.map, this.pathPointers)
                        this.loadLineLabels(this.map, this.pathPointers)
                    })
            } else {
                this.$message.success('没有指定路线 ID，将不展示任何路线')
            }
        },
        search(){
            const url = 'https://restapi.amap.com/v3/geocode/geo'
            axios({
                url,
                method: 'get',
                params: {
                    key: mapConfig.key,
                    address: this.address
                }
            })
                .then(response => {
                    let res = response.data
                    let geoLocation = res.geocodes[0].location
                    let locationInfo = res.geocodes[0]
                    console.log(geoLocation)
                    let locationArray = geoLocation.split(',')

                    this.positionPicked = {
                        lng: Number(locationArray[0]),
                        lat: Number(locationArray[1])
                    }
                    this.resultText = `${locationInfo.level}：${locationInfo.formatted_address}`
                })
        },
        // 添加新标记点和圆圈
        handleAddRoutePoint(routePoint){
            this.pathPointers.unshift({
                name: routePoint.name,
                position: [this.positionPicked.lng, this.positionPicked.lat],
                note: routePoint.note,
            })
            this.map.setCenter(routePoint.position) // 定位到中心位置
            this.addMarker(this.map, {
                position: routePoint.position,
                name: routePoint.name,
                note: routePoint.note
            })
        },

        // 设置地图中心点：用户坐标
        setMapCenterToUserLocation(status, res){
            console.log(res)
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

        // 打印 路线数据
        printRoute(){
            console.log(JSON.stringify([...this.pathPointers].reverse()))
        },

        // 展示规划的路线
        showLine(){
            this.map.clearMap() // 删除地图上的所有标记
            if (this.currentRouting){
                this.currentRouting.destroy() // 删除之前的路线
            }
            this.loadLine(this.map, this.pathPointers)
            this.loadLineLabels(this.map, this.pathPointers)
        },

        // 载入线路信息
        loadLine(map, pathPointers) {
            map.plugin('AMap.DragRoute', () => {
                // path 是驾车导航的起、途径和终点，最多支持16个途经点
                let path = []
                pathPointers.forEach(point => {
                    path.unshift(point.position) // 之前存入的是倒序的，所以现在给正过来
                })
                let route = new AMap.DragRoute(map, path, AMap.DrivingPolicy.LEAST_FEE, {
                    startMarkerOptions: {
                        offset: new AMap.Pixel(-13, -40),
                        icon: new AMap.Icon({ // 设置途经点的图标
                            size: new AMap.Size(26, 40),
                            image: ICON.start,
                            // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                            imageSize: new AMap.Size(26, 40) // 指定图标的大小，可以压缩图片

                        }),
                    },
                    endMarkerOptions: {
                        offset: new AMap.Pixel(-13, -40),
                        icon: new AMap.Icon({ // 设置途经点的图标
                            size: new AMap.Size(26, 40),
                            image: ICON.end,
                            // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                            imageSize: new AMap.Size(26, 40) // 指定图标的大小，可以压缩图片

                        }),
                    },
                    midMarkerOptions: {
                        offset: new AMap.Pixel(-5, -10),
                        icon: new AMap.Icon({ // 设置途经点的图标
                            size: new AMap.Size(15, 15),
                            image: ICON.midIcon,
                            // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                            imageSize: new AMap.Size(15, 15) // 指定图标的大小，可以压缩图片

                        }),
                    },
                })

                route.on('complete', res => {
                    // 路线规划完成后，返回的路线数据：设置距离、行驶时间
                    let lineData = res.data.routes[0]
                    let distance =  (lineData.distance / 1000).toFixed(1) // m -> km
                    let time = (lineData.time / 60).toFixed() // second -> min
                    this.activeLineObj = {
                        name: '临时路线'
                    }
                    this.$set(this.formLine, 'distance', distance)
                    this.$set(this.formLine, 'time', time)
                })


                // 切换线路之前如果存在路线，销毁已存在的路线
                if (this.currentRouting){
                    this.currentRouting.destroy()
                    this.currentRouting = null
                }
                this.currentRouting = route

                // 查询导航路径并开启拖拽导航
                this.currentRouting.search()
            })
        },

        // 添加路线 label 线路信息
        loadLineLabels(map, pathPointers) {
            pathPointers.forEach((item, index) => {
                this.addMarker(map, item, pathPointers.length - index)
            })
        },
        addMarker(map, item, index) {
            let marker = new AMap.Marker({
                position: item.position,
                content: `
               <div class="marker">
                  <div class="title">${index} - ${item.name}</div>
                  <div class="note">${item.note.replaceAll('|', '<br>')}</div>
               </div>`,
            });
            map.add(marker);
        }
    },
    watch: {
        routeData(newValue){
            if (newValue.length <= 0) return
            this.map.clearMap()
            newValue.forEach((item, index) => {
                this.addMarker(this.map, item, this.pathPointers.paths.length - index)
            })
        }
    },
    beforeDestroy() {
        this.map.destroy() // 销毁地图，释放内存
        this.map = null
    }
}


</script>

<style lang="scss" scoped>
@import "../../scss/plugin";
.map-container {
    position: relative;
}
.float-panel{
    position: absolute;
    left: 20px;
    top: 20px;
    width: 400px;
    .search-panel{
        background-color: white;
        padding: 10px;
    }
}

.result{
    background-color: white;
    padding: 10px;
}

.editor-form{
    position: absolute;
    right: 20px;
    top: 20px;
    width: 400px;
}
</style>
