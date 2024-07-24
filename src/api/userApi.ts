import {request} from "@/api/request.ts";

function userLogin(requestData: { email: string, password: string }) {return request('post', null, requestData, false, 'user/login')}
function userRegister(requestData: any) {return request('post', {}, requestData, false, 'user/register')}
function userAdd(requestData: any) {return request('post', {}, requestData, false, 'user/add')}
function userDelete(requestData: any) {return request('delete', {}, requestData, false, 'user/delete')}
function userModify(requestData: any) {return request('put', {}, requestData, false, 'user/modify')}
function userDetail(params: any) {return request('get', params, null, false, 'user/detail')}
function userList(requestData: any) {return request('post', null, requestData, false, 'user/list')}
function userChangePassword(requestData: any) {return request('put', null, requestData, false, 'user/change-password')}

export {
    userLogin,
    userRegister,
    userAdd,
    userDelete,
    userModify,
    userDetail,
    userList,
    userChangePassword,
}
