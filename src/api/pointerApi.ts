import {request} from './request'

function pointerAdd( requestData){return request('post', null, requestData, false, 'map-pointer/add')}
function pointerList(requestData){return request('post', null, requestData, false,'map-pointer/list')}
function pointerModify(requestData){return request('put', null, requestData, false, 'map-pointer/modify')}
function pointerDelete(requestData){return request('delete', null, requestData, false, 'map-pointer/delete')}
function pointerDetail(params){return request('get', params, null, false, 'map-pointer/detail')}
export default {
    pointerAdd,
    pointerList,
    pointerModify,
    pointerDelete,
    pointerDetail,
}
