<template>
    <div class="map-container">

        <div class="button-float btn-router-list"
             @click="isPointerListShowed = true"
             v-if="!isPointerListShowed && isInPortraitMode">
            <i class="el-icon-tickets"></i>
        </div>

        <!-- 点图列表 -->
        <div class="float-route-list-panel" v-loading="isLoading" v-if="isPointerListShowed">
            <PointerListPanel
                @chosePointer="changePointer"
                :pointerList="pointerList"/>
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
import mapData from './lines'
import PointerDetailPanel from "./components/PointerDetailPanel"
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
    components: {PointerListPanel, PointerDetailPanel},
    data() {
        return {
            isLoading: false,
            map: null,
            cluster: null,  // 点聚合的对象

            colors: mapData.COLORS,
            currentPointerId: 0,
            activePointerObj: null, // 当前 Line 对象

            pointerList: [], // 点图数组
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

        AMapLoader
            .load({
                key: mapConfig.key_web_js, // 开发应用的 ID
                version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
                plugins: [
                    'AMap.ToolBar', // 缩放按钮
                    'AMap.Scale', // 比例尺
                    'AMap.DragRoute', // 拖拽点图
                    'AMap.Driving', // 导航
                    'AMap.MarkerCluster', // 点聚合
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
                this.getPointerList()

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
                            console.log('绘制驾车点图完成')
                        } else {
                            console.log('获取驾车数据失败')
                        }
                    });
            })

        },

        // 获取点图列表
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
                        try  {
                            item.pointers = Base64.decode(item.pointers) || '[]'
                        } catch (err) {
                            item.pointers = '[]'
                            console.log(err)
                        }
                        item.pointerArray = JSON.parse(item.pointers)
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
        changePointer(pointerId){
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

            // 最终聚合之后，只显示一个点，这个点就是权重比较大的点，context 数据里的 clusterData 也只显示这个聚合位置的点，
            // 如果不显示报警的点，就无法获取这个点的报警状态，就无法显示报警
            // 所以增大报警点的权重
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
                if (item.img){
                    context.marker.setContent(`
                       <div class="marker ${(item.note || item.img) ? '': 'no-content'}">
                          <div class="marker-index">
                              <div class="title">${item.name}</div>
                          </div>
                          <div class="marker-content ">
                               <div class="note">${item.note.replaceAll('|', '<br>')}</div>
                               <div class="view">
                                   <a target="_blank" href="${item.img + '-' + mapConfig.thumbnail1500_suffix}">
                                      <img src="${item.img + '-' + mapConfig.thumbnail1000_suffix}" alt="view">
                                   </a>
                               </div>
                          </div>
                       </div>`)
                } else {
                    context.marker.setContent(`
                       <div class="marker ${(item.note || item.img) ? '': 'no-content'}">
                          <div class="marker-index">
                              <div class="title">${item.name}</div>
                          </div>
                          <div class="marker-content ">
                               <div class="note">${item.note.replaceAll('|', '<br>')}</div>
                          </div>
                       </div>`)
                }

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
                map.add(marker)
            }
        }

    },
    watch: {
        '$route.query.pointerId'(newValue){
            this.map.clearInfoWindow() // 清除地图上的信息窗体
            this.map.clearMap() // 删除所有 Marker
            this.getPointerInfo(newValue)
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
