<script setup lang="ts">
import { getFolderList } from '@/api'
import { onMounted, ref } from 'vue'

const props = defineProps<{
  id: number
}>()
const dataSource = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

async function getList(id: number) {
  const res = await getFolderList(id)
  return Promise.resolve(res.data || [])
}

const onLoad = async () => {
  if (refreshing.value) {
    dataSource.value = []
    refreshing.value = false
  }
  const list = await getList(props.id)
  dataSource.value = dataSource.value.concat(list)

  loading.value = false

  if (dataSource.value.length >= 100) {
    finished.value = true
  }
}

const onRefresh = () => {
  // 清空列表数据
  finished.value = false

  // 重新加载数据
  // 将 loading 设置为 true，表示处于加载状态
  loading.value = true
  onLoad()
}
onMounted(async () => {
  const list = await getList(props.id)
  dataSource.value = dataSource.value.concat(list)
})
</script>

<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      :immediate-check="false"
      @load="onLoad"
    >
      <div v-for="item in dataSource" :key="item.id">
        <van-space>
          <van-image v-lazyload :src="item.coverUrl" />
        </van-space>
      </div>
    </van-list>
  </van-pull-refresh>
</template>
<style scoped></style>
