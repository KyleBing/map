<template>
    <div class="login-bg" :style="`height:${height}px`">
        <div class="logo">
            <img src="../assets/logo.png" alt="LOGO">
        </div>
        <div class="login-panel">
            <div class="login-title">
                <h2>路书</h2>
            </div>
            <ElForm
                :model="formLogin"
                :rules="loginRules"
                ref="refFormLogin" label-width="0">
                <ElFormItem label="" prop="email">
                    <ElInput autocomplete="off" placeholder="邮箱" v-model="formLogin.email"/>
                </ElFormItem>
                <ElFormItem label="" prop="password">
                    <ElInput type="password" autocomplete="off" @keydown.enter.native="submit" placeholder="密码" v-model="formLogin.password"/>
                </ElFormItem>
                <ElFormItem align="center">
                    <ElButton :loading="isInLoginProcess" class="login-btn" type="primary" @click="submit">登录</ElButton>
                </ElFormItem>
            </ElForm>
            <div class="register-link">
                <RouterLink to="register">注册</RouterLink>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, reactive, ref, watch} from "vue";
import {useProjectStore} from "@/pinia.ts";
import {useRouter} from "vue-router";
import {ElMessage, FormRules} from "element-plus";
import {getAuthorization, setAuthorization} from "@/utility.ts";
import {AnimateHeartCanvas} from "animate-heart-canvas/animate-heart-canvas.js";
import {userLogin} from "@/api/userApi.ts";

const store = useProjectStore()
const router = useRouter()

const refFormLogin = ref()
const animatedBg = ref()

const height = ref(600)
const formLogin = ref<{
    email: string,
    password: string
}>({
    email: '',
    password: ''
})
const loginRules = reactive<FormRules>({
    email: {required: true, message: '请填写用户名', trigger: 'blur'},
    password: {required: true, message: '请填写密码', trigger: 'blur'},
})
const isInLoginProcess = ref(false) // 登录中状态展示
// const animatedBg = ref(null)


onMounted(() => {
    height.value = innerHeight
    animatedBg.value = new AnimateHeartCanvas(0, 360, 50, 20, 100, '#eee')
})

onUnmounted(() => {
    animatedBg.value.destroy()
})

watch(() => store.windowInsets.height, newValue => {
    height.value = newValue
})

function submit() {
    refFormLogin.value.validate(valid => {
        if (valid) {
            login()
        } else {
            console.log('error submit!!')
            return false
        }
    });
}
function login() {
    isInLoginProcess.value = true
    userLogin(formLogin.value)
        .then(res => {
            console.log(res)
            console.log('Login success')
            isInLoginProcess.value = false
            setAuthorization(
                res.data.nickname,
                res.data.uid,
                res.data.email,
                res.data.phone,
                res.data.avatar,
                res.data.password,
                res.data.group_id,
                res.data.city,
                res.data.geolocation,
            )
            store.authorization = getAuthorization()
            ElMessage.success('欢迎用户 ' + res.data.username)

            router.push({name: 'Index'})
        })
        .catch(() => {
            isInLoginProcess.value = false
        })
}
</script>

<style scoped lang="scss">
@import "../scss/plugin";
.login-bg {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column nowrap;
    background-size: cover;
    //background: url('../assets/bg.jpg') no-repeat;
}

.logo{
    z-index: 10;
    display: flex;
    justify-content: center;
    flex-flow: row nowrap;
    transform: translateY(-50px);
    img{
        display: block;
        height: 100px;
    }

}

.login-title{
    text-align: center;
    font-size: 1.2rem;
    margin-bottom: 40px;
    color: $text-main;
}

.login-panel{
    z-index: 10;
    background-color: white;
    @include backdrop-filter(saturate(110%) blur(5px));
    padding: 30px 50px;
    @include border-radius(15px);
    width: 450px;
}

.login-btn{
    display: block;
    width: 100%;
}

.register-link{
    font-size: 13px;
    text-align: center;
}
</style>
