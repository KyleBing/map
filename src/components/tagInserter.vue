<template>
    <div class="tag-inserter">
        <el-tag
            :key="tag"
            v-for="tag in tags"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)">
            {{tag}}
        </el-tag>
        <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
        >
        </el-input>
        <el-button v-else class="button-new-tag" size="small" @click="showInput">{{ label }}</el-button>
    </div>
</template>
<script>
export default {
    name: 'tagInsert',
    props: {
        tags: {
            type: Array,
            required: true
        },
        label: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            inputVisible: false,
            inputValue: ''
        };
    },
    methods: {
        handleClose(tag) {
            this.tags.splice(this.tags.indexOf(tag), 1);
        },

        showInput() {
            this.inputVisible = true;
            this.$nextTick(() => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },

        handleInputConfirm() {
            let inputValue = this.inputValue;
            if (inputValue) {
                this.tags.push(inputValue);
            }
            this.inputVisible = false;
            this.inputValue = '';
        }
    }
}
</script>



<style>
.el-tag + .el-tag {
    margin-left: 10px;
}
.button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
}
.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
}
</style>
