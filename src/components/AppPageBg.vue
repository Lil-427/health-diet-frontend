<template>
  <div class="page-bg min-h-full p-8 text-[#333] relative overflow-hidden">
    <div class="absolute top-[-8%] right-[-3%] w-[400px] h-[400px] bg-green-200/20 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute bottom-[5%] left-[5%] w-[350px] h-[350px] bg-blue-100/25 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="relative z-10 h-full flex flex-col">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-bg {
  background: linear-gradient(135deg, #f6f8fb 0%, #edf1f7 50%, #f0f4f8 100%);
}
</style>
