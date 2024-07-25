<template>
    <div class="route-list p-2">
        <div class="tool-bar mb-2" v-if="!isInPortraitMode">
            <ElForm size="small" inline>
                <ElFormItem>
                    <ElButton type="success" @click="addNewPointer" icon="el-icon-plus">新增点图</ElButton>
                    <ElButton type="primary" @click="addNewPointerWidthMap" icon="el-icon-s-promotion">从地图中规划点图</ElButton>
                </ElFormItem>
                <ElFormItem label="关键字" class="ml-4">
                    <ElInput clearable placeholder="点图名" v-model="formSearch.keyword"></ElInput>
                </ElFormItem>
                <ElFormItem label="添加时间区间">
                    <ElDatePicker type="datetimerange" v-model="formSearch.dateRange"></ElDatePicker>
                </ElFormItem>
                <ElFormItem>
                    <ElButton type="primary" @click="search" icon="Filter">查询</ElButton>
                </ElFormItem>
            </ElForm>
        </div>

        <ElRow :gutter="10">
            <ElCol :span="24">
                <ElTable
                    class="table-narrow"
                    size="small"
                    :height="store.windowInsets.height - 170"
                    :max-height="store.windowInsets.height - 170"
                    stripe
                    :data="tableData"
                    v-loading="isLoading"
                >
                    <ElTableColumn width="50" prop="id" label="#"/>
                    <ElTableColumn width="150" prop="name" label="数据名"/>
                    <ElTableColumn align="center" width="50" prop="is_public" label="状态">
                        <template #default="scope">
                            {{ scope.row.is_public === 1 ? '公开' : '私有' }}
                        </template>
                    </ElTableColumn>
                    <ElTableColumn width="150" align="center" prop="area" label="地域"/>
<!--                    <ElTableColumn width="70" align="center" prop="policy" label="规划策略">
                        <template #default="scope">
                            {{policyMap.get(scope.row.policy)}}
                        </template>
                    </ElTableColumn>-->
                    <ElTableColumn width="100" align="center" prop="nickname" label="用户"/>

                    <ElTableColumn align="center" width="450px" label="操作">
                        <template #default="scope">
                            <ElButton class="btn-narrow" type="success"
                                       @click="showPointer(scope.row)" size="small" plain icon="View">地图中查看</ElButton>
                            <ElButton class="btn-narrow" type="success"
                                       v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === scope.row.uid)"
                                       @click="editPointer(scope.row)" plain size="small" icon="Position">地图中编辑</ElButton>
                            <ElButton class="btn-narrow" type="primary"
                                       v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === scope.row.uid)"
                                       @click="goEdit(scope.row)" plain size="small" icon="Edit">编辑</ElButton>
                            <ElButton class="btn-narrow" type="danger"
                                       v-if="store.isAdmin || (store.authorization && Number(store.authorization.uid) === scope.row.uid)"
                                       @click="goDelete(scope.row)" plain size="small" icon="Delete">删除</ElButton>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn align="center" width="50" prop="video_link" label="视频">
                        <template #default="scope">
                            <a class="link" v-if="scope.row.video_link" target="_blank" :href="scope.row.video_link"><i class="el-icon-video-camera"></i></a>
                            <span v-else>-</span>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn align="center" prop="pointers" label="数据点数量">
                        <template #default="scope">
                            <div>{{ scope.row.pointerArray.length }}</div>
                        </template>
                    </ElTableColumn>
                    <ElTableColumn align="left" width="250" prop="note" label="备注">
                        <template #default="scope">
                            <i class="el-icon-minus" v-if="scope.row.note === ''"></i>
                            <ElPopover v-else
                                        placement="left"
                                        title=""
                                        width="400"
                                        trigger="hover"
                                        :content="scope.row.note">
                                <template #reference class="table-description">
                                    <i class="el-icon-tickets"></i> {{scope.row.note}}
                                </template>
                            </ElPopover>
                        </template>
                    </ElTableColumn>

<!--                    <ElTableColumn sortable align="center" width="60px" prop="thumb_up" label="赞"/>-->
                    <ElTableColumn sortable align="center" width="160px" prop="date_create" label="创建时间">
                        <template #default="scope">
                            <div>{{ scope.row.date_create }}</div>
