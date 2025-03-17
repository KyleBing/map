<template>
    <div class="map-container">
        <div class="float-panel">
            <SearchPanel @choose-location="chooseLocation"/>

            <div class="search-panel card">
                <ElForm inline class="" size="small" >
                    <ElFormItem class="mb-0" label="经度" label-width="80px">
                        <ElInput style="width:120px" placeholder="lng" v-model="positionPicked.lng"></ElInput>
                    </ElFormItem>
                    <ElFormItem class="mb-0" label="纬度">
                        <ElInput style="width:120px" placeholder="lat" v-model="positionPicked.lat"></ElInput>
                    </ElFormItem>
                </ElForm>
            </div>

            <RouteEditPanel
                class="mt-1"
                :policy="currentPolicy"
                :lng="Number(positionPicked.lng)"
                :lat="Number(positionPicked.lat)"
                v-model="pathPointers"
                :keyword="keyword"
                @print="printRoute"
                @showLine="showLine"
                @changeCurrentPolicy="changePolicy"
            />
        </div>

        <!-- 路线信息编辑面板-->
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
                        <p v-if="isEditingLineInfo">编辑路线 {{ formLine.name }}</p>
                        <p v-else>新建路线 {{ lineId }}</p>
                    </div>
                </div>
                <ElForm
                    class="mt-2 p-1"
                    ref="refFormLine"
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
                            <ElCheckboxButton value="春">春</ElCheckboxButton>
                            <ElCheckboxButton value="夏">夏</ElCheckboxButton>
                            <ElCheckboxButton value="秋">秋</ElCheckboxButton>
                            <ElCheckboxButton value="冬">冬</ElCheckboxButton>
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
                            <template #append>km</template>
                        </ElInput>
                    </ElFormItem>
                    <ElFormItem label="用时" prop="time">
                        <ElInput disabled readonly v-model="formLine.time">
                            <template #append>分钟</template>
                        </ElInput>
                    </ElFormItem>
                    <ElFormItem>
                        <ElButton v-if="store.authorization" @click="submit" type="primary" icon="Check">保存</ElButton>
                        <ElButton v-else @click="$router.push({name: 'Login'})" type="primary" icon="User">请先登录</ElButton>
                    </ElFormItem>
                </ElForm>
            </div>
        </transition>


        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>
    </div>
</template>

<script lang="ts" setup>

import AMapLoader from '@amap/amap-jsapi-loader';
import ICON from "@/assets/icons";
import RouteEditPanel from "@/page/route/components/RouteEditPanel.vue";
import {key_web_js} from "@/mapConfig";
import {Base64} from "js-base64";

import {useProjectStore} from "@/pinia";
import routeApi from "@/api/routeApi";
import {computed, onMounted, onUnmounted, reactive, ref, watch} from "vue";
import {EntityRoute, EntityRoutePoint} from "@/page/route/Route.ts";
import {ElMessage, ElNotification, FormRules} from "element-plus";
import {useRoute} from "vue-router";
import {generateMarkerContent} from "@/page/MyMapLib.ts";
import SearchPanel from "@/page/SearchPanel.vue";

const store = useProjectStore()
const route = useRoute()

const MY_POSITION = [117.129533, 36.685668]
let AMap = null

let activeLineObj = ref(null)
const isLoading = ref(false)
const currentDragRouting = ref(null) // 当前导航路线，拖拽导航路径对象
const positionPicked = ref({lng: 0, lat: 0})


/**
 * SEARCH
 */
const keyword = ref('')
function chooseLocation(location: {name: string, location: number[], keyword: string}){
    keyword.value = location.keyword
    positionPicked.value = {
        lng: location.location[0],
        lat: location.location[1],
    }
    window.map.setCenter(location.location)
}


/**
 * POINTERS
 */
const pathPointers = ref<Array<EntityRoutePoint>>([]) // 对应点的范围数据
watch(pathPointers, () => {
    window.map.clearMap() // 删除地图上的所有标记
    loadLineLabels(window.map, pathPointers.value)
}, {deep: true})

/**
 * policy change
 */
const currentPolicy = ref(2) // 当前路径规则策略
watch(currentPolicy, () => {
    showLine()
})

