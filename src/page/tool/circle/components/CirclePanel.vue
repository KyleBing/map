<template>
    <div class="circle-panel card">
        <table class="log">
            <thead>
                <tr>
                    <td>#</td>
                    <td>经纬</td>
                    <td>地点</td>
                    <td>半径</td>
                    <td>操作</td>
                </tr>
            </thead>
            <tbody>
            <tr>
                <td><i class="el-icon-aim"></i></td>
                <td>
                    <div class="lnglat" :data-clipboard-text="`[${lng}, ${lat}]`">
                        <div class="lng">lng: {{lng || '--'}}</div>
                        <div class="lat">lat: {{lat || '--'}}</div>
                    </div>
                </td>
                <td><el-input @keyup.native.enter="addNewCircle" clearable ref="name" size="mini" placeholder="标记名" v-model="name"></el-input></td>
                <td><el-input @keyup.native.enter="addNewCircle" ref="radius" size="mini" placeholder="半径" v-model="radius" type="number"></el-input></td>
                <td>
                    <el-button size="mini" type="primary" @click="addNewCircle">添加</el-button>
                </td>
            </tr>
                <tr v-for="(item, index) in dataLocal" :key="index">

                    <td>{{dataLocal.length - index}}</td>
                    <td>
                        <div class="lnglat" :data-clipboard-text="`[${lng}, ${lat}]`">
                            <div class="lng">lng: {{item.center[0]}}</div>
                            <div class="lat">lat: {{item.center[1]}}</div>
                        </div>
                    </td>
                    <td>{{item.name}}</td>
                    <td>{{item.radius}} km</td>
                    <td>
                        <div :class="['operation', {'align-items-start': index > 0}, {'align-items-end': index < data.length - 1}]">
<!--                            <div class="move">
                                <i class="el-icon-caret-top" v-if="index > 0"  @click="move(index, 'up')"></i>
                                <i class="el-icon-caret-bottom" v-if="index < data.length - 1" @click="move(index, 'down')"></i>
                            </div>-->
                            <div class="delete">
                                <i class="el-icon-circle-close" @click="circleDelete(index)"></i>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import ClipboardJS from 'clipboard'
export default {
    name: "CirclePanel",
    props: {
        data: {type: Array},
        lng: {type: Number},
        lat: {type: Number},
    },
    model: {
        prop: 'data',
        event: 'setData'
    },
    data() {
        return {
            name: '', // 当前点的地名
            radius: '1', // 半径：公里
        }
    },
    computed: {
        dataLocal(){
            return [...this.data.reverse()]
        }
    },
    mounted() {
        let clipboard = new ClipboardJS('.lnglat')

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
                    message: '坐标未选定',
                    type: 'warning'
                })
                return false
            }
            if (!this.name){
                this.$message({
                    message: '地名未填写',
                    type: 'warning'
                })
                this.$refs.name.focus()
                return false
            }
            if (!this.radius){
                this.$message({
                    message: '半径未填写',
                    type: 'warning'
                })
                this.$refs.radius.focus()
                return false
            }
            return true
        },
        move(index, direction){
            let indexExchange = direction === 'up'? index - 1 : index + 1
            let tempItem = this.data[index]
            let preItem = this.data[indexExchange]
            let tempData = this.data // 临时数组
            tempData[indexExchange] = tempItem
            tempData[index] = preItem
            this.$emit('setData', [...tempData])
        },
        circleDelete(index){
            this.data.splice(index, 1)
        }
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
@use 'sass:math';

@import "../../../../scss/plugin";
.circle-panel {
    width: 400px;
    position: absolute;
    left: 20px;
    top: 20px;
    padding: 0;
}

$height-btn: 28px;

.operation{
    display: flex;
}
.delete{
    i {
        @include border-radius(3px);
        margin: 0 auto;
        cursor: pointer;
        text-align: center;
        font-size: 1rem;
        display: block;
        height: $height-btn - 2;
        width: $height-btn;
        line-height: $height-btn - 2;
        &:hover{
            color: white;
            background-color: $color-danger;
        }
        &:active{
            transform: translateY(2px);
        }
    }
}


.align-items-start{
    align-items: flex-start;
}
.align-items-end{
    align-items: flex-end;
}

.move{
    display: flex;
    flex-flow: column nowrap;
    flex-shrink: 0;
    > *{
        margin: 0 auto;
        cursor: pointer;
        text-align: center;
        font-size: 0.5rem;
        display: block;
        height: math.div(($height-btn - 2), 2);
        width: math.div(($height-btn - 2), 2) + 6;
        line-height: math.div(($height-btn - 2), 2);
        background-color: $color-border;

        &:hover{
            color: white;
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
    cursor: pointer;
    flex-shrink: 0;
    .lng, .lat{
        font-size: 10px;
        height: math.div(($height-btn - 2), 2);
        line-height: math.div(($height-btn - 2), 2);
    }
    &:active{
        transform: translateY(1px);
        color: $color-main;
    }
}

.toolbar{
    border-top: 1px solid $color-border;
    padding: 6px;
}

table{
    width: 100%;
}
thead{
    td {
        font-size: 0.8rem;
        color: $text-main;
        padding: 8px 2px 3px 5px;
        border-bottom: 1px solid $color-border;
        &:last-child, &:first-child {
            text-align: center;
        }
        &:nth-child(1) {width: 10%;}
        &:nth-child(2) {width: 25%;}
        &:nth-child(3) {width: 30%;}
        &:nth-child(4) {width: 20%;}
        &:nth-child(5) {width: 15%;}
    }
}
tbody{
    tr:nth-child(2n + 1){
        background-color: #f2f2f2;
    }
    td{
        font-size: 0.7rem;
        padding: 2px 2px 2px 5px;
        &:last-child, &:first-child {
            text-align: center;
        }
    }
}

</style>