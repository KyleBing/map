import axios from "axios";
import {getAuthorization} from "@/utility";
import {ServerResponse} from "@/api/ServerResponse.ts";
import {ElLoading, ElMessage} from "element-plus";


const LOADING_OPTION = {
    lock: true,
    text: "载入中，请稍候...",
    background: "rgba(0, 0, 0, 0.3)"
}

const BASE_URL: string = process.env.NODE_ENV === 'development' ? '/dev/' : 'http://kylebing.cn/portal/' // 生产环境时是 ../portal

function request(
    method: 'get' | 'post' | 'put' | 'delete',
    params: any,
    requestData: any,
    showLoading = false,
    url: string
): Promise<ServerResponse> {
    let layerLoading = null
    if (showLoading) layerLoading = ElLoading.service(LOADING_OPTION)

    let headers = {}
    /*
    * 所有 requestData 都会自动添加  authorization 信息
    * 给 requestData 添加 authorization 内部的数据： username email uid 等等
    * */
    if (url !== 'user/Login' && url !== 'user/Register') { // 注册和登录时不添加 Token 数据
        Object.assign(headers, {
            'Diary-Token': getAuthorization() && getAuthorization().token,
            'Diary-Uid': getAuthorization() && getAuthorization().uid
        })
    }

    return new Promise((resolve, reject) => {
        axios({
            url: BASE_URL + url,
            method,
            data: requestData,
            params,
            headers,
            withCredentials: true
        })
            .then(res => {
                if (showLoading && layerLoading) layerLoading.close()
                if (res.status === 200) {
                    if (res.data.success) {
                        resolve(res.data)
                    } else {
                        ElMessage.error({
                            message: res.data.message || 'Error'
                        })
                        reject(res.data)
                    }
                } else {
                    reject(res.data)
                    console.log('request err: ', res.data) // 如果演示模式，不用显示网络请求错误
                }
            })
            .catch(err => {
                if (showLoading && layerLoading) layerLoading.close()
                ElMessage.error({
                    message: err.message
                })
                console.log(err, err.message)
                reject(err)
            })
    })
}


export {
    request
}
