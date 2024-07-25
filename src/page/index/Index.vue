<template>
    <div class="map-container">
        <div class="index" :style="`height: ${store.windowInsets.height}px; width: ${store.windowInsets.width}`">
            <div class="intro">
                <h1>路书</h1>
                <h3>一个可以分享行车路线、地点信息的网站</h3>

                <p class="mt-7">在这里，你可以查看别人分享的一些路线 <RouterLink to="/route/route-line">看这</RouterLink>。</p>

                <p class="mt-3">有时候，可能需要在地图上写写画画，想要确定去一个地方哪条路线最优，可以 <RouterLink to="/route/route-editor">点这里</RouterLink>。 </p>
                <p>也有时候，可能需要查看一个地点周边方圆多少公里的覆盖范围是怎样的，可以 <RouterLink to="/tool/circle">点这里</RouterLink>。</p>
                <p>再有时候，可能需要查看一个市的区、县信息，可以 <RouterLink to="/tool/district-info">看这里</RouterLink>。</p>
                <p>还有可能，需要查看一个 gpx 路径是怎样的，可以 <RouterLink to="/gpx/gpx-viewer">看这里</RouterLink>。</p>
                <p>如果要查看一个 gpx 的 3D 路径，可以 <RouterLink to="/gpx/gpx-viewer-3d">看这里</RouterLink>。</p>

                <p class="mt-5">另外，该项目是开源的，可以从这里查看 <a target="_blank" href="https://github.com/KyleBing/map">https://github.com/KyleBing/map</a>。</p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {useProjectStore} from "@/pinia.ts";

const store = useProjectStore()
</script>

<style lang="scss" scoped>
@import "../../scss/plugin";
.map-container {
    position: relative;
}
.index{
    padding: 60px 50px;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    h1{
        margin-bottom: 1rem;
        font-size: 3rem;
    }
    h3{
        font-size: 1.5rem;
        color: $text-subtitle;
    }
    a{
        text-decoration: underline;
        color: $color-main;
    }
    p{
        color: $text-description;
    }
}

</style>