<!--                            <div>{{ scope.row.date_modify }}</div>-->
                        </template>
                    </ElTableColumn>
                    <ElTableColumn sortable align="center" width="160px" prop="date_modify" label="编辑时间">
                        <template #default="scope">
                            <div>{{ scope.row.date_modify }}</div>
<!--                            <div>{{ scope.row.date_modify }}</div>-->
                        </template>
                    </ElTableColumn>


                </ElTable>

                <!--  PAGINATION  -->
                <ElPagination
                    align="right"
                    class="mt-2"
                    size="small"
                    @size-change="pagerSizeChange"
                    @current-change="pageNoChange"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="pager.total"
                    :page-sizes="[10, 15, 20, 25, 30, 40, 100]"
                    :current-page="pager.pageNo"
                    :page-size="pager.pageSize"/>
            </ElCol>
        </ElRow>

        <!-- 编辑窗口-->
        <ElDialog
            :title="modalTitle"
            :visible.sync="modalEdit"
            width="40%"
            :before-close="closeModal">
            <ElForm
                :model="formPointer"
                :rules="formPointerRules"
                size="small"
                ref="formPointer" label-width="100px">
                <ElFormItem label="点图名" prop="name">
                    <ElInput v-model="formPointer.name"/>
                </ElFormItem>
                <ElFormItem label="地域" prop="area">
                    <ElInput v-model="formPointer.area"/>
                </ElFormItem>
                <ElFormItem label="是否公开" prop="is_public">
                    <ElRadio :label="1" v-model="formPointer.is_public">公开</ElRadio>
                    <ElRadio :label="0" v-model="formPointer.is_public">私有</ElRadio>
                </ElFormItem>
                <ElFormItem label="视频链接" prop="video_link">
                    <ElInput v-model="formPointer.video_link"/>
                </ElFormItem>
                <ElFormItem label="点位 json" prop="pointers">
                    <ElInput type="textarea" :rows="6" v-model="formPointer.pointers"/>
                </ElFormItem>
                <ElFormItem label="备注" prop="note">
                    <ElInput type="textarea" placeholder="支持 Markdown" :rows="5" v-model="formPointer.note"/>
                </ElFormItem>
            </ElForm>
            <div slot="footer" class="dialog-footer">
                <ElButton size="small" @click="clearForm" type="warning">清空</ElButton>
                <ElButton size="small" @click="closeModal">取 消</ElButton>
                <ElButton size="small" type="primary" @click="submit">{{ editingPointerId ? '修改' : '添加' }}</ElButton>
            </div>
        </ElDialog>
    </div>
</template>
<script>
import pointerApi from "@/api/pointerApi";
import {Base64} from "js-base64"
import {dateFormatter} from "@/utility";
import {useProjectStore} from "@/pinia";
import {ElMessageBox} from "element-plus";

const store = useProjectStore()

