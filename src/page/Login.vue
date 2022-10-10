<template>
   <div class="container mt-3 pb-5">
      <el-form
          :model="user"
          :rules="userRules"
          ref="login" label-width="100px">
         <el-form-item label="用户名" prop="username" >
            <el-input autocomplete="off" v-model="user.username"/>
         </el-form-item>
         <el-form-item label="密码" prop="password" >
            <el-input autocomplete="off" v-model="user.password"/>
         </el-form-item>
         <el-form-item align="center">
            <el-button type="primary" @click="submit">登录</el-button>
         </el-form-item>
      </el-form>
   </div>
</template>

<script>
import utility from "@/utility"
import { mapMutations } from "vuex"

export default {
   name: "Login",
   data() {
      return {
         isNewUser: false,
         user: {
            username: '',
            password: ''
         },
         userRules: {
            username:  {required: true, message: '请填写用户名', trigger: 'blur'},
            password:  {required: true, message: '请填写密码', trigger: 'blur'},
         }
      }
   },
   mounted() {},
   methods: {
      ...mapMutations([
          'setUserInfo'
      ]),
      submit(){
         this.$refs['login'].validate((valid) => {
            if (valid) {
               this.login()
            } else {
               console.log('error submit!!')
               return false
            }
         })
      },
      login() {
         utility.postData(utility.URL.login, this.user)
             .then(res => {
                let that = this
                this.setUserInfo(res.data)
                this.$notify({
                   title: res.msg,
                   message: res.description,
                   position: 'top-right',
                   type: 'success',
                   duration: 3,
                   onClose() {
                      that.$router.push('/code/list')
                   }
                })
             }).catch(msg => this.$notify(msg))
      },
   },
}
</script>

<style scoped>

</style>
