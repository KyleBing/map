<template>
    <div :class="['detail', 'card', {'closed': !showContent}]">
        <div class="title">
            <h1>{{line.name}} <i @click="toggleContent" v-if="showContent" class="el-icon-arrow-down"></i>
                <i @click="toggleContent" v-else class="el-icon-arrow-up"></i></h1>
        </div>
        <div class="content" v-if="showContent">
            <div class="info-list">
                <div class="info"><p>路线区域：</p><p>{{line.area}}</p></div>
                <div class="info"><p>路面类型：</p><p>{{line.roadType}}</p></div>
                <div class="info"><p>推荐季节：</p><p>{{line.months}}</p></div>
            </div>
            <p class="note">{{line.note}}</p>
        </div>

    </div>
</template>

<script>
export default {
    name: "Detail",
    props:{
        line:{
            type: Object
        },
    },
    data(){
        return {
            showContent: true
        }
    },
    methods: {
        toggleContent(){
            this.showContent = !this.showContent
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../../scss/plugin";

i{
    @extend .unselectable;
}
.detail{
    padding: 0;
    width: 300px;
    position: absolute;
    top: 20px;
    left: 20px;
    .title{
        text-align: center;
        padding: 7px 0 8px;
        font-size: 1rem;
        color: $text-main;
        border-bottom: 1px solid $color-border;
    }
    &.closed{
        .title{
            padding: 7px 0 7px;
            border: none;
        }
    }
}



.content{
    color: $text-subtitle;
    font-size: 0.8rem;
}
.info-list{
    padding: 5px 10px;
}
.info{
    padding: 3px 0;
    display: flex;
    justify-content: flex-start;
    p:first-child{
        font-weight: bold;
        color: $text-main;
    }
}
.note{
    padding: 5px 10px 10px;
    border-top: 1px solid $color-border;
    line-height: 1.5;
    color: $text-main;
}

</style>