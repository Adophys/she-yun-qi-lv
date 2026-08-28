<template>
  <view class="container">
    <view class="header">
      <text class="title">章节探索</text>
      <text class="subtitle">完成关卡解锁下一节点</text>
    </view>

    <!-- 本地拼图库：static/albums 自动生成 -->
    <view class="puzzle-lib" v-if="albums.length > 0">
      <view class="puzzle-lib-head">
        <text class="puzzle-lib-title">🧩 凤凰拼图库</text>
        <text class="puzzle-lib-sub">{{ albums.length }} 张图片</text>
      </view>
      <scroll-view class="puzzle-scroll" scroll-x>
        <view class="puzzle-row">
          <view
            class="puzzle-card"
            v-for="album in albums"
            :key="album.id"
            @click="startLocalPuzzle(album)"
          >
            <image class="puzzle-thumb" :src="album.image" mode="aspectFill" />
            <text class="puzzle-name">{{ album.name }}</text>
            <text class="puzzle-pieces">{{ album.pieces === 16 ? '4x4' : '3x3' }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <view v-else-if="chapters.length === 0" class="empty">
      <text>暂无探索内容，敬请期待</text>
    </view>

    <view v-else class="chapter" v-for="chapter in chapters" :key="chapter.chapterId">
      <view class="chapter-head">
        <text class="chapter-name">{{ chapter.chapterName }}</text>
        <text class="chapter-progress">{{ chapter.completed }}/{{ chapter.total }}</text>
      </view>
      <view class="node" v-for="node in chapter.nodes" :key="node.id" @click="startNode(node)">
        <view class="node-left">
          <view class="node-icon" :class="node.status">
            <text>{{ statusIcon(node.status) }}</text>
          </view>
          <view class="node-info">
            <text class="node-name">{{ node.name }}</text>
            <text class="node-location" v-if="node.location">{{ node.location }}</text>
          </view>
        </view>
        <view class="node-status" :class="node.status">
          <text>{{ statusText(node.status) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getExploreNodes } from '@/api/explore'
import { ROUTE_PATHS } from '@/router/routes'
import { requireLogin } from '@/utils/login'
import albums from '@/config/albums.json'

const nodes = ref([])
const loading = ref(false)

const chapters = computed(() => {
  const map = {}
  for (const node of nodes.value) {
    const key = node.chapterId || 'default'
    if (!map[key]) {
      map[key] = {
        chapterId: key,
        chapterName: node.chapterName || '默认章节',
        completed: 0,
        total: 0,
        nodes: [],
      }
    }
    const group = map[key]
    group.total += 1
    if (node.status === 'completed') group.completed += 1
    group.nodes.push(node)
  }
  return Object.values(map)
})

function statusText(status) {
  if (status === 'completed') return '已完成'
  if (status === 'active') return '进行中'
  return '未解锁'
}

function statusIcon(status) {
  if (status === 'completed') return '✓'
  if (status === 'active') return '▶'
  return '🔒'
}

async function loadNodes() {
  if (!requireLogin()) return
  loading.value = true
  try {
    const raw = await getExploreNodes()
    // 解锁链归一化：第一个未完成节点为 active，其余为 locked（完成后自动解锁下一关）
    let firstIncomplete = true
    nodes.value = raw.map((n) => {
      if (n.status === 'completed') return n
      if (firstIncomplete) {
        firstIncomplete = false
        n.status = 'active'
        return n
      }
      n.status = 'locked'
      return n
    })
  } catch (error) {
    console.error('load explore nodes failed', error)
  } finally {
    loading.value = false
  }
}

function startNode(node) {
  if (node.status === 'locked') {
    uni.showToast({ title: '完成前一关卡后解锁', icon: 'none' })
    return
  }
  uni.navigateTo({ url: `${ROUTE_PATHS.PUZZLE}?id=${node.id}` })
}

function startLocalPuzzle(album) {
  uni.navigateTo({ url: `${ROUTE_PATHS.PUZZLE}?id=${album.id}` })
}

onShow(() => {
  loadNodes()
})
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
  background: $color-bg;
  min-height: 100vh;
}

.header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.title {
  font-size: 40rpx;
  font-weight: 700;
}

.subtitle {
  font-size: 24rpx;
  color: $color-text-secondary;
}

.puzzle-lib {
  margin-top: 32rpx;
  background: $color-surface;
  border-radius: 24rpx;
  padding: 24rpx;
}

.puzzle-lib-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.puzzle-lib-title {
  font-size: 30rpx;
  font-weight: 700;
}

.puzzle-lib-sub {
  font-size: 24rpx;
  color: $color-text-secondary;
}

.puzzle-scroll {
  white-space: nowrap;
}

.puzzle-row {
  display: inline-flex;
  gap: 16rpx;
}

.puzzle-card {
  width: 200rpx;
  background: $color-bg;
  border-radius: 16rpx;
  overflow: hidden;
  display: inline-block;
  position: relative;
}

.puzzle-thumb {
  width: 200rpx;
  height: 160rpx;
  display: block;
  background: #F1EFEC;
}

.puzzle-name {
  display: block;
  padding: 10rpx 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.puzzle-pieces {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  font-size: 20rpx;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  padding: 2rpx 12rpx;
  border-radius: 12rpx;
}

.loading,
.empty {
  margin-top: 120rpx;
  text-align: center;
  color: $color-text-secondary;
}

.chapter {
  margin-top: 40rpx;
}

.chapter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.chapter-name {
  font-size: 30rpx;
  font-weight: 700;
}

.chapter-progress {
  font-size: 26rpx;
  color: $color-text-secondary;
}

.node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20rpx 0;
  padding: 28rpx;
  border-radius: 24rpx;
  background: $color-surface;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.node-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.node-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $color-border;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
}

.node-icon.completed {
  background: #E8F5E9;
}

.node-icon.active {
  background: #FFF3E0;
}

.node-icon.locked {
  background: #F1EFEC;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-name {
  font-size: 30rpx;
  font-weight: 600;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-location {
  display: block;
  font-size: 24rpx;
  color: $color-text-secondary;
  margin-top: 4rpx;
}

.node-status {
  font-size: 24rpx;
  color: $color-text-secondary;
  margin-left: 16rpx;
}

.node-status.completed {
  color: #16A34A;
}

.node-status.active {
  color: #B8860B;
}

.node-status.locked {
  color: #9CA3AF;
}
</style>

