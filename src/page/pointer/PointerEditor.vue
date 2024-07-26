<template>
    <div class="map-container">
        <!-- 编辑面板-->
        <transition
            enter-active-class="animate__bounceInDown"
            leave-active-class="animate__bounceOutUp"
        >
            <div class="card editor-panel">
                <div class="form-title">
                    <div class="collapse-btn">
                        <ElButton size="small" @click="toggleEditPanel">
                            <i v-if="isShowingEdit" class="ArrowUp"></i>
                            <i v-else class="ArrowDown"></i>
                            折叠面板
                        </ElButton>
                    </div>
                    <div class="title">
                        <p v-if="isEditingPointerInfo">编辑点图 {{ formPointer.name }}</p>
                        <p v-else>新建点图 {{ pointerId }}</p>
                    </div>
                </div>
                <ElForm
                    class="mt-2 p-1"
                    ref="refFormPointer"
                    v-if="formPointer && isShowingEdit"
                    :model="formPointer"
                    :rules="formPointerRules"
                    size="small"
                    label-width="70px"
                >
                    <ElFormItem label="点图名" prop="name">
                        <ElInput v-model="formPointer.name"/>
                    </ElFormItem>
                    <ElFormItem label="是否公开" prop="is_public">
                        <ElRadio :label="1" v-model="formPointer.is_public">公开</ElRadio>
                        <ElRadio :label="0" v-model="formPointer.is_public">私有</ElRadio>
                    </ElFormItem>
                    <ElFormItem label="地域" prop="area">
                        <ElInput v-model="formPointer.area"/>
                    </ElFormItem>
                    <ElFormItem label="视频链接" prop="video_link">
                        <ElInput v-model="formPointer.video_link"/>
                    </ElFormItem>
                    <ElFormItem label="备注" prop="note">
                        <ElInput type="textarea" placeholder="支持 Markdown" :rows="5" v-model="formPointer.note"/>
                    </ElFormItem>
                    <ElFormItem>
                        <ElButton v-if="getAuthorization()" @click="submit" type="primary" icon="Check">保存</ElButton>
                        <ElButton v-else @click="$router.push({name: 'Login'})" type="primary" icon="User">请先登录</ElButton>
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
                        <ElButton type="primary" @click="search" icon="Filter">搜索</ElButton>
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

            <PointerEditPanel
                class="mt-1"
                :search-location="searchAddress"
                @print="printPointers"
                @showPointer="showPointer"
                :lng="Number(positionPicked.lng)"
                :lat="Number(positionPicked.lat)"
                v-model="pointers"/>
        </div>


        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>

    </div>
</template>

<script lang="ts" setup>
import AMapLoader from '@amap/amap-jsapi-loader';
import PointerEditPanel from "./components/PointerEditPanel.vue";
import {key_service, key_web_js, thumbnail1000_suffix, thumbnail1500_suffix} from "@/mapConfig";
import axios from "axios";
import pointerApi from "@/api/pointerApi";
import {Base64} from "js-base64";
import {useProjectStore} from "@/pinia";
import {getAuthorization} from "@/utility";
import {useRouter, useRoute} from "vue-router";
import {computed, onMounted, onUnmounted, reactive, ref, watch} from "vue";
import {ElMessage, ElNotification, FormRules} from "element-plus";
import {EntityPointer, EntityPointerPoint} from "@/page/pointer/Pointer.ts";

const store = useProjectStore()
const route = useRoute()
const router = useRouter()

const MY_POSITION = [117.129533, 36.685668]

let AMap = null
let map = null

const refFormPointer = ref()
const isLoading = ref(false)
const pointers = ref<Array<EntityPointerPoint>>([])// 对应点的范围数据

const positionPicked = ref({
    lng: 0,
    lat: 0,
})

// SEARCH
const searchAddress = ref('')  // 地址搜索关键字
const searchResultText = ref('')

// FORM
const formPointer = ref({ // 点图信息
    name: '', // *点图名
    area: '', // *地域
    video_link: '', // 路径视频演示
    pointers: [], // *路径点
    note: '', // 备注
    thumb_up: 0, // *点赞数
    is_public: 1, // *是否公开
})
const formPointerRules = reactive<FormRules<EntityPointer>>({
        name: [{required: true, message: '请填写点图钱', trigger: 'blur'},],
        area: [{required: true, message: '请填写地域', trigger: 'blur'},],
    })

