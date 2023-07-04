<template>
    <div class="map-container">

        <route-detail-panel
            class="detail-panel mt-1"
            v-if="activeLineObj"
            :line="activeLineObj"
        />

        <!-- 点图信息编辑面板-->
        <transition
            enter-active-class="animate__bounceInDown"
            leave-active-class="animate__bounceOutUp"
        >
            <div class="card editor-panel">
                <div class="form-title">
                    <div class="collapse-btn">
                        <el-button size="mini" @click="toggleEditPanel">
                            <i v-if="isShowingEdit" class="el-icon-arrow-up"></i>
                            <i v-else class="el-icon-arrow-down"></i>
                            折叠面板
                        </el-button>
                    </div>
                    <div class="title">
                        <p v-if="isEditingLineInfo">编辑点图 {{ formPointer.name }}</p>
                        <p v-else>新建点图 {{ pointerId }}</p>
                    </div>
                </div>
                <el-form
                    class="mt-2 p-1"
                    ref="formPointer"
                    v-if="formPointer && isShowingEdit"
                    :model="formPointer"
                    :rules="formPointerRules"
                    size="mini"
                    label-width="80px"
                >
                    <el-form-item label="点图名" prop="name">
                        <el-input v-model="formPointer.name"/>
                    </el-form-item>
                    <el-form-item label="是否公开" prop="is_public">
                        <el-radio :label="1" v-model="formPointer.is_public">公开</el-radio>
                        <el-radio :label="0" v-model="formPointer.is_public">私有</el-radio>
                    </el-form-item>
                    <el-form-item label="地域" prop="area">
                        <el-input v-model="formPointer.area"/>
                    </el-form-item>
                    <el-form-item label="视频链接" prop="video_link">
                        <el-input v-model="formPointer.video_link"/>
                    </el-form-item>
                    <el-form-item label="备注" prop="note">
                        <el-input type="textarea" placeholder="支持 Markdown" :rows="5" v-model="formPointer.note"/>
                    </el-form-item>
                    <el-form-item>
                        <el-button v-if="authorization" @click="submit" type="primary" icon="el-icon-check">保存</el-button>
                        <el-button v-else @click="$router.push({name: 'Login'})" type="primary" icon="el-icon-user">请先登录</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </transition>

        <div class="float-panel">
            <!-- 搜索面板 -->
            <div class="search-panel card">
                <el-form inline @submit="search" size="mini">
                    <el-form-item class="mb-0" label="地址">
                        <el-input style="width: 200px" placeholder="输入较完整的地址" v-model="searchAddress"></el-input>
                    </el-form-item>
                    <el-form-item class="mb-0" label="">
                        <el-button type="primary" @click="search" icon="el-icon-search">搜索</el-button>
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
            <div class="result card mt-1" v-if="searchResultText">
                {{ searchResultText }}
            </div>

            <PointerEditPanel
                class="mt-1"
                :search-location="searchAddress"
                @pointAdd="handleAddNewPointer"
                @print="printPointers"
                @showPointer="showPointer"
                :lng="Number(positionPicked.lng)"
                :lat="Number(positionPicked.lat)"
                v-model="pointers"/>
        </div>


        <div id="container" :style="`height: ${windowInsets.height}px`"></div>

    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader';
import ICON from "@/assets/icons";
import PointerEditPanel from "./components/PointerEditPanel";

import {mapGetters, mapState} from 'vuex'
import mapConfig from "../../mapConfig";
import RouteDetailPanel from "@/page/route/components/RouteDetailPanel.vue";
import axios from "axios";
import pointerApi from "@/api/pointerApi";
import {Base64} from "js-base64";

