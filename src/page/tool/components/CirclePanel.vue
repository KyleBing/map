<template>
    <div class="circle-panel card">


        <table class="log">
            <thead>
                <tr>
                    <td>#</td>
                    <td>经纬度</td>
                    <td>地点名称</td>
                    <td>半径</td>
                    <td>操作</td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in data" :key="index">
                    <td>{{index + 1}}</td>
                    <td>
                        <div class="lnglat">
                            <div class="lng">lng: {{item.lng}}</div>
                            <div class="lat">lat: {{item.lat}}</div>
                        </div>
                    </td>
                    <td>{{item.lng}}</td>

                    <td>{{item.radius}}</td>
                    <td>
                        <div class="move-operation">
                            <i class="el-icon-caret-top up" v-if="index > 0"  @click="moveUp"></i>
                            <i class="el-icon-caret-bottom down" v-if="index < data.length - 1" @click="moveDown"></i>
                        </div>
                    </td>
                </tr>
            <tr>
                <td></td>
                <td>
                    <div class="lnglat">
                        <div class="lng">lng: {{lng}}</div>
                        <div class="lat">lat: {{lat}}</div>
                    </div>
                </td>
                <td><el-input size="mini" placeholder="地点" v-model="name"></el-input></td>
                <td><el-input size="mini" placeholder="半径" v-model="radius" type="number"></el-input></td>
            </tr>
            </tbody>

        </table>

        <div class="toolbar">
            <el-button size="mini" type="success" @click="addNewCircle">标记并画圈</el-button>
        </div>
    </div>

</template>

<script>
export default {
    name: "CirclePanel",
    props: {
        data: {type: Array},
        lng: {type: Number},
        lat: {type: Number},
    },
    data() {
        return {
            name: '', // 当前点的地名
            radius: '', // 半径：公里
        }
    },
    methods: {
        addNewCircle(){
            if(this.validateInput()){
                this.$emit('circleAdd', {
                    center: [this.lng, this.lat],
                    radius: this.radius,
                    name: this.name
                })
            }
        },
        validateInput(){
            if (!this.lng || !this.lat){
                this.$message({
                    message: '坐标未选定'
                })
                return false
            }
            if (!this.name){
                this.$message({
                    message: '地名未填写'
                })
                return false
            }
            if (!this.radius){
                this.$message({
                    message: '半径未填写'
                })
                return false
            }
            return true
        },
        moveUp(){},
        moveDown(){},
    },
    watch: {
        radius(newValue){
            if (newValue < 0){
                this.radius = 0
            }
        }
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
    padding: 0;
}


$height-btn: 28px;

.move-operation{
    flex-shrink: 0;
    > *{
        margin: 0 auto;
        cursor: pointer;
        color: white;
        text-align: center;
        font-size: 0.5rem;
        display: block;
        height: ( $height-btn - 2 )/2;
        width: ( $height-btn - 2 )/2 + 6;
        line-height: ( $height-btn - 2 )/2;
        background-color: $color-info;

        &:hover{
            background: $color-main;
        }
        &:active{
            transform: translateY(2px);
        }
    }
    .up{
        @include border-radius(3px 3px 0 0);
    }
    .down{
        @include border-radius(0 0 3px 3px);
    }
}

.lnglat{
    flex-shrink: 0;
    .lng, .lat{
        font-size: 10px;
        height: ( $height-btn - 2 )/2;
        line-height: ( $height-btn - 2 )/2;
    }
}

.toolbar{
    border-top: 1px solid $color-border;
    padding: 6px;
}

table{
    font-size: 0.9rem;
    width: 100%;
}
thead{
    td {
        padding: 8px 2px 3px 5px;
        border-bottom: 1px solid $color-border;
        &:last-child, &:first-child {
            text-align: center;
        }
        &:nth-child(1) {width: 10%;}
        &:nth-child(2) {width: 30%;}
        &:nth-child(3) {width: 25%;}
        &:nth-child(4) {width: 20%;}
        &:nth-child(5) {width: 15%;}
    }
}
tbody{

    tr:nth-child(2n + 1){
        background-color: #f2f2f2;
    }
    td{
        padding: 2px 0 2px 5px;
        &:last-child, &:first-child {
            text-align: center;
        }
    }
}
</style>