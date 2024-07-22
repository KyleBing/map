<template>
    <div class="container">
        <ElRow>
            <ElCol :span="10" :offset="(24 - 10)/2">
                <div class="content"
                     :style="`min-height: ${store.windowInsets.height}px`"
                >
                    <div class="register-header">
                        <img src="../assets/logo.png" alt="LOGO">
                        <h2>注册</h2>
                    </div>
                    <ElForm
                        label-position="top"
                        :model="formRegister"
                        :rules="userRules"
                        ref="refFormRegister"
                        label-width="100px">
                        <ElFormItem label="邀请码" prop="invitationCode">
                            <ElInput autocomplete="off" v-model="formRegister.invitationCode"/>
                        </ElFormItem>
                        <ElFormItem label="邮箱" prop="email">
                            <ElInput autocomplete="off" v-model="formRegister.email"/>
                        </ElFormItem>
                        <ElFormItem label="用户名" prop="username">
                            <ElInput autocomplete="off" v-model="formRegister.username"/>
                        </ElFormItem>
                        <ElFormItem label="昵称" prop="nickname">
                            <ElInput autocomplete="off" v-model="formRegister.nickname"/>
                        </ElFormItem>
                        <ElFormItem label="微信 (挪车使用)" prop="wx">
                            <ElInput autocomplete="off" v-model="formRegister.wx"/>
                        </ElFormItem>
                        <ElFormItem label="手机 (挪车使用)" prop="phone">
                            <ElInput autocomplete="off" v-model="formRegister.phone"/>
                        </ElFormItem>
<!--                        <ElFormItem label="高德组队码" prop="gaode">
                            <ElInput autocomplete="off" v-model="formRegister.gaode"/>
                        </ElFormItem>-->
                        <ElFormItem label="主页" prop="homepage">
                            <ElInput autocomplete="off" v-model="formRegister.homepage"/>
                        </ElFormItem>
                        <ElFormItem label="密码" prop="password">
                            <ElInput autocomplete="off" v-model="formRegister.password"/>
                        </ElFormItem>
                        <ElFormItem label="确认密码" prop="passwordrepeat">
                            <ElInput autocomplete="off" v-model="formRegister.passwordrepeat"/>
                        </ElFormItem>

                    </ElForm>
                    <div class="submit">
                        <ElButton style="width: 200px" type="primary" @click="submit">注册</ElButton>
                    </div>
                </div>
            </ElCol>
        </ElRow>
    </div>
</template>

<script lang="ts" setup>
import userApi from "@/api/userApi";
import {reactive, ref} from "vue";
import {useProjectStore} from "@/pinia.ts";
import {useRoute, useRouter} from "vue-router";
import {ElNotification} from "element-plus";

const store = useProjectStore()
const router = useRouter()
const route = useRoute()


const refFormRegister = ref()

const validatePassworDrepeat = (rule, value, callback) => {
    if (value !== formRegister.value.password) {
        callback(new Error("两次密码输入不一致"))
    } else {
        callback()
    }
}

const isNewUser = ref(false)
const formRegister = ref({
    username: '',
    nickname: '',
    wx: '',
    phone: '',
    homepage: '',
    // gaode: '',
    password: '',
    passwordrepeat: '',
    invitationCode: ''
})

const userRules = reactive({
    email: [
        {required: true, message: '请填写邮箱', trigger: 'blur'},
        {
            validator: (rule, value, callback) => {
                if (!/(\w|\d)+@(\w|\d)+\.\w+/i.test(value)) {
                    callback(new Error("邮箱格式有误"))
                } else {
                    callback()
                }
            }
        }
    ],
    username: [
        {required: true, message: '请填写用户名', trigger: 'blur'},
        {
            validator: (rule, value, callback) => {
                if (!/^[a-z_]+$/.test(value)) {
                    callback(new Error("用户名只能是小写字母"))
                } else {
                    callback()
                }
            }
        }
    ],
    nickname: {required: true, message: '请填写昵称', trigger: 'blur'},
    wx: {required: true, message: '请填写微信', trigger: 'blur'},
    phone: {required: true, message: '请填写手机号', trigger: 'blur'},
    homepage: '',
    // gaode: '',
    password: {required: true, message: '请填写原密码', trigger: 'blur'},
    passwordrepeat: [
        {required: true, message: '请再填写一次新密码', trigger: 'blur'},
        {validator: validatePassworDrepeat, trigger: 'blur'}
    ],
    invitationCode: {required: true, message: '请输入邀请码', trigger: 'blur'},
})

function submit() {
    refFormRegister.value.validate((valid) => {
        if (valid) {
            register();
        } else {
            console.log('error submit!!');
            return false;
        }
    });
}
function register() {
    userApi
        .register(formRegister.value)
        .then(res => {
            ElNotification({
                title: res.message,
                message: '请登录',
                position: 'top-right',
                type: 'success',
                onClose() {
                }
            })
            router.push('/login')
        })
}
</script>

<style scoped lang="scss">
@import "../scss/plugin";
$height: 80px;

.container {
    background-color: $border-normal;
}

.content {
    padding: 100px 60px;
    background-color: white;
    @include box-shadow(1px 2px 5px rgba(0,0,0,0.1))
}

.register-header {
    margin-bottom: 30px;
    display: flex;
    justify-content: center;

    img {
        padding: 5px;
        margin-right: 20px;
        display: block;
        height: $height;
    }

    h2 {
        color: $text-main;
        line-height: $height;
    }
}

.submit {
    display: flex;
    justify-content: center;
}
</style>