export default {
    name: "PointerList",
    data() {
        return {
            store,
            isLoading: false,
            editingPointerId: null,

            tableData: [],
            modalEdit: false, // modal show or not

            // FORM
            formPointer: { // 点图信息
                name: '', // *点图名
                area: '', // *地域
                video_link: '', // 路径视频演示
                pointers: [], // *路径点
                note: '', // 备注
                thumb_up: 0, // *点赞数
                is_public: 1, // *是否公开
            },
            formPointerRules: {
                name: [{required: true, message: '请填写点图钱', trigger: 'blur'},],
                area: [{required: true, message: '请填写地域', trigger: 'blur'},],
                policy: [{required: true, message: '请选择点图规划策略', trigger: 'blur'},],
            },
            // pager
            pager: {
                pageSize: 15,
                pageNo: 1,
                total: 0
            },

            formSearch: {
                keyword: '',
                dateRange: []
            }
        }
    },
    mounted() {
        this.getPointerList()
    },
    computed: {
        modalTitle() {
            return this.editingPointerId ? '编辑点图' : '新增点图'
        }
    },
    methods: {
        search(){
            this.getPointerList()
        },
        editPointer(routeInfo){
            this.$router.push({
                name: "PointerEditor",
                query: {
                    pointerId: routeInfo.id
                }
            })
        },
        // 跳转到路经展示页面
        showPointer(routeInfo){
            this.$router.push({
                name: "PointerViewer",
                query: {
                    pointerId: routeInfo.id
                }
            })
        },
        // route to line editor
        addNewPointerWidthMap(){
            this.$router.push({
                name: 'PointerEditor'
            })
        },
        addNewPointer() {
            this.modalEdit = true
            this.editingPointerId = null
            this.clearForm()
        },
        clearForm() {
            this.formPointer = {
                name: '', // *点图名
                area: '', // *地域
                video_link: '', // 路径视频演示
                pointers: '', // *路径点
                note: '', // 备注
                thumb_up: 0, // *点赞数
                is_public: 1, // *是否公开
            }
        },
        closeModal(done) {
            ElMessageBox.confirm('确认关闭？')
                .then(_ => {
                    this.editingPointerId = null
                    this.modalEdit = false
                    done();
                })
                .catch(_ => {
                });
        },
        submit() {
            this.$refs['formPointer'].validate((valid) => {
                if (valid) {
                    if (this.editingPointerId) {
                        this.pointerModifySubmit()
                    } else {
                        this.pointerNewSubmit()
                    }
                } else {
                    console.log('error submit!!');
                    return false;
                }
            })
        },
        // 编辑
        pointerModifySubmit() {
            // 为了断开最终数据与 formPointer 的关联
            let requestData = {}
            Object.assign(requestData, this.formPointer)
            requestData.pointers = Base64.encode(this.formPointer.pointers)
            pointerApi
                .modify(requestData)
                .then(res => {
                    this.$notify({
                        title: res.message,
                        position: 'top-right',
                        type: 'success',
                        onClose() {
                        }
                    })
                    this.editingPointerId = null
                    this.modalEdit = false
                    this.getPointerList()
                })
                .catch(err => {
                })
        },
        // 新增
        pointerNewSubmit() {
            // 为了断开最终数据与 formPointer 的关联
            let requestData = {}
            Object.assign(requestData, this.formPointer)
            requestData.pointers = Base64.encode(this.formPointer.pointers)
            pointerApi
                .add(requestData)
                .then(res => {
                    this.$notify({
                        title: res.message,
                        position: 'top-right',
                        type: 'success',
                        onClose() {
                        }
                    })
                    this.editingPointerId = null
                    this.modalEdit = false
                    this.getPointerList()
                })
        },


        // pagination
        pagerSizeChange(newPageSize) {
            this.pager.pageNo = 1
            this.pager.pageSize = newPageSize
            this.getPointerList()
        },
        pageNoChange(newCurrentPage) {
            this.pager.pageNo = 1
            this.pager.pageNo = newCurrentPage
            this.getPointerList()
        },

        // 获取点图列表
        getPointerList() {
            this.isLoading = true
            let requestData = {
                pageNo: this.pager.pageNo,
                pageSize: this.pager.pageSize,
                keyword: this.formSearch.keyword,
                dateRange: this.formSearch.dateRange
            }
            pointerApi
                .list(requestData)
                .then(res => {
                    this.isLoading = false
                    this.pager = res.data.pager
                    this.tableData = res.data.list.map(item => {
                        try  {
                            item.pointers = Base64.decode(item.pointers) || '[]'
                            item.pointerArray = JSON.parse(item.pointers)
                        } catch (err) {
                            item.pointers = ''
                            item.pointerArray = []
                            console.log(err)
                        }
                        item.date_create = dateFormatter(new Date(item.date_create))
                        item.date_modify = dateFormatter(new Date(item.date_modify))
                        return item
                    })
                })
                .catch(err => {
                    this.isLoading = false
                })
        },
        goEdit(routeLine) {
            this.editingPointerId = routeLine.uid
            Object.assign(this.formPointer, routeLine)
            this.modalEdit = true
        },
        goDelete(route) {
            console.log(route)
            ElMessageBox.confirm(`删除点图 ${route.name} (${route.area})`, '删除', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let requestData = {
                    id: route.id
                }
                pointerApi.delete(requestData)
                    .then(res => {
                            this.getPointerList();
                            this.$notify({
                                title: res.message,
                                position: 'top-right',
                                type: 'success'
                            });
                        }
                    )
            })
        }
    },

}
</script>

<style lang="scss">
.table-description{
    white-space: nowrap;
}

</style>
