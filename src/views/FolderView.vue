<template>
  <div>
    <van-image :src="detailInfo?.coverUrl || ''" />
    <h3 style="text-align: center">{{ detailInfo?.title }}</h3>
    <van-tabs v-model:active="activeId">
      <van-tab v-for="item in categoryList" :title="item.title" :key="item.id">
        <List :id="item.id" />
      </van-tab>
    </van-tabs>
  </div>
</template>
<script setup lang="ts">
import { getCategoryFolder, getCategoryDetail } from '@/api'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import List from './List.vue'
const route = useRoute()

const detailInfo = ref({})
const categoryList = ref([])
const activeId = ref(0)

async function getCategoryList(id: number) {
  const res = await getCategoryFolder(id)
  categoryList.value = res.data
  activeId.value = res.data[0].id
}
async function getDetailInfo(id: number) {
  const res = await getCategoryDetail(id)
  detailInfo.value = res.data
  getCategoryList(res.data.id)
}

onMounted(async () => {
  getDetailInfo(route.query.id as string)
})
</script>
