import axios from "axios";
import { Loading, Message } from 'element-ui'
import utility from "@/utility";


const LOADING_OPTION = {
    lock: true,
    text: "载入中，请稍候...",
    background: "rgba(0, 0, 0, 0.7)"
}

const BASE_URL = process.env.NODE_ENV === 'development' ? '': '../../portal/' // 生产环境时是 ../portal


function request(method, params, requestData, showLoading = false, cancelToken, url) {
    let layerLoading
    if (showLoading) layerLoading = Loading.service(LOADING_OPTION)

    let headers = {}
    /*
    * 所有 requestData 都会自动添加  authorization 信息
    * 给 requestData 添加 authorization 内部的数据： username email uid 等等
    * */
    if (url !== 'user/Login' && url !== 'user/Register'){ // 注册和登录时不添加 Token 数据
        Object.assign(headers, {
            'Diary-Token':  utility.getAuthorization() && utility.getAuthorization().token
        })
    }

    return new Promise((resolve, reject) => {
        axios({
            url: BASE_URL + url,
            method,
            cancelToken,
            data: requestData,
            params,
            headers,
            withCredentials: true
        })
            .then(res => {
                if (showLoading) layerLoading.close()
                if (res.status === 200) {
                    if (res.data.success){
                        resolve(res.data)
                    } else {
                        Message.error({
                            message: res.data.message || 'Error'
                        })
                        reject(res.data)
                    }
                } else {
                    console.log('request err: ', res.data) // 如果演示模式，不用显示网络请求错误
                }
            })
            .catch(err => {
                reject(err)
                if (showLoading) layerLoading.close()
                Message.error({
                    message: err.message
                })
                console.log(err, err.message)
            })
    })
}


export default request
