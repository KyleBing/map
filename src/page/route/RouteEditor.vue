<template>
    <div class="map-container">

        <route-detail-panel
            class="detail-panel mt-1"
            v-if="activeLineObj"
            :line="activeLineObj"
        />

        <!-- 路线信息编辑面板-->
        <transition
            enter-active-class="animate__bounceInDown"
            leave-active-class="animate__bounceOutUp"
        >
            <div class="card editor-panel">
                <div class="form-title">
                    <div class="collapse-btn">
                        <ElButton size="small" @click="toggleEditPanel">
                            <i v-if="isShowingEdit" class="el-icon-arrow-up"></i>
                            <i v-else class="el-icon-arrow-down"></i>
                            折叠面板
                        </ElButton>
                    </div>
                    <div class="title">
                        <p v-if="isEditingLineInfo">编辑路线 {{ formLine.name }}</p>
                        <p v-else>新建路线 {{ lineId }}</p>
                    </div>
                </div>
                <ElForm
                    class="mt-2 p-1"
                    ref="formLine"
                    v-if="formLine && isShowingEdit"
                    :model="formLine"
                    :rules="formLineRules"
                    size="small"
                    label-width="80px"
                >
                    <ElFormItem label="路线名" prop="name">
                        <ElInput v-model="formLine.name"/>
                    </ElFormItem>
                    <ElFormItem label="是否公开" prop="is_public">
                        <ElRadio :label="1" v-model="formLine.is_public">公开</ElRadio>
                        <ElRadio :label="0" v-model="formLine.is_public">私有</ElRadio>
                    </ElFormItem>
                    <ElFormItem label="地域" prop="area">
                        <ElInput v-model="formLine.area"/>
                    </ElFormItem>
                    <ElFormItem label="路线类型" prop="road_type">
                        <ElInput v-model="formLine.road_type"/>
                    </ElFormItem>
                    <ElFormItem label="适用季节" prop="seasons">
                        <ElCheckboxGroup v-model="formLine.seasonsArray">
                            <ElCheckboxButton label="春"></ElCheckboxButton>
                            <ElCheckboxButton label="夏"></ElCheckboxButton>
                            <ElCheckboxButton label="秋"></ElCheckboxButton>
                            <ElCheckboxButton label="冬"></ElCheckboxButton>
                        </ElCheckboxGroup>
                    </ElFormItem>
                    <ElFormItem label="视频链接" prop="video_link">
                        <ElInput v-model="formLine.video_link"/>
                    </ElFormItem>
                    <ElFormItem label="备注" prop="note">
                        <ElInput type="textarea" placeholder="支持 Markdown" :rows="5" v-model="formLine.note"/>
                    </ElFormItem>
                    <ElFormItem label="总里程" prop="distance">
                        <ElInput disabled readonly v-model="formLine.distance">
                            <template slot="append">km</template>
                        </ElInput>
                    </ElFormItem>
                    <ElFormItem label="用时" prop="time">
                        <ElInput disabled readonly v-model="formLine.time">
                            <template slot="append">分钟</template>
                        </ElInput>
                    </ElFormItem>
                    <ElFormItem>
                        <ElButton v-if="store.authorization" @click="submit" type="primary" icon="el-icon-check">保存</ElButton>
                        <ElButton v-else @click="$router.push({name: 'Login'})" type="primary" icon="el-icon-user">请先登录</ElButton>
                    </ElFormItem>
                </ElForm>
            </div>
        </transition>

        <div class="float-panel">
            <!-- 搜索面板 -->
            <div class="search-panel card">
                <ElForm inline @submit="search" size="small">
                    <ElFormItem class="mb-0" label="地址">
                        <ElInput style="width: 200px" placeholder="输入较完整的地址" v-model="searchAddress"></ElInput>
                    </ElFormItem>
                    <ElFormItem class="mb-0" label="">
                        <ElButton type="primary" @click="search" icon="el-icon-search">搜索</ElButton>
                    </ElFormItem>
                </ElForm>

                <ElForm inline class="mt-1" size="small">
                    <ElFormItem class="mb-0" label="经度">
                        <ElInput style="width:140px" placeholder="lng" v-model="positionPicked.lng"></ElInput>
                    </ElFormItem>
                    <ElFormItem class="mb-0" label="纬度">
                        <ElInput style="width:140px" placeholder="lat" v-model="positionPicked.lat"></ElInput>
                    </ElFormItem>
                </ElForm>
            </div>

            <!-- 结果面板 -->
            <div class="result card mt-1" v-if="searchResultText">
                {{ searchResultText }}
            </div>

            <route-panel
                class="mt-1"
                :search-location="searchAddress"
                @pointAdd="handleAddRoutePoint"
                @print="printRoute"
                @showLine="showLine"
                @changeCurrentPolicy="changePolicy"
                :policyArray="policyArray"
                :policy="currentPolicy"
                :lng="Number(positionPicked.lng)"
                :lat="Number(positionPicked.lat)"
                v-model="pathPointers"/>
        </div>


        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>

    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader';
import ICON from "@/assets/icons";
import RoutePanel from "@/page/tool/route/components/RoutePanel.vue";

