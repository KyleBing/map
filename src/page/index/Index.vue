<template>
    <div class="map-container">
        <div class="index" :style="`height: ${windowInsets.height}px; width: ${windowInsets.width}`">
            <div class="intro">
                <h1>路书</h1>
                <h3>一个可以分享行车路线、地点信息的网站</h3>
                <p></p>
            </div>
        </div>
    </div>
</template>

<script>

import {mapState} from "vuex"
export default {
    name: "Index",
    data() {
        return {

        }
    },
    mounted() {

    },
    computed: {
        ...mapState(['windowInsets'])
    },
    methods: {

    },
    watch: {

    },
    beforeDestroy() {

    }
}
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
}

</style>
