<template>
   <div class="container mt-3 pb-5">
      <el-form
          :model="user"
          :rules="userRules"
          ref="register" label-width="100px">
         <el-form-item label="用户名" prop="Username">
            <el-input autocomplete="off" v-model="user.Username"/>
         </el-form-item>
         <el-form-item label="昵称" prop="Nickname">
            <el-input autocomplete="off" v-model="user.Nickname"/>
         </el-form-item>
         <el-form-item label="微信" prop="Wx">
            <el-input autocomplete="off" v-model="user.Wx"/>
         </el-form-item>
         <el-form-item label="手机" prop="Phone">
            <el-input autocomplete="off" v-model="user.Phone"/>
         </el-form-item>
         <el-form-item label="高德组队码" prop="Gaode">
            <el-input autocomplete="off" v-model="user.Gaode"/>
         </el-form-item>
         <el-form-item label="主页" prop="Homepage">
            <el-input autocomplete="off" v-model="user.Homepage"/>
         </el-form-item>
         <el-form-item label="密码" prop="Password">
            <el-input autocomplete="off" v-model="user.Password"/>
         </el-form-item>
         <el-form-item label="确认密码" prop="PasswordRepeat">
            <el-input autocomplete="off" v-model="user.PasswordRepeat"/>
         </el-form-item>
         <el-form-item label="邀请码" prop="InvitationCode">
            <el-input autocomplete="off" v-model="user.InvitationCode"/>
         </el-form-item>
         <el-form-item align="center">
            <el-button type="primary" @click="submit">注册</el-button>
         </el-form-item>
      </el-form>
   </div>
</template>

<script>
import utility from "@/utility"

export default {
   name: "Register",
   data() {
      const validatePasswordRepeat = (rule, value, callback) => {
         if (value !== this.user.Password){
            callback(new Error("两次密码输入不一致"))
         } else {
            callback()
         }
      }
      return {
         isNewUser: false,
         user: {
            Username: '',
            Nickname: '',
            Wx: '',
            Phone: '',
            Homepage: '',
            Gaode: '',
            Password: '',
            PasswordRepeat: '',
            InvitationCode: ''
         },
         userRules: {
            Username : [
               {required : true, message : '请填写用户名', trigger : 'blur'},
               {validator: (rule, value, callback) => {
                     if (!/^[a-z_]+$/.test(value)){
                        callback(new Error("用户名只能是小写字母"))
                     } else {
                        callback()
                     }
                  }
               }
             ],
            Nickname : {required : true, message : '请填写昵称', trigger  : 'blur'},
            Wx       : {required : true, message : '请填写微信', trigger  : 'blur'},
            Phone    : {required : true, message : '请填写手机号', trigger : 'blur'},
            Homepage : '',
            Gaode    : '',
            Password : {required : true, message : '请填写原密码', trigger : 'blur'},
            PasswordRepeat: [
               {required: true, message: '请再填写一次新密码', trigger: 'blur'},
               {validator: validatePasswordRepeat, trigger: 'blur'}
            ],
            InvitationCode: {required : true, message : '请输入邀请码', trigger  : 'blur'},
         }
      }
   },
   mounted() {
/*      if (localStorage.registerUser) {
         this.user = JSON.parse(localStorage.registerUser)
      }*/
   },
   methods: {
      submit(){
         this.$refs['register'].validate((valid) => {
            if (valid) {
               this.register()
            } else {
               console.log('error submit!!')
               return false
            }
         })
      },
      register() {
         // localStorage.registerUser = JSON.stringify(this.user)
         utility.postData(utility.URL.register, this.user)
             .then(res => {
                this.$notify({
                   title: res.msg,
                   message: res.description,
                   position: 'top-right',
                   type: 'success',
                   onClose() {
                   }
                })
             }).catch(msg => {
            this.$notify(msg)
         })
      },
   },
}
</script>

<style scoped>

</style>
