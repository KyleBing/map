<template>
    <router-view/>
</template>

<script>
import {mapMutations} from "vuex";

export default {
    name: 'App',
    mounted() {
        this.SET_AUTHORIZATION(this.$utility.getAuthorization())
    },
    methods: {
        ...mapMutations(['SET_AUTHORIZATION'])
    }
}


</script>

<style lang="scss">
@import "./scss/main";
</style>
