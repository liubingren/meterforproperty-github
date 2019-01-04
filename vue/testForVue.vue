<style lang="less" scoped>
    div {
        font-size: 50px;
        text-align: center;
        color:red;
        span{
        	color: blue;
        }
    }
</style>

<template>
  <div>hello {{text}} <span>ashkhahsk</span></div>
</template>

<script>
    export default {
        data() {
            return {
                text: 'mr.bing'
            }
        }
    }
</script>