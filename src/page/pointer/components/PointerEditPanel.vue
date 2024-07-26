<template>
    <div class="pointer-panel card">
        <div class="toolbar">
            <ElButton class="lnglat" :data-clipboard-text="JSON.stringify(data)" size="small" type="info" icon="CopyDocument">复制 JSON 数据</ElButton>
            <ElButton size="small" type="danger" @click="$emit('setData', [])" icon="RefreshLeft">清空</ElButton>
            <ElButton class="ml-1" size="small" type="primary" @click="$emit('showPointer', null)" icon="Position">展示点图</ElButton>
        </div>
        <table class="table-record">
            <thead>
                <tr>
                    <th style="width: 30px;">#</th>
                    <th style="width: 80px;">经纬</th>
                    <th style="width: 100px;">地点</th>
                    <th style="width: 100px;">备注</th>
                    <th style="width: 80px;">类别</th>
                    <th style="width: 40px;">图片</th>
                    <th style="width: 80px;">操作</th>
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
                    <ElInput
                        @keyup.native.enter="addNewPointerWithKeyEnter"
                        clearable
                        ref="inputName" class="input-focus" size="small"
                        placeholder="标记名"
                        v-model="pointerName"/>
                </td>
                <td>
                    <ElInput
                        @keyup.native.enter="addNewPointerWithKeyEnter"
                        clearable
                        ref="inputNote" class="input-focus" size="small"
                        placeholder="备注" type="textarea" :rows="1"
                        v-model="pointerNote"/>
                </td>
                <td>
                    <ElSelect size="small" v-model="pointerType">
                        <ElOption label="白色" value="白色">白色</ElOption>
                        <ElOption label="黄色" value="黄色">黄色</ElOption>
                        <ElOption label="黑色" value="黑色">黑色</ElOption>
                        <ElOption label="红色" value="红色">红色</ElOption>
                        <ElOption label="绿色" value="绿色">绿色</ElOption>
                    </ElSelect>
                </td>
                <td>
                    <div class="img-wrapper">
                        <img v-if="pointerImg" :src="`${pointerImg}-${imgSuffix}`" alt="图片">
                        <label class="logo avatar" for="avatar">
                            <ElIcon size="14"><Upload/></ElIcon>
                        </label>
                        <input type="file" @change="uploadAvatar" id="avatar">
                    </div>
                </td>
                <td>
                    <ElButton size="small" type="success" @click="addNewPointer" icon="el-icon-plus">添加</ElButton>
                </td>
            </tr>

            <tr v-for="(item, index) in pointersLocal" :key="index">
                <td>{{index + 1}}</td>
<!--                <td @click="modifyString(item.position, index, 'position')">-->
                <td>
                    <div class="lnglat" :data-clipboard-text="`[${lng}, ${lat}]`">
                        <div class="lng">lng: {{item.position[0]}}</div>
                        <div class="lat">lat: {{item.position[1]}}</div>
                    </div>
                </td>
                <td @click="modifyString('地点名', item.name, index, 'name')">{{item.name}}</td>
                <td @click="modifyString('备注', item.note, index, 'note')">{{item.note}}</td>
                <td @click="modifyString('类别', item.note, index, 'type')">{{item.type}}</td>
                <td>
                    <div class="img-wrapper">
                        <img v-if="item.img" :src="`${item.img}-${imgSuffix}`" alt="图片">
                        <label class="logo avatar" for="avatar" @click="currentPointIndex = index">
                            <i class="el-icon-upload2"></i>
                        </label>
                    </div>
                </td>
                <td>
                    <div :class="['operation', {'align-items-start': index > 0}, {'align-items-end': index < data.length - 1}]">
                        <div class="move">
                            <i class="el-icon-caret-top" v-if="index > 0"  @click="move(index, 'up')"></i>
                            <i class="el-icon-caret-bottom" v-if="index < data.length - 1" @click="move(index, 'down')"></i>
                        </div>
                        <div class="delete">
                            <i class="el-icon-circle-close" @click="pointerDelete(index)"></i>
                        </div>
                    </div>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
    <ElDialog
        center
        title=""
        append-to-body
        :visible.sync="isModalShowing"
        :before-close="closeModal"
        width="50%">
        <div>
            <ElForm>
                <ElFormItem :label="`修改${modalTitle}`">
                    <ElInput v-model="currentModifyingString"/>
                </ElFormItem>
            </ElForm>
        </div>
        <div slot="footer" class="dialog-footer">
            <ElButton size="small" type="info" @click="isModalShowing = false">取消</ElButton>
            <ElButton size="small" type="primary" @click="submitStringChange">确定</ElButton>
        </div>
    </ElDialog>
</template>

<script>
import ClipboardJS from 'clipboard'
import {qiniu_bucket_name, qiniu_img_base_url, thumbnail200_suffix} from "@/mapConfig";
import * as qiniu from "qiniu-js";
import {getAuthorization} from "@/utility";
import {ElMessage} from "element-plus";
import {getUploadToken} from "@/api/fileApi";

