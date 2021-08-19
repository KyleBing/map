<template>
    <div class="map-container">
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>
    </div>
</template>

<script>
import AMapLoader from '@amap/amap-jsapi-loader'
import { mapState } from 'vuex'
const MY_POSITION = [117.129533, 36.685668]

let AMap = null

export default {
    name: "CarManage",
    data() {
        return {
            isLoading: false,
            contentHeight: 400,
            map: null,
            markers: [
                {position: [117.129533, 36.685668], name: "商场：高新万达", phone: ''},
                {position: [117.821953, 36.138451], name: "钢城区车辆管理所", phone: '06345667973'},
                {position: [117.166785, 37.245034], name: "商河钱隆机动车登记服务站", phone: '84801008'},
                {position: [117.699792, 36.179012], name: "莱芜区车辆管理所", phone: '06346096277'},
                {position: [116.405267, 36.270492], name: "平阴车辆管理所", phone: '66712345'},
                {position: [116.920532, 36.656044], name: "槐荫车管分所", phone: '66712345'},
                {position: [117.153975, 37.284018], name: "商河车辆管理所", phone: '66712345'},
                {position: [116.821744, 36.619044], name: "济西新能源机动车登记服务站", phone: '83156888'},
                {position: [116.935087, 36.711933], name: "天桥车管分所", phone: '66712345'},
                {position: [117.206635, 36.720479], name: "历城车管分所", phone: '66712345'},
                {position: [117.163276, 36.937575], name: "济阳车辆管理所", phone: '66712345'},
                {position: [116.840032, 36.641677], name: "济南市车管所", phone: '66712345'},
                {position: [117.225284, 36.661391], name: "历下车管分所", phone: '66712345'},
                {position: [116.981713, 36.624219], name: "市中车管分所", phone: '66712345'},
                {position: [116.804331, 36.587233], name: "长清区车辆管理所", phone: '66712345'},
                {position: [117.568698, 36.684551], name: "章丘车辆管理所", phone: '66712345'}]
        }
    },
    created() {
        this.contentHeight = window.innerHeight
        AMapLoader.load({
            key: "581591b581149549d9035d039e83e368", // 开发应用的 ID
            version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [
                'AMap.ToolBar', // 缩放按钮
                'AMap.Scale', // 比例尺
                'AMap.DistrictLayer', // 定位
            ],
        }).then(map => {
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


        }).catch(e => {
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
               <div class="marker">
                  <div class="title">${item.name}</div>
                  <div class="note"><a href="tel:${item.phone}">${item.phone}</a></div>
               </div>`,
            })
            map.add(marker)
        }
    },
    beforeDestroy() {
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
