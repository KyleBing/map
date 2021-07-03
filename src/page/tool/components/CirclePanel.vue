<template>
    <div class="circle-panel card">
        <div class="move-operation">
            <i class="el-icon-caret-top" @click="moveUp"></i>
            <i class="el-icon-caret-bottom" @click="moveDown"></i>
        </div>



        <div class="lnglat-input">
            <el-input size="mini" placeholder="地点" v-model="name"></el-input>
            <el-input size="mini" placeholder="lng" v-model="lng"></el-input>
            <el-input size="mini" placeholder="lat" v-model="lat"></el-input>
            <el-input size="mini" placeholder="半径" v-model="radius" type="number"></el-input>
            <el-button size="mini" type="primary">
                添加
<!--                <i class="el-icon-circle-plus-outline"></i>-->
            </el-button>
        </div>

        <el-button size="mini" type="primary" @click="$emit('pick-start', null)">开始拾取点</el-button>
        <el-button size="mini" type="danger" @click="$emit('pick-stop', null)">结束拾取点</el-button>
        <el-button size="mini" type="success" @click="draw">标记并画圈</el-button>
    </div>

</template>

<script>
export default {
    name: "CirclePanel",
    props: {
        data: {
            type: Array
        },
        lng: {
            type: Number
        },
        lat: {
            type: Number
        },
    },
    model: {prop: 'data', event: 'change'},
    data() {
        return {
            name: '', // 当前点的地名
            radius: 1, // 半径：公里
            // location: [] // 经纬度
        }
    },
    methods: {
        draw(){
            this.$emit('draw', {
                center: [this.lng, this.lat],
                radius: this.radius,
                name: this.name
            })
        },
        moveUp(){},
        moveDown(){},
    }
}
</script>

<style scoped lang="scss">
@import "../../../scss/plugin";
.circle-panel {
    width: 400px;
    position: absolute;
    left: 30px;
    top: 30px;
}
.lnglat-input{
    justify-content: space-between;
    align-items: center;
    display: flex;
    & > * {
        margin-right: 5px;
    }
}

$height-btn: 28px;

.move-operation{
    flex-shrink: 0;
    > *{
        cursor: pointer;
        color: white;
        text-align: center;
        font-size: 0.5rem;
        display: block;
        height: ( $height-btn - 2 )/2;
        width: ( $height-btn - 2 )/2 + 6;
        line-height: ( $height-btn - 2 )/2;
        background-color: $color-info;
        &:first-child{
            @include border-radius(3px 3px 0 0);
        }
        &:last-child{
            @include border-radius(0 0 3px 3px);
        }
        &:hover{
            background: $color-main;
        }
        &:active{
            transform: translateY(2px);
        }
    }
}
</style>