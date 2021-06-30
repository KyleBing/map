<template>
    <div class="map-container">
        <div id="container" :style="`height: ${contentHeight}px`"></div>

        <a class="home" href="/">返回主页</a>
        <!--        <div class="op-btns">
                    <el-radio-group size="mini" v-model="currentLine">
                        <el-radio-button v-for="(line, index) in lines" :key="line.name" :label="index">{{line.name}}</el-radio-button>
            </el-radio-group>
        </div>-->
    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader';
import mapData from './lines'
import ICON from "@/page/list/icons";


const MY_POSITION = [117.129533, 36.685668]
let AMap = null

export default {
    name: "list",
    data() {
        return {
            isLoading: false,
            contentHeight: 400,
            map: null,
            lines: mapData.LINES,
            colors: mapData.COLORS,
            currentLine: 0,
            currentRouting: null,  // 当前导航路线
        }
    },
    created() {

        this.contentHeight = window.innerHeight

        AMapLoader.load({
            key: "581591b581149549d9035d039e83e368", // 开发应用的 ID
            version: "2.0",   // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
            plugins: [
                'AMap.ToolBar',
                'AMap.Scale', // 比例尺
                'AMap.Geolocation'
            ],
            AMapUI: {             // 是否加载 AMapUI，缺省不加载
                version: '1.1',   // AMapUI 缺省 1.1
                plugins: [],       // 需要加载的 AMapUI ui插件
            },
        }).then(map => {
            AMap = map
            this.map = new AMap.Map('container', {
                center: MY_POSITION,
                zoom: 11
            });

            this.map.addControl(new AMap.ToolBar());
            this.map.addControl(new AMap.Scale());


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

            geolocation.getCurrentPosition(function (status, result) {
                if (status === 'complete') {
                    console.log(result)
                    // onComplete(result)
                } else {
                    console.log(result)
                    // onError(result)
                }
            });
            let line = this.lines[parseInt(this.$route.params.lineId) - 1]
            this.loadLine(this.map, line)
        }).catch(e => {
            console.log(e);
        })

    },
    mounted() {
        window.onresize = this.resizeMap
    },
    methods: {
        resizeMap() {
            let mapContainer = document.getElementById('container');
            mapContainer.style.height = window.innerHeight + "px";
            mapContainer.style.width = window.innerWidth + "px"
        },

        /**
         *
         * @param map
         * @param line 线路信息
         */
        loadLine(map, line) {
            map.plugin('AMap.DragRoute', () => {
                // path 是驾车导航的起、途径和终点，最多支持16个途经点
                let path = []
                line.paths.forEach(point => {
                    path.push(point.position)
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
                // 查询导航路径并开启拖拽导航
                route.search()
                this.currentRouting = route
            })
        },

        /**
         *
         * @param map
         * @param line 线路信息
         */
        loadLineLables(map, line) {
            line.paths.forEach(item => {
                this.addMarker(item, map)
            })
        },
        addCircle(map, position, borderColor, radius) {
            let circle = new AMap.Circle({
                center: position,         // 圆心位置
                radius: radius * 1000,    // 圆半径
                fillColor: 'white',       // 圆形填充颜色
                fillOpacity: 0,           // 填充透明度
                strokeColor: borderColor, // 描边颜色
                strokeOpacity: 1,         // 描边透明度
                strokeWeight: 2,          // 描边宽度
            });
            map.add(circle);
        },
        addMarker(item, map) {
            let marker = new AMap.Marker({
                position: item.position,
                content: `
               <div class="marker">
                  <div class="title">${item.name}</div>
                  <div class="note">${item.note}</div>
               </div>`,
            });
            map.add(marker);
        }

    },
    watch: {
        '$route'(to, from){
            if (this.currentRouting) {
                this.currentRouting.destroy() // 清除当前路线
                this.map.clearMap() // 删除所有 Marker
            }
            let line = this.lines[parseInt(to.params.lineId) - 1]
            this.loadLine(this.map, line)
            this.loadLineLables(this.map, line)
        },
    }
}
</script>

<style lang="scss" scoped>
.map-container {
    position: relative;
}

.op-btns {
    position: absolute;
    top: 30px;
    left: 30px;

}
</style>