<script setup lang="ts">

import {ref} from "vue";
import axios from "axios";
import {key_service} from "@/mapConfig.ts";

const emit = defineEmits(['chooseLocation'])

interface GaodeMapGeo{
    "formatted_address":  string, // "山东省济南市",
    "country": string, // "中国",
    "province": string, // "山东省",
    "citycode": string, // "0531",
    "city": string, // "济南市",
    "district": [],
    "township": [],
    "neighborhood": {
        "name": [],
        "type": []
    },
    "building": {
        "name": [],
        "type": []
    },
    "adcode": string, // "370100",
    "street": [],
    "number": [],
    "location": string, // "117.120128,36.652069",
    "level": string, // "市"
}

/**
 * SEARCH
 */
const searchAddress = ref('')  // 地址搜索关键字
const searchResultList = ref<Array<GaodeMapGeo>>([])
function search() {
    const url = 'https://restapi.amap.com/v3/geocode/geo'
    axios({
        url,
        method: 'get',
        params: {
            key: key_service,
            address: searchAddress.value
        }
    })
        .then(response => {
            isShowResultPanel.value = true
            let res = response.data
            searchResultList.value = res.geocodes
        })
}

function selectLocation(row: GaodeMapGeo){
    emit('chooseLocation', {
        name: row.formatted_address,
        location: row.location.split(',').map(item => Number(item)),
        keyword: searchAddress.value
    })
}

const isShowResultPanel = ref(true)

</script>

<template>
    <!-- 搜索面板 -->
    <div class="search-panel card mb-1">
        <ElForm inline @submit="search" size="small">
            <ElFormItem class="mb-0" label="搜索地址">
                <ElInput style="width: 180px" placeholder="输入较完整的地址" @keydown.enter="search" v-model="searchAddress"></ElInput>
            </ElFormItem>
            <ElFormItem class="mb-0 mr-0" label="">
                <ElButton type="primary" @click="search" icon="Search">搜索</ElButton>
                <ElButton type="info" @click="isShowResultPanel = !isShowResultPanel" icon="Sort">折叠搜索结果</ElButton>
            </ElFormItem>
        </ElForm>
    </div>

    <!-- 搜索结果面板 -->
    <div class="result card mt-1 mb-1" v-if="searchResultList && isShowResultPanel">
        <ElTable size="small" :data="searchResultList" @row-click="selectLocation">
            <ElTableColumn label="名字" prop="formatted_address"></ElTableColumn>
            <ElTableColumn label="类别" prop="level" width="80" align="center"></ElTableColumn>
            <ElTableColumn label="坐标" prop="location" width="150"></ElTableColumn>
        </ElTable>
    </div>
</template>

