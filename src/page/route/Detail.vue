<template>
    <div :class="['detail', {'closed': !showContent}]">
        <div class="title">
            <h1>{{line.name}} <i @click="toggleContent" v-if="showContent" class="el-icon-arrow-down"></i>
                <i @click="toggleContent" v-else class="el-icon-arrow-up"></i></h1>
        </div>
        <div class="content" v-if="showContent">
            <div class="info"><p>路面类型：</p><p>{{line.roadType}}</p></div>
            <div class="info"><p>推荐季节：</p><p>{{line.months}}</p></div>
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
@import "../../scss/plugin";

i{
    @extend .unselectable;
}
.detail{
    padding: 6px 8px;
    background-color: white;
    @include border-radius(10px);
    @include box-shadow(1px 1px 3px rgba(0,0,0,0.2));
    width: 300px;
    position: absolute;
    top: 20px;
    left: 20px;
    &.closed{
        .title{
            padding: 6px 0 6px;
            border: none;
        }
    }
}

.title{
    text-align: center;
    padding: 5px 0 8px;
    font-size: 1.1rem;
    color: $text-main;
    border-bottom: 1px solid $color-border;
}

.content{
    padding: 6px;
    color: $text-subtitle;
    font-size: 0.8rem;
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
    padding: 8px 0 5px;
    border-top: 1px solid $color-border;

    line-height: 1.5;
    color: $text-main;
    font-size: 0.9rem;
    margin-top: 5px;
}

</style>