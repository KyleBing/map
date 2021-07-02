// note 字段中，使用 `|` 来作为 html 中的换行符

const LINES = [
    {
        name: '金刚纂路',
        area: '南部山区',
        note: '金刚纂路是一条比较曲折的山路，平坦，注意拐弯不可见的地方鸣笛示意',
        roadType: '柏油路',
        months: '春，夏，秋',
        paths: [
            {position: [117.111285, 36.658996], name: '奥体西', note: ''},
            {position: [117.119066, 36.647191], name: '龙洞立交桥', note: ''},
            {position: [117.126721, 36.647561], name: '旅游路', note: ''},
            {position: [117.177737, 36.639391], name: '港九路', note: ''},
            {position: [117.178289, 36.623558], name: '滩九线', note: ''},
            {position: [117.1682, 36.547592], name: '南山牧场', note: '这段路最高的地方，峰顶'},
            {position: [117.159948, 36.513836], name: '村庄', note: '路边很多卖水果的，|很多采摘的地方，|5-6 月份有樱桃，|之后有杏什么的'},
            {position: [117.152763, 36.505393], name: '小桥', note: ''}
        ]
    },
    {
        name: '潘洪路',
        area: '南部山区',
        note: '上面的路会比较险，落差比较大',
        roadType: '柏油路',
        months: '春，夏，秋',
        paths: [
            {position: [117.164021, 36.529783], name: '潘洪路起点', note: ''},
            {position: [117.155944, 36.531921], name: '村庄', note: ''},
            {position: [117.151137, 36.534041], name: '村庄', note: ''},
            {position: [117.151749, 36.537283], name: '北裕山路', note: ''},
            {position: [117.148525, 36.541463], name: '建议终点', note: '往北是水泥路'},
        ]
    },
    {
        name: '光华大道',
        area: '华山风景区',
        note: '很平缓的一段路，也能沿途看点风景，两边的树挺好的，途经居民区的时候注意减速',
        roadType: '柏油路',
        months: '春，夏，秋，冬',
        paths: [
            {position: [117.075955,36.718342], name: '起点', note: ''},
            {position: [117.089677,36.733301], name: '旁边山坡不错', note: ''},
            {position: [117.087709,36.738589], name: '途经点', note: ''},
            {position: [117.078358,36.739405], name: '途经点', note: ''},
            {position: [117.065656,36.716442], name: '途经点', note: ''},
            {position: [117.06926,36.71722], name: '景区南门', note: ''},
            {position: [117.074283,36.718502], name: '终点', note: ''},
        ]
    },
    {
        name: '黄河乡道',
        area: '黄河',
        note: '路两边是紫叶李，春天的时候开白花，夏末的时候，树下会有长草，很棒，还能看到黄河堤坝',
        roadType: '柏油路',
        months: '春，夏，秋',
        paths: [
            {position: [117.039897,36.746698], name: '起点', note: ''},
            {position: [117.08462,36.774927], name: '付家钓鱼', note: ''},
            {position: [117.10125,36.782954], name: '途经点', note: ''},
            {position: [117.123534,36.798376], name: '途经点', note: ''},
            {position: [117.151922,36.835841], name: '途经点', note: ''},
            {position: [117.171894,36.862967], name: '途经点', note: ''},
            {position: [117.18833,36.90988], name: '终点', note: '可以接着往北走'},
        ]
    },
    {
        name: '黄河大坝附近',
        area: '黄河',
        note: '春天的时候特别好看，两边的紫叶李都开花了，白色的一片，加上左边的蓝色小湖面，甚是好看',
        roadType: '柏油路',
        months: '春',
        paths: [
            {position: [116.867337,36.647036], name: '起点', note: ''},
            {position: [116.836749,36.66289], name: '途经点', note: ''},
            {position: [116.828134,36.661488], name: '途经点', note: ''},
            {position: [116.825452,36.674233], name: '美景开始', note: '从此处沿这个小湖走，相当好看，|春天的时候两边都是开花的紫叶李'},
            {position: [116.831063,36.676478], name: '相当好看', note: ''},
            {position: [116.805217,36.698194], name: '终点', note: ''},
        ]
    },
    {
        name: '经十路',
        area: '济南市',
        note: '济南摩托车友最喜欢的一条路，辅路好走',
        roadType: '柏油路',
        months: '春、夏、秋、冬',
        paths: [
            {position: [117.52971,36.674825], name: '章丘区', note: ''},
            {position: [117.451066,36.670276], name: '圣井立交', note: ''},
            {position: [117.292493,36.665083], name: '孙村立交', note: ''},
            {position: [117.254167,36.665506], name: '经十东路', note: ''},
            {position: [117.226492,36.670729], name: '港西立交', note: ''},
            {position: [117.209116,36.673922], name: '邢村立交', note: ''},
            {position: [117.19562,36.67307], name: '融创茂', note: ''},
            {position: [117.146845,36.662953], name: '汉峪金谷', note: ''},
            {position: [117.120165,36.660012], name: '奥体中心', note: ''},
            {position: [117.100743,36.657516], name: '万象城', note: ''},
            {position: [117.071582,36.651508], name: '燕山立交', note: ''},
            {position: [117.010074,36.648612], name: '山东体育中心', note: ''},
            {position: [117.010074,36.648612], name: '八一立交', note: '建议走中间路，|走辅路还需要转两个弯'},
            {position: [116.963553,36.648868], name: '腊山立交', note: ''},
            {position: [116.889495,36.65012], name: '济西立交桥', note: ''},
            {position: [116.874072,36.647787], name: '经十西路', note: ''},
            {position: [116.842528,36.638568], name: '湿地公园', note: ''},
            {position: [116.758929,36.5676874], name: '长清区', note: ''},
        ]
    }
]
const COLORS = {
    green: "#4CD964",
    syan: "#5AC8FA",
    blue: "#007AFF",
    purple: "#5856D6",
    magenta: "#FF2D70",
    red: "#FF3B30",
    orange: "#FF9500",
    yellow: "#FFCC00",
    gray: "#8E8E93",
}
export default {
    COLORS, LINES
}