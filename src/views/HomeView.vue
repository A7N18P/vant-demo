<script setup lang="ts">
import { getCategoryList } from '@/api'
import { onMounted, ref } from 'vue'

const categoryList = ref([])
onMounted(async () => {
  const res = await getCategoryList()
  categoryList.value = res.data
})
</script>

<template>
  <div style="background-color: #f0f0f0">
    <!-- <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" /> -->
    <div class="wrapper">
      <nav>
        <RouterLink
          v-for="item in categoryList"
          :to="{ name: 'folder', query: { id: item.id } }"
          :key="item.id"
          >{{ item.title }}</RouterLink
        >
      </nav>
    </div>
  </div>
</template>
<style scoped></style>
