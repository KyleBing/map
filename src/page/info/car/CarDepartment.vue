<template>
    <div class="map-container">
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>
    </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
import { mapState } from 'vuex'
import mapConfig from "../../../mapConfig";
const MY_POSITION = [117.129533, 36.685668]

let AMap = null

export default {
    name: "CarDepartment",
    data() {
        return {
            isLoading: false,
            map: null,
            markers: [
                {position: [117.129533, 36.685668]  , phone: '' ,            type: "market",     name: "高新万达"} ,
                {position: [117.100261, 36.658804]  , phone: '' ,            type: "market",     name: "万象城"} ,
                {position: [117.063358, 36.683155]  , phone: '' ,            type: "market",     name: "印象城"} ,
                {position: [117.053734, 36.717434]  , phone: '' ,            type: "market",     name: "华山-环宇城"} ,
                {position: [117.109686, 36.667901]  , phone: '' ,            type: "market",     name: "龙湖天街"} ,
                {position: [117.023753, 36.663806] ,  phone: '' ,            type: "market",     name: "恒隆广场"} ,
                {position: [117.197677, 36.671258] ,  phone: '' ,            type: "market",     name: "融创茂"} ,
                {position: [117.003035, 36.662559] ,  phone: '' ,            type: "market",     name: "经四万达"} ,
                {position: [117.002642, 36.593224] ,  phone: '' ,            type: "market",     name: "贵和"} ,
                {position: [116.981724, 36.612771] ,  phone: '' ,            type: "market",     name: "中海-环宇城"} ,
                {position: [116.978032, 36.649693] ,  phone: '' ,            type: "market",     name: "和谐广场"} ,
                {position: [117.821953 , 36.138451] , phone: '06345667973' , type: "department", name: "钢城区车辆管理所" } ,
                {position: [117.166785 , 37.245034] , phone: '84801008' ,    type: "department", name: "商河钱隆机动车登记服务站" } ,
                {position: [117.699792 , 36.179012] , phone: '06346096277' , type: "department", name: "莱芜区车辆管理所" } ,
                {position: [116.405267 , 36.270492] , phone: '66712345' ,    type: "department", name: "平阴车辆管理所" } ,
                {position: [116.920532 , 36.656044] , phone: '66712345' ,    type: "department", name: "槐荫车管分所" } ,
                {position: [117.153975 , 37.284018] , phone: '66712345' ,    type: "department", name: "商河车辆管理所" } ,
                {position: [116.821744 , 36.619044] , phone: '83156888' ,    type: "department", name: "济西新能源机动车登记服务站" } ,
                {position: [116.935087 , 36.711933] , phone: '66712345' ,    type: "department", name: "天桥车管分所" } ,
                {position: [117.206635 , 36.720479] , phone: '66712345' ,    type: "department", name: "历城车管分所" } ,
                {position: [117.163276 , 36.937575] , phone: '66712345' ,    type: "department", name: "济阳车辆管理所" } ,
                {position: [116.840032 , 36.641677] , phone: '66712345' ,    type: "department", name: "济南市车管所" } ,
                {position: [117.225284 , 36.661391] , phone: '66712345' ,    type: "department", name: "历下车管分所" } ,
                {position: [116.981713 , 36.624219] , phone: '66712345' ,    type: "department", name: "市中车管分所" } ,
                {position: [116.804331 , 36.587233] , phone: '66712345' ,    type: "department", name: "长清区车辆管理所" } ,
                {position: [117.568698 , 36.684551] , phone: '66712345' ,    type: "department", name: "章丘车辆管理所" }
            ]
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
                    'AMap.DistrictLayer', // 定位
                ],
            })
            .then(map => {
                AMap = map
                this.map = new AMap.Map('container', {
                    center: MY_POSITION,
                    zoom: 11, // 缩放级别
                })

                this.map.addControl(new AMap.ToolBar())
                this.map.addControl(new AMap.Scale())


                this.markers.forEach(item => {
                    this.addMarker(this.map, item)
                })

            })
            .catch(e => {
                console.log(e)
            })

    },
    computed: {
        ...mapState(['windowInsets'])
    },
    methods: {
        addMarker(map, item) {
            let marker = new AMap.Marker({
                position: item.position,
                offset: new AMap.Pixel(0,-20),
                content: `
                <div class="marker  ${item.type === 'market'? 'orange': ''}">
                  <div class="marker-index">
                      <div class="title">${item.name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note"><a href="tel:${item.phone}">${item.phone}</a></div>
                  </div>
               </div>
`,
            })
            map.add(marker)
        }
    },
    beforeDestroy() {
        this.map.clearInfoWindow() // 清除地图上的信息窗体
        this.map.destroy() // 销毁地图，释放内存
        this.map = null
    }
}

</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";
.map-container {
    position: relative;
}
</style>