/**
 * FORM
 */
const isShowingEdit = ref(false)
const refFormLine = ref()
const formLine = ref<EntityRoute>({ // 路线信息
    name: '', // *路线名
    area: '', // *地域
    road_type: '', // *路面类型
    policy: 2, // 路线规划策略 默认为最短距离
    seasonsArray: [], // *[适用季节]
    video_link: '', // 路径视频演示
    paths: '', // *路径点
    note: '', // 备注
    thumb_up: 0, // *点赞数
    is_public: 1, // *是否公开
})
const formLineRules = reactive<FormRules<EntityRoute>>({
    name: [{required: true, message: '请填写路线钱', trigger: 'blur'},],
    area: [{required: true, message: '请填写地域', trigger: 'blur'},],
    policy: [{required: true, message: '请选择路线规划策略', trigger: 'blur'},],
    road_type: [{required: true, message: '请填写路面类型', trigger: 'blur'},],
    seasonsArray: [{required: true, message: '请选择季节', trigger: 'blur'},],
})

watch(() => formLine.value.seasonsArray, newValue => {
    formLine.value.seasons = newValue.join('、')
})


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

            window.map = new AMap.Map('container', {
                center: MY_POSITION,
                zoom: 11
            })

            // map.addControl(new AMap.ToolBar())
            window.map.addControl(new AMap.Scale())
            window.map.addControl(new AMap.Geolocation())

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

            // 获取用户当前位置
            if (store.isShowUserSelfLocation){
                geolocation.getCurrentPosition(setMapCenterToUserLocation)
            }

            // 地图选点操作
            window.map.on('click', res => {
                positionPicked.value = {
                    lng: res.lnglat.lng,
                    lat: res.lnglat.lat
                }
            })
            // 地图准备好之后，获取路线信息
            getLineInfo()
        })
        .catch(e => {
            console.log(e);
        })
})


/**
 * COMPUTED VALUE
 */
const isEditingLineInfo = computed(() => {
    return !isNaN(Number(route.query.lineId))
})
const lineId = computed(() => {
    return route.query.lineId
})


function toggleEditPanel(){
    isShowingEdit.value = !isShowingEdit.value
}
function changePolicy(policy: number){
    console.log('最新的 policy', policy)
    currentPolicy.value = policy
}

function submit() {
    refFormLine.value.validate(valid => {
        if (valid) {

            let tempJsonStr = JSON.stringify(pathPointers.value)
            try {
                let convertObject = JSON.parse(tempJsonStr)
            } catch (err){
                ElMessage.error('节点数据格式错误，请检查')
                return
            }

            if (isEditingLineInfo.value) {
               routeModifySubmit()
            } else {
               routeNewSubmit()
            }
        } else {
            console.log('error submit!!');
            return false;
        }
    })
}


