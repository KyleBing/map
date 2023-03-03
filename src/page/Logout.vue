<template>

</template>

<script>
export default {
    name: "Logout",
    mounted() {
        this.$utility.deleteAuthorization()
        this.$router.push({name: 'Login'})
    }
}
</script>

<style scoped>

</style>
