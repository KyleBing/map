<template>
    <div class="route-line-list">
        <div
            @click="$emit('choseLine', line.id)"
            :class="[
                'route-line-list-item',
                {active: Number($route.query.lineId) === line.id}
            ]"
            v-for="line in routeLineList" :key="line.id"
        >
            <div class="id">{{line.id}}</div>
            <div class="name">{{line.name}}</div>
        </div>
    </div>
</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "RouteLineList",
    props:{
        routeLineList: []
    },
    data(){
        return {
            showContent: true
        }
    },
    computed:{
        ...mapGetters(['isInPortraitMode']),
    },
    methods: {
        toggleContent(){
            this.showContent = !this.showContent
        }
    },
}
</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";

.route-line-list{
    @extend .card;
    position: absolute;
    z-index: 1000;
    top: 20px;
    left: 20px;
    padding: 10px 0;
    @include border-radius($radius);
    overflow: hidden;
    background-color: white;
    width: 250px;
    .route-line-list-item{
        &:last-child{
            border-bottom: none;
        }
        border-bottom: 1px solid $border-light;
        padding: 3px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        font-size: $fz-normal;
        &:hover{
            border-bottom-color: white;
            background-color: $bg-active;
        }
        @extend .btn-like;
        .id{
            padding: 0 10px;
            text-align: right;
            color: $text-description;
            width: 50px;
        }
        .name{
            padding-left: 10px;
            width: 150px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow-ellipsis: ellipsis;
        }
        &.active{
            background-color: $color-main;
            color: white;
            .id{
                color: white;
            }
        }
    }
}


</style>
