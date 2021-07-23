<template>
    <div class="circle-panel card">
        <div class="toolbar">
            <el-button class="lnglat" :data-clipboard-text="JSON.stringify(data)" size="mini" type="info">复制数据到剪贴板</el-button>
            <el-button size="mini" type="primary" @click="$emit('showLine', null)">展示路线</el-button>
            <el-button size="mini" type="danger" @click="$emit('setData', [])">清空</el-button>
        </div>
        <table class="log">
            <thead>
                <tr>
                    <td>#</td>
                    <td>经纬</td>
                    <td>地点</td>
                    <td>备注</td>
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
                <td><el-input @keyup.native.enter="addNewRoutePointWithKeyEnter" clearable ref="name" size="mini" placeholder="标记名" v-model="name"></el-input></td>
                <td><el-input @keyup.native.enter="addNewRoutePointWithKeyEnter" clearable ref="note" size="mini" placeholder="备注" v-model="note" ></el-input></td>
                <td>
                    <el-button size="mini" type="primary" @click="addNewRoutePoint">添加</el-button>
                </td>
            </tr>
                <tr v-for="(item, index) in dataLocal" :key="index">

                    <td>{{dataLocal.length - index}}</td>
                    <td>
                        <div class="lnglat" :data-clipboard-text="`[${lng}, ${lat}]`">
                            <div class="lng">lng: {{item.position[0]}}</div>
                            <div class="lat">lat: {{item.position[1]}}</div>
                        </div>
                    </td>
                    <td>{{item.name}}</td>
                    <td>{{item.note}}</td>
                    <td>
                        <div :class="['operation', {'align-items-start': index > 0}, {'align-items-end': index < data.length - 1}]">
                            <div class="move">
                                <i class="el-icon-caret-top" v-if="index > 0"  @click="move(index, 'up')"></i>
                                <i class="el-icon-caret-bottom" v-if="index < data.length - 1" @click="move(index, 'down')"></i>
                            </div>
                            <div class="delete">
                                <i class="el-icon-circle-close" @click="routePointDelete(index)"></i>
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
    name: "RoutePanel",
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
            note: '', // 标记note
            clipboardRouteData: '' // 要复制的所有路线点的数据
        }
    },
    computed: {
        dataLocal(){
            return [...this.data]
        }
    },
    watch:{
        data(newValue){
            this.clipboardRouteData = JSON.stringify(newValue)
        }
    },
    mounted() {
        let clipboard = new ClipboardJS('.lnglat')
    },
    methods: {
        // enter 时触发的方法
        addNewRoutePointWithKeyEnter(){
            if(this.validateInput()){
                this.$emit('pointAdd', {
                    position: [this.lng, this.lat],
                    note: this.note,
                    name: this.name
                })
                this.name = ''
                this.note = ''
            }

            this.$nextTick(()=>{
                this.$refs.name.focus()
            })
        },
        // 点击时触发的方法
        addNewRoutePoint(){
            if(this.validateInput()){
                this.$emit('pointAdd', {
                    position: [this.lng, this.lat],
                    note: this.note,
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
        routePointDelete(index){
            this.data.splice(index, 1)
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
        height: math.div(( $height-btn - 2 ), 2);
        width: math.div(( $height-btn - 2 ), 2) + 6;
        line-height: math.div(( $height-btn - 2 ), 2);
        background-color: $color-border;

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
        height: math.div(( $height-btn - 2 ), 2);
        line-height: math.div(( $height-btn - 2 ), 2);
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
        &:nth-child(3) {width: 25%;}
        &:nth-child(4) {width: 25%;}
        &:nth-child(5) {width: 15%;}
    }
}
tbody{
    tr:hover{
        .move i{
            color: white;
            background: $color-main;
        }
        .delete i{
            color: white;
            background-color: $color-danger;
        }
    }
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