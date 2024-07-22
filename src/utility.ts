const AUTHORIZATION_NAME = 'Authorization' // 存储用户信息的 localStorage name，跟 Diary 通用

// 设置 authorization
function setAuthorization(nickname: string, uid: number, email: string, phone: string, avatar: string, token: string, group_id: number, city: string, geolocation: string) {
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


// CONST
enum EnumWeekDay {
   '周日' = 0,
   '周一',
   '周二',
   '周三',
   '周四',
   '周五',
   '周六',
}

enum EnumWeekDayShort {
   '日' = 0,
   '一',
   '二',
   '三',
   '四',
   '五',
   '六',
}

// 格式化时间，输出字符串
function dateFormatter(date: Date, formatString: string = 'yyyy-MM-dd hh:mm:ss') {
   let dateRegArray: Object = {
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

interface DateUtilityObject{
   year: number,
   day: number,
   month: number,
   weekday: string,
   weekShort: string,
   dateShort: string,
   date: string,
   dateFull: string,
   dateFullSlash: string,
   timeLabel: string,
   time: string
}

function dateProcess(dateString: string): DateUtilityObject {
   let date = new Date(dateString)
   let year = date.getFullYear()
   let month = date.getMonth() + 1
   let day = date.getDate()
   let hour = date.getHours()
   let minutes = date.getMinutes()
   // let seconds = date.getSeconds()
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
      year,
      day,
      month,
      weekday: EnumWeekDay[week],
      weekShort: EnumWeekDayShort[week],
      dateShort: `${padNumberWith0(month)}-${padNumberWith0(day)}`,
      date: `${padNumberWith0(month)}月${padNumberWith0(day)}日`,
      dateFull: `${year}年${month}月${day}日`,
      dateFullSlash: `${year}/${month}/${day}`,
      timeLabel: timeLabel,
      time: `${padNumberWith0(hour)}:${padNumberWith0(minutes)}`
   }
}

function padNumberWith0(num: number) {
   return String(num).padStart(2, '0')
}


export {
   getAuthorization,
   setAuthorization,
   dateProcess,
   dateFormatter,
   deleteAuthorization
}
