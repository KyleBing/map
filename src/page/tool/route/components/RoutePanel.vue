<template>
    <div class="circle-panel card">
        <div class="toolbar">
            <el-button class="lnglat" :data-clipboard-text="JSON.stringify(data)" size="mini" type="info" icon="el-icon-document-copy">复制数据到剪贴板</el-button>
            <el-button size="mini" type="danger" @click="$emit('setData', [])" icon="el-icon-refresh-left">清空</el-button>
            <el-button size="mini" type="primary" @click="$emit('showLine', null)" icon="el-icon-position">展示路线</el-button>
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
                        <div class="lng">经: {{lng || '--'}}</div>
                        <div class="lat">纬: {{lat || '--'}}</div>
                    </div>
                </td>
                <td>
                    <el-input
                        @keyup.native.enter="addNewRoutePointWithKeyEnter"
                        clearable
                        ref="inputName" class="input-focus" size="mini"
                        placeholder="标记名"
                        v-model="pointerName"/>
                </td>
                <td>
                    <el-input
                        @keyup.native.enter="addNewRoutePointWithKeyEnter"
                        clearable
                        ref="inputNote" class="input-focus" size="mini"
                        placeholder="备注" type="textarea" :rows="1"
                        v-model="pointerNote"/>
                </td>
                <td>
                    <el-button size="mini" type="success" @click="addNewRoutePoint" icon="el-icon-plus">添加</el-button>
                </td>
            </tr>
                <tr v-for="(item, index) in routePathLocal" :key="index">

                    <td>{{routePathLocal.length - index}}</td>
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
        searchLocation: {type: String},
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
            pointerName: '', // 当前点的地名
            pointerNote: '', // 标记note

            clipboardRouteData: '', // 要复制的所有路线点的数据
            clipboard: null
        }
    },
    computed: {
        routePathLocal(){
            return [...this.data]
        }
    },
    watch:{
        data(newValue){
            this.clipboardRouteData = JSON.stringify(newValue)
        },
        searchLocation(newValue){
            this.pointerName = newValue
        },
    },
    beforeDestroy() {
        this.clipboard.destroy()
    },
    mounted() {
        // 1. 绑定剪贴板操作方法
        this.clipboard = new ClipboardJS('.lnglat', {
            text: function (trigger) {
                // 2. trigger 就是点击的 dom 元素，所以就可以通过它来获取到它的属性 'dataClipboard' 的值了
                // 3. 从这个方法返回的 string 就是会复制到剪贴板中的内容，所以可以复制任何内容了，也可以在这里处理一些逻辑
                // 4. 我在这里就只是单纯的输出了事先绑定好的值
                return trigger.getAttribute('data-clipboard-text')
            },
        })
        // 5. 当复制成功的时候提示复制成功
        this.clipboard.on('success', ()=>{  // 还可以添加监听事件，如：复制成功后提示
            this.$message.success('复制成功')
        })
    },
    methods: {
        // enter 时触发的方法
        addNewRoutePointWithKeyEnter(){
            if(this.validateInput()){
                this.$emit('pointAdd', {
                    position: [this.lng, this.lat],
                    note: this.pointerNote,
                    name: this.pointerName
                })
                this.pointerName = ''
                this.pointerNote = ''
            }

            this.$nextTick(()=>{
                this.$refs.inputName.focus()
            })
        },
        // 点击时触发的方法
        addNewRoutePoint(){
            if(this.validateInput()){
                this.$emit('pointAdd', {
                    position: [this.lng, this.lat],
                    note: this.pointerNote,
                    name: this.pointerName
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
            if (!this.pointerName){
                this.$message({
                    message: '地名未填写',
                    type: 'warning'
                })
                this.$refs.inputName.focus()
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
    &:hover{
        color: white;
        background-color: $color-danger;
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
        font-size: 12px;
        display: block;
        height: math.div(( $height-btn - 2 ), 2);
        width: math.div(( $height-btn - 2 ), 2) + 6;
        line-height: math.div(( $height-btn - 2 ), 2);
        border: 1px solid $color-border;
        &:hover{
            color: white;
            background-color: $color-primary;
            border-color: $color-primary;
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