import {key_web_js} from "@/mapConfig";
import RouteDetailPanel from "@/page/route/components/RouteDetailPanel.vue";
import axios from "axios";
import {Base64} from "js-base64";

import {policyArray} from "./DrivingPolicy"
import {useProjectStore} from "@/pinia";
import {routeAdd, routeDetail, routeModify} from "@/api/routeApi";

const store = useProjectStore()


const MY_POSITION = [117.129533, 36.685668]
let AMap = null
export default {
    name: "RouteEditor",
    components: {RouteDetailPanel, RoutePanel},
    data() {
        return {
            store,

            activeLineObj: null,

            isLoading: false,
            map: null,

            currentMarkers: [],

            currentDragRouting: null,  // 当前导航路线，拖拽导航路径对象

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

            policyArray, // 路径规划策略
            currentPolicy: 2, // 当前路径规则策略

            // SEARCH
            searchAddress: '',  // 地址搜索关键字
            searchResultText: '',

            // FORM
            formLine: { // 路线信息
                name: '', // *路线名
                area: '', // *地域
                road_type: '', // *路面类型
                policy: 2, // 路线规划策略 默认为最短距离
                seasonsArray: [], // *[适用季节]
                video_link: '', // 路径视频演示
                paths: [], // *路径点
                note: '', // 备注
                thumb_up: 0, // *点赞数
                is_public: 1, // *是否公开
            },
            formLineRules: {
                name: [{required: true, message: '请填写路线钱', trigger: 'blur'},],
                area: [{required: true, message: '请填写地域', trigger: 'blur'},],
                policy: [{required: true, message: '请选择路线规划策略', trigger: 'blur'},],
                road_type: [{required: true, message: '请填写路面类型', trigger: 'blur'},],
                seasonsArray: [{required: true, message: '请选择季节', trigger: 'blur'},],
            },

            isShowingEdit: false,
        }
    },
    mounted() {
        this.isShowingEdit = true
        AMapLoader
            .load({
                key: key_web_js, // 开发应用的 ID
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
                this.map.addControl(new AMap.Geolocation())

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
        isEditingLineInfo() {
            return !isNaN(Number(this.$route.query.lineId))
        },
        lineId() {
            return this.$route.query.lineId
        }
    },
    methods: {
        toggleEditPanel(){
            this.isShowingEdit = !this.isShowingEdit
        },
        changePolicy(policy){
            console.log('最新的 policy', policy)
            this.currentPolicy = policy
        },
        submit() {
            this.$refs['formLine'].validate((valid) => {
                if (valid) {

                    let tempJsonStr = JSON.stringify(this.pathPointers)
                    try {
                        let convertObject = JSON.parse(tempJsonStr)
                    } catch (err){
                        this.$message.error('节点数据格式错误，请检查')
                        return
                    }

                    if (this.isEditingLineInfo) {
                        this.routeModifySubmit()
                    } else {
                        this.routeNewSubmit()
                    }
                } else {
                    console.log('error submit!!');
                    return false;
                }
            })
        },
        // 编辑
        routeModifySubmit() {
            if (this.pathPointers.length < 1){
                this.$message.warning('没有任何途经点')
                return
            }
            this.formLine.policy = this.currentPolicy
            let requestData = {}
            Object.assign(requestData, this.formLine)
            requestData.paths = Base64.encode(JSON.stringify(this.pathPointers))
            routeModify(requestData)
                .then(res => {
                    this.$notify({
                        title: res.message,
                        position: 'top-right',
                        type: 'success',
                        onClose() {
                        }
                    })
                    this.modalEdit = false
                })
        },
        // 新增
        routeNewSubmit() {
            if (this.pathPointers.length < 1){
                this.$message.warning('没有任何途经点')
                return
            }
            this.formLine.policy = this.currentPolicy
            let requestData = {}
            Object.assign(requestData, this.formLine)
            requestData.paths = Base64.encode(JSON.stringify(this.pathPointers))
            routeAdd(requestData)
                .then(res => {
                    this.$notify({
                        title: res.message,
                        position: 'top-right',
                        type: 'success',
                        onClose() {
                        }
                    })
                    this.modalEdit = false
                })
        },
        // 获取路线信息
        getLineInfo() {
            if (this.$route.query.lineId) {
                routeDetail({
                        id: this.$route.query.lineId
                    })
                    .then(res => {
                        this.formLine = res.data
                        this.currentPolicy = res.data.policy
                        this.$set(this.formLine, 'seasonsArray', this.formLine.seasons.split('、'))
                        this.activeLineObj = res.data
                        this.pathPointers = JSON.parse(Base64.decode(this.activeLineObj.paths))
                        this.loadLine(this.map, this.pathPointers)
                        this.loadLineLabels(this.map, this.pathPointers)
                    })
            }
        },
        search() {
            const url = 'https://restapi.amap.com/v3/geocode/geo'
            axios({
                url,
                method: 'get',
                params: {
                    key: mapConfig.key_service,
                    address: this.searchAddress
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
                    this.searchResultText = `${locationInfo.level}：${locationInfo.formatted_address}`

                    // 定位地图中心到搜索的地点
                    this.map.setCenter(locationArray, false, 1000)

                })
        },
        // 添加新标记点和圆圈
        handleAddRoutePoint(routePoint) {
            this.pathPointers.push({
                name: routePoint.name,
                position: [this.positionPicked.lng, this.positionPicked.lat],
                note: routePoint.note,
                img: routePoint.img
            })
            this.map.setCenter(routePoint.position) // 定位到中心位置
            this.addMarker(this.map, {
                position: routePoint.position,
                name: routePoint.name,
                note: routePoint.note,
                img: routePoint.img
            }, 0)
        },
        // 设置地图中心点：用户坐标
        setMapCenterToUserLocation(status, res) {
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
        printRoute() {
            console.log(JSON.stringify([...this.pathPointers].reverse()))
        },
        // 展示规划的路线
        showLine() {
            this.map.clearMap() // 删除地图上的所有标记
            if (this.currentDragRouting) {
                this.currentDragRouting.destroy() // 删除之前的路线
            }
            this.loadLine(this.map, this.pathPointers)
            this.loadLineLabels(this.map, this.pathPointers)
        },
        // 载入线路信息
        loadLine(map, pathPointers) {
            this.currentMarkers = []

            // 切换线路之前如果存在路线，销毁已存在的路线
            if (this.currentDragRouting) {
                this.currentDragRouting.destroy()
                this.currentDragRouting = null
            }
            map.plugin('AMap.DragRoute', () => {
                // path 是驾车导航的起、途径和终点，最多支持16个途经点
                let path = pathPointers.map(point => point.position)
                this.currentDragRouting = new AMap.DragRoute(map, path, this.currentPolicy, {
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
                        offset: new AMap.Pixel(-9, -9),
                        icon: new AMap.Icon({ // 设置途经点的图标
                            size: new AMap.Size(30, 30),
                            image: ICON.midIcon,
                            // imageOffset: new AMap.Pixel(0,0), // 图片的偏移量，在大图中取小图的时候有用
                            imageSize: new AMap.Size(18, 18) // 指定图标的大小，可以压缩图片

                        }),
                    },
                })

                // 添加途经点时
                this.currentDragRouting.on('addway', res => {
                    if (res.lnglat){
                        this.positionPicked = {
                            lng: res.lnglat.lng,
                            lat: res.lnglat.lat
                        }
                    }
                })

                // 路线规划完成时
                this.currentDragRouting.on('complete', res => {
                    // 路线规划完成后，返回的路线数据：设置距离、行驶时间
                    let lineData = res.data.routes[0]
                    let distance = (lineData.distance / 1000).toFixed(1) // m -> km
                    let time = (lineData.time / 60).toFixed() // second -> min
                    this.activeLineObj = {
                        name: '临时路线'
                    }
                    this.$set(this.formLine, 'distance', distance)
                    this.$set(this.formLine, 'time', time)

                })

                // 查询导航路径并开启拖拽导航
                this.currentDragRouting.search()
            })
        },
        // 添加路线 label 线路信息
        loadLineLabels(map, pathPointers) {
            pathPointers.forEach((item, index) => {
                this.addMarker(map, item, index)
            })
        },
        addMarker(map, item, index) {
            let marker
            if (item.img){
                marker = new AMap.Marker({
                    position: item.position,
                    title: item.note,
                    draggable: true,
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
               </div>
`,
                })
            } else {
                marker = new AMap.Marker({
                    position: item.position,
                    title: item.note,
                    draggable: true,
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
            }
            this.currentMarkers.push(marker)
            map.add(marker)

        }
    },
    watch: {
        routeData(newValue) {
            if (newValue.length <= 0) return
            this.map.clearMap()
            this.currentDragRouting && this.currentDragRouting.destroy() // 销毁行程规划
            newValue.forEach((item, index) => {
                this.addMarker(this.map, item, index)
            })
        },
        'formLine.seasonsArray'(newValue){
            this.formLine.seasons = newValue.join('、')
        },
        currentPolicy(newValue){
            this.showLine()
        }
    },
    beforeDestroy() {
        this.currentDragRouting && this.currentDragRouting.destroy() // 销毁行程规划
        this.map.clearInfoWindow() // 清除地图上的信息窗体
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

.float-panel {
    position: absolute;
    left: 20px;
    top: 20px;
    width: 400px;
    z-index: 100;

    .search-panel {
        background-color: white;
        padding: 10px;
    }
}

.result {
    background-color: white;
    padding: 10px;
}

.editor-panel {
    z-index: 100;
    position: absolute;
    right: 20px;
    top: 20px;
    width: 400px;
}



.form-title {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .collapse-btn{
        flex-shrink: 0;
    }
    .title{
        font-weight: bold;
        text-align: center;
        flex-grow: 1;

    }
}

@media (max-width: $screen-width-threshold) {
    .float-panel{
        left: auto;
        top: auto;
        right: auto;
        bottom: auto;
        width: 100%;
        position: relative;
    }
    .editor-panel{
        left: auto;
        top: auto;
        right: auto;
        bottom: auto;
        width: 100%;
        position: relative;
    }
}
</style>
