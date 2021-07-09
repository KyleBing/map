<template>
    <div class="map-container">
        <div id="container" :style="`height: ${windowInsets.height}px`"></div>
    </div>
</template>

<script>

import AMapLoader from '@amap/amap-jsapi-loader';
import ICON from "@/page/route/icons";
import {mapState} from "vuex";


const MY_POSITION = [117.129533, 36.685668]
let AMap = null

export default {
    name: "RouteLine",
    data() {
        return {
            isLoading: false,
            contentHeight: 400,
            map: null,
            loca: null,
            currentLineId: 0,
            activeLineObj: null, // 当前 Line 对象
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
                'AMap.Geolocation',
            ],
            Loca:{
                version: '2.0.0',
            },
            AMapUI: {             // 是否加载 AMapUI，缺省不加载
                version: '1.1',   // AMapUI 缺省 1.1
                plugins: [],       // 需要加载的 AMapUI ui插件
            },

        }).then(map => {
            AMap = map
            this.map = new AMap.Map('container', {
                viewMode: '3D',
                zoom: 12,
                center: MY_POSITION,
                mapStyle: 'amap://styles/45311ae996a8bea0da10ad5151f72979',
                showBuildingBlock: true,
                showLabel: false,
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
            geolocation.getCurrentPosition(this.setMapCenterToUserLocation);


            this.loca = new Loca.Container({
                map: this.map,
            });

            this.loca.ambLight = {
                intensity: 2.2,
                color: '#babedc',
            };
            this.loca.dirLight = {
                intensity: 0.46,
                color: '#d4d4d4',
                target: [0, 0, 0],
                position: [0, -1, 1],
            };
            this.loca.pointLight = {
                color: 'rgb(15,19,40)',
                position: [MY_POSITION[0], MY_POSITION[1], 2600],
                intensity: 25,
                // 距离表示从光源到光照强度为 0 的位置，0 就是光不会消失。
                distance: 3900,
            };

            let geo = new Loca.GeoJSONSource({
                url: 'https://a.amap.com/Loca/static/loca-v2/demos/mock_data/sh_building_center.json',
            });

            let pl = window.pl = new Loca.PolygonLayer({
                zIndex: 120,
                shininess: 10,
                hasSide: true,
                cullface: 'back',
                depth: true,
            });

            pl.setSource(geo);
            pl.setStyle({
                topColor: '#111',
                height: function (index, feature) {
                    return feature.properties.h;
                },
                textureSize: [1000, 820],
                texture: 'https://a.amap.com/Loca/static/loca-v2/demos/images/windows.jpg',
            });
            pl.setLoca(this.loca);

            let dat = new Loca.Dat();
            dat.addLight(this.loca.ambLight, this.loca, '环境光');
            dat.addLight(this.loca.dirLight, this.loca, '平行光');
            dat.addLight(this.loca.pointLight, this.loca, '点光');
            dat.addLayer(pl, '楼块');


            this.map.on('complete', ()=> {
                this.loca.animate.start();
                // document.querySelector('.start-btn').addEventListener('click', function () {
                setTimeout(()=>{
                    // 镜头动画
                    this.map.setZoom(11.8, true);
                    this.map.setPitch(0, true);
                    this.map.setCenter(MY_POSITION, true);
                    this.map.setRotation(1, true);
                    pl.hide(1000);
                }, 2000);
            });

        }).catch(e => {
            console.log(e);
        })
    },

    computed: {
        ...mapState(['windowInsets'])
    },
    methods: {

        // 设置地图中心点：用户坐标
        setMapCenterToUserLocation(status, res){
            if (status === 'complete') {
                let center = [res.position.lng, res.position.lat]
                this.map.setCenter(center)
                this.addMarker(this.map, {
                    position: center,
                    name: '你的位置',
                    note: ''
                })
            } else {
                console.log(res)
            }
        },

        resizeMap() {
            let mapContainer = document.getElementById('container');
            mapContainer.style.height = window.innerHeight + "px";
            mapContainer.style.width = window.innerWidth + "px"
        },

        // 载入路线信息
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


        // 添加路线 Label
        loadLineLabels(map, line) {
            line.paths.forEach(item => {
                this.addMarker(map, item)
            })
        },
        addMarker(map, item) {
            let marker = new AMap.Marker({
                position: item.position,
                content: `
               <div class="marker">
                  <div class="title">${item.name}</div>
                  <div class="note">${item.note.replaceAll('|', '<br>')}</div>
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
            this.activeLineObj = this.lines[parseInt(this.$route.params.lineId) - 1]
            this.loadLine(this.map, this.activeLineObj)
            this.loadLineLabels(this.map, this.activeLineObj)
        },
    },
    beforeDestroy() {
        this.map.destroy() // 销毁地图，释放内存
        this.map = null
    }
}
</script>

<style lang="scss" scoped>
.map-container {
    position: relative;
}

</style>