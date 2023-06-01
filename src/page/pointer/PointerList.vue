<template>
    <div class="route-list p-2">
        <div class="tool-bar mb-2" v-if="!isInPortraitMode">
            <el-form size="small" inline>
                <el-form-item>
                    <el-button type="success" @click="addNewPointer" icon="el-icon-plus">新增点图</el-button>
                    <el-button type="primary" @click="addNewPointerWidthMap" icon="el-icon-s-promotion">从地图中规划点图</el-button>
                </el-form-item>
                <el-form-item label="关键字" class="ml-4">
                    <el-input clearable placeholder="点位名" v-model="formSearch.keyword"></el-input>
                </el-form-item>
                <el-form-item label="添加时间区间">
                    <el-date-picker type="datetimerange" v-model="formSearch.dateRange"></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="search" icon="el-icon-search">查询</el-button>
                </el-form-item>
            </el-form>
        </div>

        <el-row :gutter="10">
            <el-col :span="24">
                <el-table
                    class="table-narrow"
                    size="mini"
                    :height="windowInsets.height - 170"
                    :max-height="windowInsets.height - 170"
                    stripe
                    :data="tableData"
                    v-loading="isLoading"
                >
                    <el-table-column width="50" prop="id" label="#"/>
                    <el-table-column width="150" prop="name" label="数据名"/>
                    <el-table-column align="center" width="50" prop="is_public" label="状态">
                        <template slot-scope="scope">
                            {{ scope.row.is_public === 1 ? '公开' : '私有' }}
                        </template>
                    </el-table-column>
                    <el-table-column width="150" align="center" prop="area" label="地域"/>
<!--                    <el-table-column width="70" align="center" prop="policy" label="规划策略">
                        <template slot-scope="scope">
                            {{policyMap.get(scope.row.policy)}}
                        </template>
                    </el-table-column>-->
                    <el-table-column width="100" align="center" prop="nickname" label="用户"/>

                    <el-table-column align="center" width="450px" label="操作">
                        <template slot-scope="scope">
                            <el-button class="btn-narrow" type="success"
                                       @click="showPointer(scope.row)" size="mini" plain icon="el-icon-view">地图中查看</el-button>
                            <el-button class="btn-narrow" type="success"
                                       v-if="isAdmin || (authorization && Number(authorization.uid) === scope.row.uid)"
                                       @click="editPointer(scope.row)" plain size="mini" icon="el-icon-position">地图中编辑</el-button>
                            <el-button class="btn-narrow" type="primary"
                                       v-if="isAdmin || (authorization && Number(authorization.uid) === scope.row.uid)"
                                       @click="goEdit(scope.row)" plain size="mini" icon="el-icon-edit">编辑</el-button>
                            <el-button class="btn-narrow" type="danger"
                                       v-if="isAdmin || (authorization && Number(authorization.uid) === scope.row.uid)"
                                       @click="goDelete(scope.row)" plain size="mini" icon="el-icon-delete">删除</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" width="50" prop="video_link" label="视频">
                        <template slot-scope="scope">
                            <a class="link" v-if="scope.row.video_link" target="_blank" :href="scope.row.video_link"><i class="el-icon-video-camera"></i></a>
                            <span v-else>-</span>
                        </template>
                    </el-table-column>
                    <el-table-column align="center" prop="pointers" label="数据点数量">
                        <template slot-scope="scope">
                            <div v-if="scope.row.pointers">{{ scope.row.pointersArray.length }}</div>
                        </template>
                    </el-table-column>
                    <el-table-column align="left" width="250" prop="note" label="备注">
                        <template slot-scope="scope">
                            <i class="el-icon-minus" v-if="scope.row.note === ''"></i>
                            <el-popover v-else
                                        placement="left"
                                        title=""
                                        width="400"
                                        trigger="hover"
                                        :content="scope.row.note">
                                <span class="table-description" slot="reference" >
                                    <i class="el-icon-tickets"></i> {{scope.row.note}}
                                </span>
                            </el-popover>
                        </template>
                    </el-table-column>

<!--                    <el-table-column sortable align="center" width="60px" prop="thumb_up" label="赞"/>-->
                    <el-table-column sortable align="center" width="160px" prop="date_create" label="创建时间">
                        <template slot-scope="scope">
                            <div>{{ scope.row.date_create }}</div>
<!--                            <div>{{ scope.row.date_modify }}</div>-->
                        </template>
                    </el-table-column>
                    <el-table-column sortable align="center" width="160px" prop="date_modify" label="编辑时间">
                        <template slot-scope="scope">
                            <div>{{ scope.row.date_modify }}</div>
<!--                            <div>{{ scope.row.date_modify }}</div>-->
                        </template>
                    </el-table-column>


                </el-table>

                <!--  PAGINATION  -->
                <el-pagination
                    align="right"
                    class="mt-2"
                    size="small"
                    @size-change="pagerSizeChange"
                    @current-change="currentPageChange"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="pager.total"
                    :page-sizes="[10, 15, 20, 25, 30, 40, 100]"
                    :current-page="pager.pageNo"
                    :page-size="pager.pageSize"/>
            </el-col>
        </el-row>

        <!-- 编辑窗口-->
        <el-dialog
            :title="modalTitle"
            :visible.sync="modalEdit"
            width="40%"
            :before-close="closeModal">
            <el-form
                :model="formPointer"
                :rules="formPointerRules"
                size="small"
                ref="formPointer" label-width="100px">
                <el-form-item label="点图名" prop="name">
                    <el-input v-model="formPointer.name"/>
                </el-form-item>
                <el-form-item label="地域" prop="area">
                    <el-input v-model="formPointer.area"/>
                </el-form-item>
                <el-form-item label="是否公开" prop="is_public">
                    <el-radio :label="1" v-model="formPointer.is_public">公开</el-radio>
                    <el-radio :label="0" v-model="formPointer.is_public">私有</el-radio>
                </el-form-item>
                <el-form-item label="视频链接" prop="video_link">
                    <el-input v-model="formPointer.video_link"/>
                </el-form-item>
                <el-form-item label="点位 json" prop="pointers">
                    <el-input type="textarea" :rows="6" v-model="formPointer.pointers"/>
                </el-form-item>
                <el-form-item label="备注" prop="note">
                    <el-input type="textarea" placeholder="支持 Markdown" :rows="5" v-model="formPointer.note"/>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button size="small" @click="clearForm" type="warning">清空</el-button>
                <el-button size="small" @click="closeModal">取 消</el-button>
                <el-button size="small" type="primary" @click="submit">{{ editingPointerId ? '修改' : '添加' }}</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import utility from "@/utility";
import {mapGetters, mapState} from "vuex";
import pointerApi from "@/api/pointerApi";
import {Base64} from "js-base64"

export default {
    name: "PointerList",
    data() {
        return {
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
        ...mapGetters(["isAdmin", 'isInPortraitMode']),
        ...mapState(['windowInsets','authorization']),
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
            this.$confirm('确认关闭？')
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
        currentPageChange(newCurrentPage) {
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
                        item.pointers = Base64.decode(item.pointers) || ''
                        item.pointersArray = item.pointers && JSON.parse(item.pointers)
                        item.date_create = utility.dateFormatter(new Date(item.date_create))
                        item.date_modify = utility.dateFormatter(new Date(item.date_modify))
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
            this.$confirm(`删除点图 ${route.name} (${route.area})`, '删除', {
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
