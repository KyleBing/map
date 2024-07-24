import {request} from "./request";

export default {
    login(requestData: { email: string, password: string }) {
        return request('post', null, requestData, false, 'user/login')
    },
    register(requestData: any) {return request('post', {}, requestData, false, 'user/register')},


    add(requestData: any) {return request('post', {}, requestData, false, 'user/add')},
    delete(requestData: any) {return request('delete', {}, requestData, false, 'user/delete')},
    modify(requestData: any) {return request('put', {}, requestData, false, 'user/modify')},
    detail(params: any) {return request('get', params, null, false, 'user/detail')},
    list(requestData: any) {return request('post', null, requestData, false, 'user/list')},
    changePassword(requestData: any) {return request('put', null, requestData, false, 'user/change-password')},
}
