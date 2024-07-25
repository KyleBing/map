import {request} from './request'
export default {
    add( requestData){return request('post', null, requestData, false, 'map-pointer/add')},
    list(requestData){return request('post', null, requestData, false,'map-pointer/list')},
    modify(requestData){return request('put', null, requestData, false, 'map-pointer/modify')},
    delete(requestData){return request('delete', null, requestData, false, 'map-pointer/delete')},
    detail(params){return request('get', params, null, false, 'map-pointer/detail')},
}
