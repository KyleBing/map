import {thumbnail1000_suffix, thumbnail1500_suffix} from "../mapConfig";

/**
 * 生成 Marker.note
 * @param note 注释
 * @param img 图片链接
 * @param type 类别：颜色
 * @param name 标题
 * @param index 序号
 */
function generateMarkerContent(
    name: string,
    note?: string,
    img?: string,
    type?: string,
    index?: number
) {
    if (img && note){
        return `
               <div class="marker ${type}">
                  <div class="marker-index">
                       <div class="index ${isNaN(Number(index))? 'hidden': ''}">${index! + 1}</div>
                      <div class="title">${name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note">${note.replace(/\n/g, '<br>')}</div>
                       <div class="view">
                           <a target="_blank" href="${img + '-' + thumbnail1500_suffix}">
                              <img src="${img + '-' + thumbnail1000_suffix}" alt="view">
                           </a>
                       </div>
                  </div>
               </div>`
    } else if (img) {
        return `
               <div class="marker ${type}">
                  <div class="marker-index">
                       <div class="index ${isNaN(Number(index))? 'hidden': ''}">${index! + 1}</div>
                      <div class="title">${name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="view">
                           <a target="_blank" href="${img + '-' + thumbnail1500_suffix}">
                              <img src="${img + '-' + thumbnail1000_suffix}" alt="view">
                           </a>
                       </div>
                  </div>
               </div>`
    } else if (note){
        return `
               <div class="marker ${type}">
                  <div class="marker-index">
                       <div class="index ${isNaN(Number(index))? 'hidden': ''}">${index! + 1}</div>
                      <div class="title">${name}</div>
                  </div>
                  <div class="marker-content">
                       <div class="note">${note.replace(/\n/g, '<br>')}</div>
                  </div>
               </div>`
    } else {
        return `
               <div class="marker no-content ${type}">
                  <div class="marker-index">
                       <div class="index ${isNaN(Number(index))? 'hidden': ''}">${index! + 1}</div>
                      <div class="title">${name}</div>
                  </div>
               </div>`
    }
}


/**
 * 获取区域对角线的两点坐标，即这个区域内的最小坐标值和最大坐标值
 *
 * @return Array {min:number[a,b], max:number[c,d]}
 * @param pointerArray
 */
function getMaxBoundsPointer(pointerArray: Array<[number, number]>): {min: [number,number], max: [number,number]} {
    let lngArray = pointerArray.map(item => item[0])
    let latArray = pointerArray.map(item => item[1])

    return {
        min: [Math.min(...lngArray), Math.min(...latArray)],
        max: [Math.max(...lngArray), Math.max(...latArray)],
    }
}


export {
    generateMarkerContent,
    getMaxBoundsPointer
}
