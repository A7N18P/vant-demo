<template>
  <div>
    <van-image :src="''" />

  </div>
</template>
<script setup lang="ts">
import { getCategoryFolder, getCategoryDetail } from '@/api'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { doRequest } from '@/api/sign'
const route = useRoute()




onMounted(async () => {
  const res = await doRequest()
  console.log(res)

})
</script>
