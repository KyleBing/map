<template>
    <div class="map-container">

        <div class="button-float btn-router-list"
             @click="isPointerListShowed = true"
             v-if="!isPointerListShowed && isInPortraitMode">
            <i class="el-icon-tickets"></i>
        </div>

        <!-- 路线列表 -->
        <div class="float-route-list-panel" v-loading="isLoading" v-if="isPointerListShowed">
            <PointerListPanel
                @choseLine="changeLine"
                :pointerList="pointerList"/>
        </div>

        <!-- 地图 -->
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>

        <!-- DETAIL INFO -->
        <detail
            v-if="activePointerObj && (!isInPortraitMode || !isPointerListShowed)"
            :pointer="activePointerObj"
            @openInGaodeApp="openInGaodeApp"
        />
    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader'
import mapData from './lines'
import ICON from "@/assets/icons"
import Detail from "./components/PointerDetail"
import {mapGetters, mapState} from "vuex"
import mapConfig from "../../mapConfig";
import pointerApi from "@/api/pointerApi";

import {Base64} from "js-base64"
import utility from "@/utility";
import PointerListPanel from "./components/PointerListPanel";

const MY_POSITION = [117.129533, 36.685668]
let AMap = null

export default {
    name: "PointerViewer",
    components: {PointerListPanel, Detail},
    data() {
        return {
            isLoading: false,
            map: null,
            colors: mapData.COLORS,
            currentPointerId: 0,
            activePointerObj: null, // 当前 Line 对象

            pointerList: [], // 路线数组
            // pager
            pager: {
                pageSize: 30,
                pageNo: 1,
                total: 0
            },

            // float route list
            isPointerListShowed: true, // route list 是否显示
        }
    },
    mounted() {
        this.getPointerList()
        AMapLoader
            .load({
                key: mapConfig.appId, // 开发应用的 ID
                version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
                plugins: [
                    'AMap.ToolBar', // 缩放按钮
                    'AMap.Scale', // 比例尺
                    'AMap.DragRoute', // 拖拽路线
                    'AMap.Driving', // 导航
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
                if (this.$route.query.lineId) {
                    this.getPointerInfo(this.$route.query.lineId)
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
                            console.log('绘制驾车路线完成')
                        } else {
                            console.log('获取驾车数据失败')
                        }
                    });
            })

        },

        // 获取路线列表
        getPointerList() {
            this.isLoading = true
            let requestData = {
                pageNo: this.pager.pageNo,
                pageSize: this.pager.pageSize
            }
            pointerApi
                .list(requestData)
                .then(res => {
                    this.isLoading = false
                    this.pager = res.data.pager
                    this.pointerList = res.data.list.map(item => {
                        item.pointers = Base64.decode(item.pointers) || ''
                        item.pointerArray = item.pointers && JSON.parse(item.pointers)
                        item.date_init = utility.dateFormatter(new Date(item.date_init))
                        item.date_modify = utility.dateFormatter(new Date(item.date_modify))
                        return item
                    })
                })
                .catch(err => {
                    this.isLoading = false
                })
        },

        // Change Pointer
        changeLine(pointerId){
            this.$router.push({
                name: 'PointerViewer',
                query: {
                    pointerId
                }
            })
            if (innerWidth < 500){
                this.isPointerListShowed = false
            }
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

        resizeMap() {
            let mapContainer = document.getElementById('container')
            mapContainer.style.height = window.innerHeight + "px"
            mapContainer.style.width = window.innerWidth + "px"
        },

        // 添加路线 Label
        loadPointerLabels(map, line) {
            line.pointerArray.forEach((item, index) => {
                this.addMarker(map, item, index)
            })
        },
        addMarker(map, item, index) {
            if (item.img){
                let marker = new AMap.Marker({
                    position: item.position,
                    content: `
               <div class="marker">
                  <div class="marker-index">
                       <div class="index">${index + 1}</div>
                      <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note">${item.note.replaceAll('|', '<br>')}</div>
                       <div class="view">
                           <a target="_blank" href="${item.img + '-' + mapConfig.thumbnail1500_suffix}">
                              <img src="${item.img + '-' + mapConfig.thumbnail1000_suffix}" alt="view">
                           </a>
                       </div>
                  </div>
               </div>`,
                })
                marker.on('mouseover', mapEvent => {
                    mapEvent.target.dom.style.zIndex = '999'
                })
                marker.on('mouseleave', mapEvent => {
                    mapEvent.target.dom.style.zIndex = '12'
                })
                map.add(marker)
            } else {
                let marker = new AMap.Marker({
                    position: item.position,
                    content: `
               <div class="marker">
                  <div class="marker-index">
                       <div class="index">${index + 1}</div>
                       <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note">${item.note.replaceAll('|', '<br>')}</div>
                  </div>
               </div>`,
                })
                marker.on('mouseover', mapEvent => {
                    mapEvent.target.dom.style.zIndex = '999'
                })
                marker.on('mouseleave', mapEvent => {
                    mapEvent.target.dom.style.zIndex = '12'
                })
                map.add(marker)
            }
        }

    },
    watch: {
        '$route.query.pointerId'(newValue){
            this.currentDragRouting && this.currentDragRouting.destroy() // 销毁行程规划
            this.map.clearInfoWindow() // 清除地图上的信息窗体
            this.map.clearMap() // 删除所有 Marker
            this.getPointerInfo(newValue)
        }
    },
    beforeDestroy() {
        this.currentDragRouting && this.currentDragRouting.destroy() // 销毁行程规划
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

.float-route-list-panel{
    min-height: 300px;
    position: absolute;
    z-index: 1000;
    top: 20px;
    left: 20px;
}

@media (max-width: $screen-width-threshold) {
    .float-route-list-panel{
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
