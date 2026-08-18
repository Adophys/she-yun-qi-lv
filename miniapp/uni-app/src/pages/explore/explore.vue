<template>
  <view class="container">
    <text class="title">章节探索</text>
    <view class="map">
      <view
        v-for="node in nodes"
        :key="node.id"
        class="node"
        :class="node.status"
        @click="startChallenge(node)"
      >
        <text>{{ node.name }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

const nodes = reactive([
  { id: '1', name: '青靛绣坊', status: 'completed' },
  { id: '2', name: '凤凰装', status: 'active' },
  { id: '3', name: '花斗笠', status: 'locked' },
])

function startChallenge(node) {
  if (node.status === 'locked') return
  uni.navigateTo({ url: '/pages/puzzle/puzzle?id=' + node.id })
}
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
  background: $color-bg;
  min-height: 100vh;
}

.title {
  font-size: 40rpx;
  font-weight: 700;
}

.map {
  margin-top: 48rpx;
}

.node {
  margin: 32rpx 0;
  padding: 32rpx;
  border-radius: 24rpx;
  background: $color-surface;
  text-align: center;
}

.node.completed {
  background: #E8F5E9;
}

.node.active {
  background: #FFF3E0;
}

.node.locked {
  opacity: 0.5;
}
</style>
