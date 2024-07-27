import {thumbnail1000_suffix, thumbnail1500_suffix} from "../mapConfig";

/**
 * 生成 Marker.note
 * @param note
 * @param img
 * @param type
 * @param name
 * @param index
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
export {
    generateMarkerContent
}
