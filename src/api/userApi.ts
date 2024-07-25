import {request} from "./request";

export default {
    login(requestData){return request('post', null, requestData, false, 'user/login')},
    register(requestData) {return request('post', {}, requestData, false, 'user/register')},
    add(requestData) {return request('post', {}, requestData, false, 'user/add')},
    delete(requestData) {return request('delete', {}, requestData, false, 'user/delete')},
    modify(requestData) {return request('put', {}, requestData, false, 'user/modify')},
    detail(params) {return request('get', params, null, false, 'user/detail')},
    list(requestData) {return request('post', null, requestData, false, 'user/list')},
    changePassword(requestData) {return request('put', null, requestData, false, 'user/change-password')},
}
