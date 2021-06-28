import utility from "../utility"

export function list(){
    return utility.getData(
        '/api', 
        {
            type:'query',
            table: 'characters'
        }
    )
}

export function modifyItem(){
    return utility.postData(
        '/api', 
        {
            type:'query',
            table: 'characters'
        }
    )
}