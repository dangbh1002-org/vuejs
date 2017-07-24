<template>

  <div>
    <div>Product detail for: {{id}}  </div>

    <router-link :to="'/product-detail/' + id + '/size'">Size</router-link>
    <router-link :to="'/product-detail/' + id + '/color/blue'">Blue color</router-link>
    <router-link :to="'/product-detail/' + id + '/color/red'">Red color</router-link>

    <br> <router-view></router-view>
  </div>


</template>

<script>
  export default {
    props: ['id'],
    data() {
      return {

      }
    },
    methods: {
      routeTo(){

      }
    }
  }

</script>

<style lang="stylus">

</style>