const isShowingEdit = ref(false)



onMounted(() => {
    isShowingEdit.value = true
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
        .then(mapItem => {
            AMap = mapItem

            map = new AMap.Map('container', {
                center: MY_POSITION,
                zoom: 11
            })

            // map.addControl(new AMap.ToolBar())
            map.addControl(new AMap.Scale())
            map.addControl(new AMap.Geolocation())

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

            geolocation.getCurrentPosition(setMapCenterToUserLocation)

            // 地图选点操作
            map.on('click', res => {
                positionPicked.value = {
                    lng: res.lnglat.lng,
                    lat: res.lnglat.lat
                }
            })
            // 地图准备好之后，获取点图信息
            getPointerInfo()
        })
        .catch(e => {
            console.log(e);
        })
})

const isEditingPointerInfo = computed(() => {
    return !isNaN(Number(route.query.pointerId))
})
const pointerId = computed(() => {
    return route.query.pointerId
})


function toggleEditPanel(){
    isShowingEdit.value = !isShowingEdit.value
}
function submit() {
    refFormPointer.value.validate(valid => {
        if (valid) {
            if (isEditingPointerInfo.value) {
                pointerModifySubmit()
            } else {
                pointerNewSubmit()
            }
        } else {
            console.log('error submit!!');
            return false;
        }
    })
}
// 编辑
function pointerModifySubmit() {
    if (pointers.value.length < 1){
        ElMessage.warning('没有添加任何点位')
        return
    }
    let requestData = {}
    Object.assign(requestData, formPointer.value)
    requestData.pointers = Base64.encode(JSON.stringify(pointers.value))
    pointerApi
        .modify(requestData)
        .then(res => {
            ElNotification({
                title: res.message,
                position: 'top-right',
                type: 'success',
                onClose() {
                }
            })
        })
}
// 新增
function pointerNewSubmit() {
    if (pointers.value.length < 1){
        ElMessage.warning('没有添加任何点位')
        return
    }
    let requestData = {}
    Object.assign(requestData, formPointer.value)
    requestData.pointers = Base64.encode(JSON.stringify(pointers.value))
    pointerApi
        .add(requestData)
        .then(res => {
            ElNotification({
                title: res.message,
                position: 'top-right',
                type: 'success',
                onClose() {
                }
            })
        })
}
// 获取点图信息
function getPointerInfo() {
    if (route.query.pointerId) {
        pointerApi
            .detail({
                id: route.query.pointerId
            })
            .then(res => {
                formPointer.value = res.data
                pointers.value = JSON.parse(Base64.decode(res.data.pointers))
                loadPointerLabels(map, pointers.value)
            })
    }
}
function search() {
    const url = 'https://restapi.amap.com/v3/geocode/geo'
    axios({
        url,
        method: 'get',
        params: {
            key: key_service,
            address: searchAddress.value
        }
    })
        .then(response => {
            let res = response.data
            let geoLocation = res.geocodes[0].location
            let locationInfo = res.geocodes[0]
            console.log(geoLocation)
            let locationArray = geoLocation.split(',')

            positionPicked.value = {
                lng: Number(locationArray[0]),
                lat: Number(locationArray[1])
            }
            searchResultText.value = `${locationInfo.level}：${locationInfo.formatted_address}`

            // 定位地图中心到搜索的地点
            map.setCenter(locationArray, false, 1000)

        })
}
// 添加新标记点和圆圈
function handleAddNewPointer(routePoint: EntityPointerPoint) {
    pointers.value.push({
        name: routePoint.name,
        position: [positionPicked.value.lng, positionPicked.value.lat],
        note: routePoint.note,
        type: routePoint.type,
        img: routePoint.img
    })
    map.setCenter(routePoint.position) // 定位到中心位置
    addMarker(map, {
        position: routePoint.position,
        name: routePoint.name,
        note: routePoint.note,
        type: routePoint.type,
        img: routePoint.img
    }, 0)
}
// 设置地图中心点：用户坐标
function setMapCenterToUserLocation(status, res) {
    if (status === 'complete') {
        let center = [res.position.lng, res.position.lat]
        map.setCenter(center)
        addMarker(map, {
            position: center,
            name: '我',
            note: ''
        })
    } else {
        console.log(res)
    }
}

