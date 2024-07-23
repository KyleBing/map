import {request} from "./request";
import {ServerResponse} from "@/api/ServerResponse.ts";

export default {
    login(requestData: { email: string, password: string }): Promise<ServerResponse> {
        return request('post', null, requestData, false, null, 'user/login')
    },
    register(requestData: any) {return request('post', {}, requestData, false, null, 'user/register')},


    add(requestData: any) {return request('post', {}, requestData, false, null, 'user/add')},
    delete(requestData: any) {return request('delete', {}, requestData, false, null, 'user/delete')},
    modify(requestData: any) {return request('put', {}, requestData, false, null, 'user/modify')},
    detail(params: any) {return request('get', params, null, false, null, 'user/detail')},
    list(requestData: any) {return request('post', null, requestData, false, null, 'user/list')},
    changePassword(requestData: any) {return request('put', null, requestData, false, null, 'user/change-password')},
}
