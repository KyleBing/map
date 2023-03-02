import store from './store'
const AUTHORIZATION_NAME = 'Authorization' // 存储用户信息的 localStorage name，跟 Diary 通用

function downloadFile(fileName, data) { // 下载 base64 图片
   let aLink = document.createElement('a')
   let blob = new Blob([data]); //new Blob([content])
   let evt = document.createEvent("HTMLEvents")
   evt.initEvent("click", true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
   aLink.download = fileName
   aLink.href = URL.createObjectURL(blob)
   aLink.click()
}

// 设置 authorization
function setAuthorization(nickname, uid, email, phone, avatar, token, group_id, city, geolocation) {
   localStorage.setItem(AUTHORIZATION_NAME, JSON.stringify({
      nickname, uid, email, phone, avatar, token, group_id, city, geolocation
   }))
}

// 获取 authorization
function getAuthorization() {
   return JSON.parse(localStorage.getItem(AUTHORIZATION_NAME))
}

// 删除 authorization
function deleteAuthorization() {
   localStorage.removeItem(AUTHORIZATION_NAME)
}

function $(selector){
   return document.querySelector(selector)
}


// 格式化时间，输出字符串
function dateFormatter(date, formatString) {
   formatString = formatString || 'yyyy-MM-dd hh:mm:ss'
   let dateRegArray = {
      "M+": date.getMonth() + 1,                      // 月份
      "d+": date.getDate(),                           // 日
      "h+": date.getHours(),                          // 小时
      "m+": date.getMinutes(),                        // 分
      "s+": date.getSeconds(),                        // 秒
      "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
      "S": date.getMilliseconds()                     // 毫秒
   }
   if (/(y+)/.test(formatString)) {
      formatString = formatString.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length))
   }
   for (let section in dateRegArray) {
      if (new RegExp("(" + section + ")").test(formatString)) {
         formatString = formatString.replace(RegExp.$1, (RegExp.$1.length === 1) ? (dateRegArray[section]) : (("00" + dateRegArray[section]).substr(("" + dateRegArray[section]).length)))
      }
   }
   return formatString
}

function dateProcess(dateString) {
   let date = new Date(dateString)
   let year = date.getFullYear()
   let month = date.getMonth() + 1
   let day = date.getDate()
   let hour = date.getHours()
   let minutes = date.getMinutes()
   let seconds = date.getSeconds()
   let week = date.getDay()
   let timeLabel = ''
   if (hour >= 23 && hour < 24 || hour <= 3 && hour >= 0) {
      timeLabel = '深夜'
   } else if (hour >= 19 && hour < 23) {
      timeLabel = '晚上'
   } else if (hour >= 14 && hour < 19) {
      timeLabel = '傍晚'
   } else if (hour >= 11 && hour < 14) {
      timeLabel = '中午'
   } else if (hour >= 6 && hour < 11) {
      timeLabel = '早上'
   } else if (hour >= 3 && hour < 6) {
      timeLabel = '凌晨'
   }

   return {
      year: year,
      weekday: WEEKDAY[week],
      date:`${padNumberWith0(month)}月${padNumberWith0(day)}日`,
      dateFull: `${year}年${month}月${day}日`,
      dateFullSlash: `${year}/${month}/${day}`,
      timeLabel: timeLabel,
      time: `${padNumberWith0(hour)}:${padNumberWith0(minutes)}`
   }
}

export default {
   getAuthorization,
   setAuthorization,
   dateProcess,
   dateFormatter,
   deleteAuthorization,
   downloadFile
}