// 打印 点图数据
function printPointers() {
    console.log(JSON.stringify([...pointers.value].reverse()))
}
// 展示规划的地图信息
function showPointer() {
    map.clearMap() // 删除地图上的所有标记
    loadPointerLabels(map, pointers.value)
}

/**
 * 记录是否已经居中过，居中操作只执行一次，避免在后面添加标点的时候每次都居中显示
 */
const isMapHasRelocatedToCenter = ref(false)
// 添加点图 label 线路信息
function loadPointerLabels(map, pathPointers: Array<EntityPointerPoint>) {
    pathPointers.forEach((item, index) => {
        addMarker(map, item, index)
    })

    if (!isMapHasRelocatedToCenter.value){
        let maxLocations =  getMaxBoundsPointer(pathPointers.map(item => item.position))
        // 取区间的 1/4 作为地图的边界
        let lngGap = (maxLocations.max[0] - maxLocations.min[0]) / 4
        let latGap = (maxLocations.max[1] - maxLocations.min[1]) / 4

        // 新的区域极点坐标
        let min = new AMap.LngLat(maxLocations.min[0] - lngGap, maxLocations.min[1] - latGap)
        let max = new AMap.LngLat(maxLocations.max[0] + lngGap, maxLocations.max[1] + latGap)

        // 1. 多个点时，设置 bounds
        if (pathPointers.length > 1){
            let bounds = new AMap.Bounds(min, max)
            map.setBounds(bounds)
        }
        // 2. 一个点时，将其作为中心点
        else if (pathPointers.length === 1){
            console.log(pathPointers)
            let centerLngLat = new AMap.LngLat(...pathPointers[0].position)
            map.setCenter(centerLngLat)  // 设置地图中心点坐标
        }
        // 3.
        else {

        }
        isMapHasRelocatedToCenter.value = true
    }
}

/**
 * 获取区域对角线的两点坐标，即这个区域内的最小坐标值和最大坐标值
 *
 */
function getMaxBoundsPointer(pointerArray: Array<EntityPointer>): {min: [number, number ], max: [number, number]}{
    let lngArray = pointerArray.map(item => item[0])
    let latArray = pointerArray.map(item => item[1])

    return {
        min: [Math.min(...lngArray),  Math.min(...latArray)],
        max: [Math.max(...lngArray),  Math.max(...latArray)],
    }
}

function addMarker(map, item: EntityPointerPoint, index: number) {
    let marker = null
    if (item.img){
        marker = new AMap.Marker({
            position: item.position,
            content: `
               <div class="marker ${item.type}">
                  <div class="marker-index">
                       <div class="index">${index + 1}</div>
                      <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note">${item.note.replace(/\n/g, '<br>')}</div>
                       <div class="view">
                           <a target="_blank" href="${item.img + '-' + thumbnail1500_suffix}">
                              <img src="${item.img + '-' + thumbnail1000_suffix}" alt="view">
                           </a>
                       </div>
                  </div>
               </div>
`,
        })
    } else if (item.note) {
        marker = new AMap.Marker({
            position: item.position,
            content: `
               <div class="marker ${item.type}">
                  <div class="marker-index">
                       <div class="index">${index + 1}</div>
                      <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note">${item.note.replace(/\n/g, '<br>')}</div>
                  </div>
               </div>`,
        })
    } else {
        marker = new AMap.Marker({
            position: item.position,
            content: `
               <div class="marker no-content ${item.type}">
                  <div class="marker-index">
                       <div class="index">${index + 1}</div>
                      <div class="title">${item.name}</div>
                  </div>
               </div>`,
        })
    }
    map.add(marker)

}


onUnmounted(() => {
    map.clearInfoWindow() // 清除地图上的信息窗体
    map.destroy() // 销毁地图，释放内存
    map = null
})

watch(pointers, () => {
    map.clearMap() // 删除地图上的所有标记
    loadPointerLabels(map, pointers.value)
}, {deep: true})



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
