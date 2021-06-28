import axios from 'axios'
import qs from 'qs'
import VueCookie from 'vue-cookie'

// const BASE_URL = process.env.VUE_APP_BASE_URL;



// request network

function getData(url, queryData) {
   return new Promise(function (resolve, reject) {
      axios.get(url, {params: queryData})
         .then(res => {
            resolve(res.data)
         })
         .catch(() => {
            reject()
         })
   })
}
function postData(url, queryData) {
   return new Promise(function (resolve, reject) {
      axios.post(url, qs.stringify(queryData))
         .then(res => {
            resolve(res.data)
         })
         .catch(() => {
            reject()
         })
   })
}



const STORAGE_NAME = {
   user: 'qr-manager-user',
   password: 'qr-manager-password',
   options      : {expires : 365, path : '/', SameSite : 'Strict'}
}

function setToken(username, password){
   VueCookie.set(STORAGE_NAME.user, username, STORAGE_NAME.options)
   VueCookie.set(STORAGE_NAME.password, password, STORAGE_NAME.options)
}

function removeToken(){
   VueCookie.delete(STORAGE_NAME.user)
   VueCookie.delete(STORAGE_NAME.password)
}

function getUserInfo(){
   if (hasLogined()){
      return JSON.parse(localStorage.getItem(STORAGE_NAME.user))
   } else {
      return {}
   }
}

function hasLogined(){
   let user = VueCookie.get(STORAGE_NAME.user)
   let password = VueCookie.get(STORAGE_NAME.password)
   let storageUser = localStorage.getItem(STORAGE_NAME.user)
   return !!(user && password && storageUser);
}



// 格式化时间，输出字符串
function dateFormatter(date, formatString) {
   formatString = formatString || 'yyyy-MM-dd hh:mm:ss';
   let dateRegArray = {
      "M+": date.getMonth() + 1,                      // 月份
      "d+": date.getDate(),                           // 日
      "h+": date.getHours(),                          // 小时
      "m+": date.getMinutes(),                        // 分
      "s+": date.getSeconds(),                        // 秒
      "q+": Math.floor((date.getMonth() + 3) / 3),    // 季度
      "S": date.getMilliseconds()                     // 毫秒
   };
   if (/(y+)/.test(formatString)) {
      formatString = formatString.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
   }
   for (let section in dateRegArray) {
      if (new RegExp("(" + section + ")").test(formatString)) {
         formatString = formatString.replace(RegExp.$1, (RegExp.$1.length === 1) ? (dateRegArray[section]) : (("00" + dateRegArray[section]).substr(("" + dateRegArray[section]).length)));
      }
   }
   return formatString;
}


export default {
   dateFormatter,
   URL,STORAGE_NAME,
   postData,
   getData,
   hasLogined,
   getUserInfo,
   setToken,
   removeToken,
   global
}
