<template>
    <div class="driving-info">
        <div v-if="drivingInfo.distance" class="distance">{{drivingInfo.distance}} km</div>
        <div v-if="drivingInfo.time" class="ml-1 mr-1">/</div>
        <div v-if="drivingInfo.time" class="time">{{drivingInfo.time}} min</div>
    </div>
</template>

<script>
export default {
    name: "DrivingInfo",
    props: {
        drivingInfo: {}
    }
}
</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";

.driving-info{
    padding: 0 10px 10px;
    display: flex;
    justify-content: flex-start;
    color: $text-subtitle;
    font-family: 'Impact', sans-serif;
    font-size: $fz-info;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    //background-image: linear-gradient(to top right, #ff31d1, #00ceff);
    background-image: linear-gradient(70deg,#2ca2b4,#5598de 24%,#7f87ff 45%,#f65aad 76%,#ec3d43);
    .distance{
    }
    .time{

    }
}

</style>