export default {
    name: "PointerEditPanel",
    props: {
        searchLocation: {type: String},
        data: {type: Array},
        lng: {type: Number},
        lat: {type: Number},
        policy: {type: Number}
    },
    model: {
        prop: 'data',
        event: 'setData'
    },
    data() {
        return {
            pointerName: '', // 当前点的地名
            pointerNote: '', // 标记note
            pointerImg: '', // 标记图片地址
            pointerType: '', // 标记类别，颜色区分

            pointersLocal: [],
            clipboardPointerData: '', // 要复制的所有点图点的数据
            clipboard: null,

            imgSuffix: thumbnail200_suffix,
            currentPointIndex: null, // 当前图片需要放到哪个点位上

            isModalShowing: false,
            currentModifyingString: '', //
            modifyingArrayIndex: null, // 编辑的 index
            modifyingParamName: '', // 编辑的字段名
            modalTitle: '', // 编辑的字段名
        }
    },
    computed: {
    },
    emits: ['pointAdd', 'print', 'showPointer'],
    watch:{
        data(newValue){
            this.pointersLocal = [...this.data]
            this.clipboardPointerData = JSON.stringify(newValue)
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
        closeModal(){
            this.isModalShowing = false
            this.currentModifyingString = ''
        },
        modifyString(title, str, index, paramName){
            this.modalTitle = title
            this.modifyingParamName = paramName
            this.modifyingArrayIndex = index
            this.currentModifyingString = str
            this.isModalShowing =  true
        },
        // 提交对字符串的修改
        submitStringChange(){
            this.$set(this.pointersLocal[this.modifyingArrayIndex], this.modifyingParamName, this.currentModifyingString)
            this.isModalShowing = false
            this.currentModifyingString = ''
        },
        uploadAvatar(event){
            if (!getAuthorization()){
                this.$message.error('请登录后操作')
                return
            }
            if (event.target.files.length > 0){
                this.avatarFile = event.target.files[0]
                if (!/image\/.*/.test(this.avatarFile.type)){
                    this.$message.warning('请选择图片文件')
                    event.target.value = '' // 清空 Input 内容
                    return
                }
                if (this.avatarFile.size > 1024 * 1024 * 8){
                    this.$message.warning('图片应小于 8MB')
                    event.target.value = '' // 清空 Input 内容
                    return
                }

                getUploadToken({
                        bucket: qiniu_bucket_name
                    })
                    .then(res => {
                        console.log('get token success')
                        // 上传文件
                        const observer = {
                            next: res => {
                                console.log('next: ',res)
                            },
                            error: err => {
                                console.log(err)
                            },
                            complete: res => {
                                // res = {hash: 'hash', key_service: 'key_service'}
                                console.log('complete: ',res)
                                if (this.currentPointIndex !== null){
                                    let tempData = this.data // 临时数组
                                    tempData[this.currentPointIndex].img = qiniu_img_base_url + res.key
                                    this.$emit('setData', [...tempData])
                                    this.currentPointIndex = null // 指向归位
                                } else {
                                    this.pointerImg = qiniu_img_base_url + res.key
                                }
                            }
                        }
                        const observable = qiniu.upload(this.avatarFile, null, res.data, {}, {})
                        const subscription = observable.subscribe(observer) // 上传开始
                        // subscription.unsubscribe() // 上传取消
                    })
                    .catch(err => {
                        ElMessage.error('获取上传 token 失败')
                    })
            }
        },
        // enter 时触发的方法
        addNewPointerWithKeyEnter(){
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
        addNewPointer(){
            if(this.validateInput()){
                this.$emit('pointAdd', {
                    position: [this.lng, this.lat],
                    note: this.pointerNote,
                    name: this.pointerName,
                    type: this.pointerType,
                    img: this.pointerImg
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
        pointerDelete(index){
            this.data.splice(index, 1)
        }
    }

}
</script>

<style scoped lang="scss">
@use 'sass:math';

@import "../../../scss/plugin";
.pointer-panel {
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

.img-wrapper{
    display: flex;
    justify-content: flex-start;
    input[type=file]{
        display: none;
    }
    img{
        height: 30px;
        display: block;
        margin-right: 5px;
    }
    label{
        display: flex;
        justify-content: flex-start;
        background-color: white;
        cursor: pointer;
        i{
            border: 1px solid $border-light;
            width: 30px;
            height: 30px;
            line-height: 30px;
            text-align: center;
            &:hover{
                border-color: $green;
            }
        }

    }
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
        white-space: nowrap;
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
    padding: 6px;
}

table.table-record{
    width: 100%;
}
thead{
    th {
        font-weight: normal;
        font-size: 0.8rem;
        color: $text-main;
        padding: 8px 2px 3px 5px;
        border-bottom: 1px solid $border-normal;
        &:last-child, &:first-child {
            text-align: center;
        }
    }
}
tbody{
    th{
        font-size: $fz-small;
    }
    tr{
        &:hover{
            outline: 1px solid $color-main;
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

@media (max-width: $screen-width-threshold) {
    .circle-panel{
        width: 100%;
    }
}
</style>