const MY_POSITION = [117.129533, 36.685668]
let AMap = null
export default {
    name: "PointerEditor",
    components: {RouteDetailPanel, PointerEditPanel},
    data() {
        return {
            activeLineObj: null,

            isLoading: false,
            map: null,

            pointers: [
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

            // SEARCH
            searchAddress: '',  // 地址搜索关键字
            searchResultText: '',

            // FORM
            formPointer: { // 点图信息
                name: '', // *点图名
                area: '', // *地域
                video_link: '', // 路径视频演示
                pointers: [], // *路径点
                note: '', // 备注
                thumb_up: 0, // *点赞数
                is_public: 1, // *是否公开
            },
            formPointerRules: {
                name: [{required: true, message: '请填写点图钱', trigger: 'blur'},],
                area: [{required: true, message: '请填写地域', trigger: 'blur'},],
            },

            isShowingEdit: false,
        }
    },
    mounted() {
        this.isShowingEdit = true
        AMapLoader
            .load({
                key: mapConfig.key_web_js, // 开发应用的 ID
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
                // 地图准备好之后，获取点图信息
                this.getPointerInfo()
            })
            .catch(e => {
                console.log(e);
            })
    },
    computed: {
        ...mapGetters(["isAdmin"]),
        ...mapState(["windowInsets", "authorization"]),
        isEditingLineInfo() {
            return !isNaN(Number(this.$route.query.pointerId))
        },
        pointerId() {
            return this.$route.query.pointerId
        }
    },
    methods: {
        toggleEditPanel(){
            this.isShowingEdit = !this.isShowingEdit
        },
        submit() {
            this.$refs['formPointer'].validate((valid) => {
                if (valid) {
                    if (this.isEditingLineInfo) {
                        this.pointerModifySubmit()
                    } else {
                        this.pointerNewSubmit()
                    }
                } else {
                    console.log('error submit!!');
                    return false;
                }
            })
        },
        // 编辑
        pointerModifySubmit() {
            if (this.pointers.length < 1){
                this.$message.warning('没有添加任何点位')
                return
            }
            let requestData = {}
            Object.assign(requestData, this.formPointer)
            requestData.pointers = Base64.encode(JSON.stringify(this.pointers))
            pointerApi
                .modify(requestData)
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
        pointerNewSubmit() {
            if (this.pointers.length < 1){
                this.$message.warning('没有添加任何点位')
                return
            }
            let requestData = {}
            Object.assign(requestData, this.formPointer)
            requestData.pointers = Base64.encode(JSON.stringify(this.pointers))
            pointerApi
                .add(requestData)
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
        // 获取点图信息
        getPointerInfo() {
            if (this.$route.query.pointerId) {
                pointerApi
                    .detail({
                        id: this.$route.query.pointerId
                    })
                    .then(res => {
                        this.formPointer = res.data
                        this.activeLineObj = res.data
                        this.pointers = JSON.parse(Base64.decode(this.activeLineObj.pointers))
                        this.loadPointerLabels(this.map, this.pointers)
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
        handleAddNewPointer(routePoint) {
            this.pointers.push({
                name: routePoint.name,
                position: [this.positionPicked.lng, this.positionPicked.lat],
                note: routePoint.note,
                type: routePoint.type,
                img: routePoint.img
            })
            this.map.setCenter(routePoint.position) // 定位到中心位置
            this.addMarker(this.map, {
                position: routePoint.position,
                name: routePoint.name,
                note: routePoint.note,
                type: routePoint.type,
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
        // 打印 点图数据
        printPointers() {
            console.log(JSON.stringify([...this.pointers].reverse()))
        },
        // 展示规划的地图信息
        showPointer() {
            this.map.clearMap() // 删除地图上的所有标记
            this.loadPointerLabels(this.map, this.pointers)
        },
        // 添加点图 label 线路信息
        loadPointerLabels(map, pathPointers) {
            pathPointers.forEach((item, index) => {
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
               </div>
`,
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
        routeData(newValue) {
            if (newValue.length <= 0) return
            this.map.clearMap()
            newValue.forEach((item, index) => {
                this.addMarker(this.map, item, index)
            })
        },
    },
    beforeDestroy() {
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