// 编辑
function routeModifySubmit() {
    if (pathPointers.value.length < 1){
        ElMessage.warning('没有任何途经点')
        return
    }
    formLine.value.policy = currentPolicy.value
    let requestData = {}
    Object.assign(requestData, formLine.value)
    requestData.paths = Base64.encode(JSON.stringify(pathPointers.value))
    routeApi
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
function routeNewSubmit() {
    if (pathPointers.value.length < 1){
        ElMessage.warning('没有任何途经点')
        return
    }
    formLine.value.policy = currentPolicy.value
    let requestData = {}
    Object.assign(requestData, formLine.value)
    requestData.paths = Base64.encode(JSON.stringify(pathPointers.value))
    routeApi
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
// 获取路线信息
function getLineInfo() {
    if (route.query.lineId) {
        routeApi
            .detail({
                id: route.query.lineId
            })
            .then(res => {
                formLine.value = res.data
                currentPolicy.value = res.data.policy
                formLine.value.seasonsArray = formLine.value.seasons.split('、')
                activeLineObj.value = res.data
                pathPointers.value = JSON.parse(Base64.decode(activeLineObj.value.paths))
                loadLine(window.map, pathPointers.value)
                loadLineLabels(window.map, pathPointers.value)
            })
    }
}

/**
 * 设置地图中心点：用户坐标
 */
function setMapCenterToUserLocation(status, res) {
    if (status === 'complete') {
        let center = [res.position.lng, res.position.lat]
        window.map.setCenter(center)
        addMarker(window.map, {
            position: center,
            name: '我',
            note: ''
        })
    } else {
        console.log(res)
    }
}

// 结束拾取坐标
function pickLocationStop() {
    map.off('click', this.showLocation)
}
// 打印 路线数据
function printRoute() {
    console.log(JSON.stringify([...pathPointers.value].reverse()))
}

// 展示规划的路线
function showLine() {
    window.map.clearMap() // 删除地图上的所有标记
    if (currentDragRouting.value) {
        currentDragRouting.value.destroy() // 删除之前的路线
    }
    loadLine(window.map, pathPointers.value)
    loadLineLabels(window.map, pathPointers.value)
}
// 载入线路信息
function loadLine(map, linePointers: Array<EntityRoutePoint>) {
    // 切换线路之前如果存在路线，销毁已存在的路线
    if (currentDragRouting.value) {
        currentDragRouting.value.destroy()
        currentDragRouting.value = null
    }

    map.plugin('AMap.DragRoute', () => {
        // path 是驾车导航的起、途径和终点，官方建议最多放置 16个 途经点，以保证良好体验
        let path = linePointers.map(point => point.position)
        currentDragRouting.value = new AMap.DragRoute(
            map,
            path,
            currentPolicy.value,
            {
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
        currentDragRouting.value.on('addway', res => {
            console.log(res,res.lnglat)
            if (res.lnglat){
                positionPicked.value = {
                    lng: res.lnglat.lng,
                    lat: res.lnglat.lat
                }
            }
        })

        // 路线规划完成时
        currentDragRouting.value.on('complete', res => {
            // console.log(currentDragRouting.value.getWays().toString())  // 除去起点终点的路径点

            // 路线规划完成后，返回的路线数据：设置距离、行驶时间
            let lineData = res.data.routes[0]
            let distance = (lineData.distance / 1000).toFixed(1) // m -> km
            let time = (lineData.time / 60).toFixed() // second -> min
            activeLineObj.value = {
                name: '临时路线'
            }
            formLine.value.distance = distance
            formLine.value.time = time
        })

        // 查询导航路径并开启拖拽导航
        currentDragRouting.value.search()
    })
}

// 添加路线 label 线路信息
function loadLineLabels(map, pathPointers: Array<EntityRoutePoint>) {
    pathPointers.forEach((item, index) => {
        addMarker(map, item, index)
    })
}

function addMarker(map, item: EntityRoutePoint, index: number) {
    let marker= new AMap.Marker({
        position: item.position,
        title: item.note,
        draggable: true,
        content: generateMarkerContent(item.name, item.note, item.img, item.type, index),
        extData: {
            arrayIndex: index, // 元素在数组中的位置 index
        }
    })
    marker.on('dragstart', handleMarkerDragging)
    marker.on('dragging', handleMarkerDragStart)
    marker.on('dragend', handleMarkerDragEnd)
    // pathPointers.value.push(marker)
    map.add(marker)
}

function handleMarkerDragging(event){
    // console.log(event)
    const markerIndex =  event.target._opts.extData.arrayIndex  // 在新建 marker 的时候提前定义的数据
    pathPointers.value[markerIndex].position = [event.lnglat.lng, event.lnglat.lat]
}
function handleMarkerDragStart(event){
    // console.log(event)
    const markerIndex =  event.target._opts.extData.arrayIndex  // 在新建 marker 的时候提前定义的数据
    pathPointers.value[markerIndex].position = [event.lnglat.lng, event.lnglat.lat]
}
function handleMarkerDragEnd(event){
    // console.log(event)
    const markerIndex =  event.target._opts.extData.arrayIndex  // 在新建 marker 的时候提前定义的数据
    pathPointers.value[markerIndex].position = [event.lnglat.lng, event.lnglat.lat]
}

onUnmounted(()=>{
    currentDragRouting.value && currentDragRouting.value.destroy() // 销毁行程规划
    window.map.clearInfoWindow() // 清除地图上的信息窗体
})

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
    width: 500px;
    z-index: 100;
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
