<template>
    <div class="map-container">
        <PointerDetailPanel :pointer="pointerInfo"/>
        <div id="container" :style="`height: ${store.windowInsets.height}px`"></div>
        <div class="card input-panel">
            <ElForm inline size="small">
                <ElFormItem class="mb-0 mr-1">
                    <ElInput placeholder="区域编码" v-model="pointerInfo.adcode"/>
                </ElFormItem>
                <ElFormItem class="m-0">
                    <ElButton type="primary" @click="showDistrictOfAdcode">确定</ElButton>
                </ElFormItem>
            </ElForm>
        </div>
    </div>
</template>

<script lang="ts" setup>
import AMapLoader from '@amap/amap-jsapi-loader'
import axios from "axios";
import PointerDetailPanel from "@/page/pointer/components/PointerDetailPanel.vue";
import {adcodeMap} from './adcodeMap'
import {useProjectStore} from "@/pinia";

import {onMounted, onUnmounted, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";
import {ElMessage} from "element-plus";
import {key_service, key_web_js} from "@/mapConfig.ts";

const store = useProjectStore()
const router = useRouter()
const route = useRoute()

// 显示地图行政区的深度
const DEPTH = {
    province: 0, // 省
    city: 1, // 市
    country: 2 // 县、区
}

const COLORS = [
    'rgba(237,236,208,0.8)',
    'rgba(113,182,153,0.8)',
    'rgba(212,144,167,0.8)',
    'rgba(212,227,206,0.8)',
    'rgba(190,194,161,0.8)',
    'rgba(222,148,111,0.8)',
    'rgba(201,166,085,0.8)',
    'rgba(103,104,099,0.8)',
    'rgba(205,087,085,0.8)',
    'rgba(208,198,170,0.8)',
    'rgba(242,242,218,0.8)',
    'rgba(214,201,193,0.8)',
]

let AMap = null
let map = null
let layerCity = null // 区域图层


const isLoading = ref(false)
const pointerInfo = ref({
    name: '济南市',
    // area: '',
    note: '',
    adcode: ''
})
let tempColorArray = []


onMounted(() => {
    if (route.query.adcode){
        pointerInfo.value.adcode = route.query.adcode
        let adcodeInfo = adcodeMap.get(pointerInfo.value.adcode)
        pointerInfo.value.name = adcodeInfo[0]
    } else {
        pointerInfo.value.name = route.query.city || '济南'
    }

    AMapLoader
        .load({
            key: key_web_js, // 开发应用的 ID
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
        .then(mapItem => {
            AMap = mapItem
            map = new AMap.Map('container', {
                center: [117.129533, 36.685668],
                zoom: 9, // 缩放级别
                mapStyle: 'amap://styles/whitesmoke'
            })


            // 点击显示当地信息
            map.on('click', event => {
                showDistrictInfoOf(event.lnglat)
            })

            map.setFeatures(['bg', 'point', 'road', 'building'])
            // bg 区域面
            // point 兴趣点
            // road 道路和道路标记
            // building 建筑物

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

            // 初始化默认展示济南区县
            getAdcodeOfCity(pointerInfo.value.name)
        })
        .catch(e => {
            console.log(e)
        })
})

watch(route, newValue => {
    if (newValue.query.adcode){
        pointerInfo.value.adcode = newValue.query.adcode
        let adcodeInfo = adcodeMap.get(pointerInfo.value.adcode)
        if (adcodeInfo){
            pointerInfo.value.name = adcodeInfo[0]
            getAdcodeOfCity(pointerInfo.value.name)
        } else {
            ElMessage.warning('adcode 未匹配到任何区域')
        }
    } else {
        getAdcodeOfCity(newValue.query.city)
        pointerInfo.value.name = `${newValue.query.province}${newValue.query.city}`
    }
})

// 通过输入的 adcode 显示区域
function showDistrictOfAdcode(){
    router.push({
        name: 'DistrictInfo',
        query: {
            adcode: pointerInfo.value.adcode
        }
    })
}

// 获取坐标值的地理信息
function showDistrictInfoOf(lnglat){
    axios({
        url: 'https://restapi.amap.com/v3/geocode/regeo?parameters',
        params: {
            key: key_service,
            location: `${lnglat.lng},${lnglat.lat}`
        }
    })
        .then(res => {
            /*                    res = {
                                    "status": "1",
                                    "regeocode": {
                                        "addressComponent": {
                                            "city": "德州市",
                                            "province": "山东省",
                                            "adcode": "371425",
                                            "district": "齐河县",
                                            "towncode": "371425201000",
                                            "streetNumber": {
                                                "number": [],
                                                "direction": [],
                                                "distance": [],
                                                "street": []
                                            },
                                            "country": "中国",
                                            "township": "安头乡",
                                            "businessAreas": [
                                                []
                                            ],
                                            "building": {
                                                "name": [],
                                                "type": []
                                            },
                                            "neighborhood": {
                                                "name": [],
                                                "type": []
                                            },
                                            "citycode": "0534"
                                        },
                                        "formatted_address": "山东省德州市齐河县安头乡安头八支路"
                                    },
                                    "info": "OK",
                                    "infocode": "10000"
                                }*/
            if (res.data && res.data.status === '1'){
                let locationInfo =  res.data.regeocode.addressComponent
                // console.log('lnglat -> location: ', locationInfo)
                pointerInfo.value.name = `${locationInfo.province}${locationInfo.city}`

                // 如果 city 为空数组，说明是直辖市
                let queryWord = typeof locationInfo.city === 'object' ? locationInfo.province : locationInfo.city

                router.push({
                    name: 'DistrictInfo',
                    query: {
                        city: queryWord,
                        province: locationInfo.province,
                    }
                })

                // getAdcodeOfCity(queryWord) // 通过名字获取地域信息

            } else {
                console.log(res)
            }
        })
        .catch(err => {
            console.log(err)
        })
}
function getAdcodeOfCity(address: string){
    axios({
        url: 'https://restapi.amap.com/v3/geocode/geo?parameters',
        params: {
            key: key_service,
            address
        }
    })
        .then(res => {
            if (res.data.status === '1'){
                let locationData = res.data.geocodes[0]
                // console.log('address -> locationInfo: ',locationData)
                initDistrict(locationData.adcode, DEPTH.country)
                showDistrictBounds(address)
            }
        })
        .catch(err => console.log(err))

}

// 显示区域边界
function showDistrictBounds(locationName){
    tempColorArray = [].concat(COLORS).concat(COLORS) // 放两层颜色

    // 绘制当前区域边界
    let districtSearch = new AMap.DistrictSearch({
        // 关键字对应的行政区级别
        level: 'district',
        // country：国家；province：省/直辖市；city：市；district：区/县；biz_area：商圈
        extensions: 'all',
        //  显示下级行政区级数，1表示返回下一级行政区
        subdistrict: 2
    })

    districtSearch.search(locationName, (status, result) => {
        console.log('地域搜索： ',result)
        let locationInfo = result.districtList[0]

        // 一、如果是 区、县级，显示边界
        if (locationInfo.level === 'district'){
            let bounds = []
            if (result.districtList > 1){ // 直辖市时
                result.districtList.forEach(item => {
                    console.log(item.boundaries)
                    bounds.push(...item.boundaries)
                })
            } else {
                bounds = result.districtList[0].boundaries
            }
            // 显示边界信息
            let polygons = []
            if (bounds) {
                for (let i = 0, l = bounds.length; i < l; i++) {
                    // 生成行政区划polygon
                    let polygon = new AMap.Polygon({
                        map: map,
                        strokeWeight: 2,
                        path: bounds[i],
                        fillOpacity: 0.6,
                        fillColor: tempColorArray.shift(),
                        strokeColor: '#CC66CC'
                    })
                    map.add(polygon)
                    polygons.push(polygon)
                }
                // 地图自适应
                map.setFitView()  // 以合适的比例展示内容区
            }

            locationInfo.districtList.forEach(item => {
                addMarker(map, item)
            })

        } else {
            // 二、如果是市
            let finalMarkDownContent = `**区域编码**：${locationInfo.adcode}\n
**区号**：${locationInfo.citycode}\n
**区/县区域编码**：\n
`
            locationInfo.districtList.sort((a,b) => a.adcode - b.adcode)  // 按 adcode 排序
            locationInfo.districtList.forEach(item => {
                finalMarkDownContent = finalMarkDownContent.concat(`- ${item.name}-${item.adcode}\n`)
            })

            finalMarkDownContent = finalMarkDownContent + `\n**点击任意区域，显示区县信息**\n`
            pointerInfo.value.note = finalMarkDownContent


            if (/^(上海|北京|天津|重庆)市$/.test(locationInfo.name)){ // 直辖市
                console.log(locationInfo.name)
                locationInfo.districtList[0].districtList.forEach(item => {
                    addMarker(map, item)
                })
            } else { // 普通城市
                locationInfo.districtList.forEach(item => {
                    addMarker(map, item)
                })
            }

            map.setCenter(locationInfo.center) // 视角移到中间位置
        }

    })
}

function initDistrict(adcode, depth) {
    map.clearMap()
    layerCity && layerCity.setMap(null)
    tempColorArray = [].concat(COLORS).concat(COLORS) // 放两层颜色
    layerCity = new AMap.DistrictLayer.Province({
        zIndex: 8,
        adcode: [adcode],
        depth: depth,
        styles: {
            'fill': properties => {
                // properties为可用于做样式映射的字段，包含  // NAME_CHN:中文名称;  adcode_pro;  adcode_cit;  adcode
                // let {NAME_CHN, adcode, x, y} = properties
                // console.log(`{name: ${NAME_CHN}, adcode: ${adcode}, position: [${x},${y}]}`)
                if (String(properties.adcode_cit) === adcode || String(properties.adcode_pro) === adcode){
                    return tempColorArray.shift()
                }
            },
            'stroke-width': 1,
            'coastline-stroke': 'blue', // 海岸线颜色
            'nation-stroke': 'blue',    // 国境线颜色
            'province-stroke': 'white', // 省界颜色
            'city-stroke': 'black',     // 地级市边界
            'county-stroke': 'white'    // 区/县界颜色

            // 参考：
            // https://lbs.amap.com/api/javascript-api-v2/documentation#districtlayer
        }
    })
    layerCity.setMap(map)
}

// 设置地图中心点：用户坐标
function setMapCenterToUserLocation(status, res) {
    if (status === 'complete') {
        let center = [res.position.lng, res.position.lat]
        map.setCenter(center)
        addMarker(map, {
            position: center,
            name: '我的位置',
            note: ''
        })
    } else {
        console.log(res)
    }
}

function addMarker(map, item) {
    let marker = new AMap.Marker({
        position: [item.center.lng, item.center.lat],
        offset: new AMap.Pixel(-10, -20),
        content: `
                <div class="marker">
                  <div class="marker-index">
                      <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
<!--                       <div class="note">区号：${item.citycode}</div>-->
                       <div class="note">区域编码：${item.adcode}</div>
                  </div>
               </div>`,
    })
    map.add(marker)
}

onUnmounted(() => {
    map.clearInfoWindow() // 清除地图上的信息窗体
    map.destroy() // 销毁地图，释放内存
    map = null
})



</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";

.map-container {
    position: relative;
}

.input-panel{
    position: absolute;
    left: 20px;
    top: 20px;
    .ElFormItem{
        margin: 0 5px 0 0;
    }
}


</style>
