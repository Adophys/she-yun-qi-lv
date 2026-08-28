<template>
  <view class="container">
    <view class="header">
      <view>
        <text class="title">{{ node.name || '凤凰拼图' }}</text>
        <text class="subtitle" v-if="node.location">{{ node.location }}</text>
        <text class="subtitle" v-else>移动碎片，还原完整照片</text>
      </view>
      <text class="moves">步数 {{ moves }}</text>
    </view>

    <!-- 拼图棋盘：每块显示照片的对应切片 -->
    <view
      class="puzzle-board"
      :style="{
        width: boardSize + 'rpx',
        height: boardSize + 'rpx',
        gridTemplateColumns: 'repeat(' + size + ', 1fr)',
      }"
    >
      <view
        v-for="(tile, index) in board"
        :key="index"
        class="puzzle-tile"
        :class="{ blank: tile === 0 }"
        @click="tapTile(index)"
      >
        <image
          v-if="tile !== 0 && node.puzzleImageUrl"
          class="tile-img"
          :src="node.puzzleImageUrl"
          :style="tileImageStyle(tile)"
          mode="scaleToFill"
        />
      </view>
    </view>

    <view class="actions">
      <button class="action-btn" @click="showPreview = true">查看原图</button>
      <button class="action-btn" @click="shuffleBoard">重新开始</button>
    </view>
    <text class="hint">点击与空白相邻的碎片移动，拼回完整照片</text>

    <!-- 原图预览 -->
    <view class="mask" v-if="showPreview" @click="showPreview = false">
      <view class="preview-card" @click.stop>
        <image class="preview-img" :src="node.puzzleImageUrl" mode="aspectFit" />
        <text class="preview-name">{{ node.name }}</text>
        <button class="preview-btn" @click="showPreview = false">关闭</button>
      </view>
    </view>

    <!-- 完成弹窗：展示原图 + 奖励 -->
    <view class="mask" v-if="showResult">
      <view class="result-card">
        <text class="result-title">🎉 拼图完成！</text>
        <image class="result-img" :src="node.puzzleImageUrl" mode="aspectFit" />
        <text class="result-name">{{ node.name }}</text>
        <text class="result-points" v-if="result.gainedPoints > 0">+{{ result.gainedPoints }} 积分</text>
        <text class="result-fragment" v-if="result.gainedFragment">碎片奖励：{{ result.gainedFragment }}</text>
        <text class="result-local" v-if="node.isLocal">本地拼图挑战成功！</text>
        <button class="result-btn" @click="finish">完成</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getExploreNode, completeExploreNode } from '@/api/explore'
import { friendlyMessage } from '@/api/errors'
import albums from '@/config/albums.json'

const node = ref({})
const size = ref(3)
const board = ref([])
const moves = ref(0)
const showResult = ref(false)
const showPreview = ref(false)
const result = ref({})

const boardSize = computed(() => size.value * 220)

onLoad(async (query) => {
  const id = (query && query.id) || ''
  // 1) 本地图库拼图：id 命中 static/albums 自动生成的清单
  const album = albums.find((a) => a.id === id)
  if (album) {
    node.value = {
      id: album.id,
      name: album.name,
      puzzleImageUrl: album.image,
      puzzlePieces: album.pieces,
      isLocal: true,
    }
    size.value = album.pieces >= 16 ? 4 : 3
    shuffleBoard()
    return
  }
  // 2) 后端探索节点拼图
  if (!id) {
    uni.showToast({ title: '参数错误', icon: 'none' })
    size.value = 3
    shuffleBoard()
    return
  }
  try {
    const data = await getExploreNode(id)
    node.value = data || {}
    // 后端未配置拼图图时，按节点名称关键词自动匹配收藏图（如 凤凰装展区→凤凰装、非遗工坊→乌米饭、歌会→畲绣）
    if (!node.value.puzzleImageUrl) {
      node.value.puzzleImageUrl = resolvePuzzleImage(node.value.name || '')
    }
    size.value = data && data.puzzlePieces && data.puzzlePieces >= 16 ? 4 : 3
  } catch (error) {
    uni.showToast({ title: friendlyMessage(error, '加载关卡失败'), icon: 'none' })
    size.value = 3
  }
  shuffleBoard()
})

/** 按节点名称关键词匹配收藏图片，匹配不到则用第一张收藏图兜底 */
function resolvePuzzleImage(name) {
  const rules = [
    { keys: ['凤凰装'], album: '凤凰装' },
    { keys: ['乌米饭', '非遗', '茶田'], album: '乌米饭' },
    { keys: ['畲绣'], album: '畲绣' },
    { keys: ['三月三', '歌会', '对歌'], album: '畲绣' },
    { keys: ['花斗笠'], album: '花斗笠' },
    { keys: ['项链'], album: '项链' },
    { keys: ['少女'], album: 'ID形象-少女' },
  ]
  for (const rule of rules) {
    if (rule.keys.some((k) => name.includes(k))) {
      const album = albums.find((a) => a.name === rule.album)
      if (album) return album.image
    }
  }
  return albums.length ? albums[0].image : ''
}

/**
 * 每块显示照片的对应切片。
 * 用固定 rpx 精确定位（每格 220rpx）：图片放大到整版尺寸，再按“已还原位置”负偏移。
 * 百分比 left/top 在部分机型/基础库上不可靠，故不使用。
 */
function tileImageStyle(tile) {
  const n = size.value
  const cell = 220
  const solvedRow = Math.floor(tile / n)
  const solvedCol = tile % n
  return `width:${n * cell}rpx;height:${n * cell}rpx;left:-${solvedCol * cell}rpx;top:-${solvedRow * cell}rpx;`
}

function shuffleBoard() {
  const n = size.value
  const total = n * n
  let arr = Array.from({ length: total }, (_, i) => i)
  do {
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  } while (!isSolvable(arr, n) || isSolved(arr))
  board.value = arr
  moves.value = 0
  showResult.value = false
}

function isSolvable(arr, n) {
  const flat = arr.filter((v) => v !== 0)
  let inversions = 0
  for (let i = 0; i < flat.length; i++) {
    for (let j = i + 1; j < flat.length; j++) {
      if (flat[i] > flat[j]) inversions++
    }
  }
  if (n % 2 === 1) return inversions % 2 === 0
  const blankRowFromBottom = n - Math.floor(arr.indexOf(0) / n)
  return (inversions + blankRowFromBottom) % 2 === 0
}

function isSolved(arr) {
  return arr.every((v, i) => v === i)
}

function blankIndex() {
  return board.value.indexOf(0)
}

function tapTile(index) {
  if (showResult.value) return
  const n = size.value
  const blank = blankIndex()
  const blankRow = Math.floor(blank / n)
  const blankCol = blank % n
  const row = Math.floor(index / n)
  const col = index % n
  if (Math.abs(row - blankRow) + Math.abs(col - blankCol) !== 1) return
  const next = [...board.value]
  ;[next[blank], next[index]] = [next[index], next[blank]]
  board.value = next
  moves.value += 1
  if (isSolved(next)) {
    handleWin()
  }
}

async function handleWin() {
  showResult.value = true
  if (node.value.isLocal) {
    result.value = { gainedPoints: 0, gainedFragment: null }
    return
  }
  const id = node.value.id
  if (!id) {
    result.value = { gainedPoints: 0, gainedFragment: null }
    return
  }
  try {
    result.value = (await completeExploreNode(id)) || {}
  } catch (error) {
    result.value = { gainedPoints: 0, gainedFragment: null }
    uni.showToast({ title: friendlyMessage(error, '完成记录失败'), icon: 'none' })
  }
}

function finish() {
  showResult.value = false
  setTimeout(() => uni.navigateBack(), 200)
}
</script>

<style lang="scss" scoped>
.container {
  padding: 32rpx;
  background: $color-bg;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  width: 100%;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.title {
  font-size: 36rpx;
  font-weight: 700;
}

.subtitle {
  display: block;
  font-size: 24rpx;
  color: $color-text-secondary;
  margin-top: 4rpx;
}

.moves {
  font-size: 28rpx;
  color: $color-primary;
  font-weight: 600;
}

.puzzle-board {
  margin-top: 40rpx;
  display: grid;
  gap: 6rpx;
  background: #E8E4DF;
  border-radius: 16rpx;
  padding: 6rpx;
  box-sizing: content-box;
}

.puzzle-tile {
  position: relative;
  overflow: hidden;
  border-radius: 8rpx;
  background: #DCE3EA;
  width: 100%;
  height: 100%;
}

.puzzle-tile.blank {
  background: #F1EFEC;
}

.tile-img {
  position: absolute;
}

.actions {
  margin-top: 40rpx;
  display: flex;
  gap: 20rpx;
}

.action-btn {
  background: $color-surface;
  color: $color-primary;
  border: 1rpx solid $color-primary;
  border-radius: 40rpx;
  font-size: 28rpx;
  padding: 0 40rpx;
  line-height: 80rpx;
  margin: 0;
}

.action-btn::after {
  border: none;
}

.hint {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: $color-text-secondary;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-card,
.result-card {
  width: 580rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-img,
.result-img {
  width: 460rpx;
  height: 460rpx;
  border-radius: 16rpx;
  background: #F1EFEC;
  margin-top: 16rpx;
}

.preview-name {
  font-size: 28rpx;
  color: $color-text-secondary;
  margin-top: 16rpx;
}

.preview-btn {
  margin-top: 24rpx;
  width: 100%;
  background: $color-bg;
  color: $color-text;
  border-radius: 40rpx;
}

.preview-btn::after {
  border: none;
}

.result-title {
  font-size: 40rpx;
  font-weight: 700;
  color: $color-primary;
}

.result-name {
  font-size: 30rpx;
  margin-top: 12rpx;
  color: $color-text-secondary;
}

.result-points {
  margin-top: 12rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #B8860B;
}

.result-fragment {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: $color-text-secondary;
}

.result-local {
  margin-top: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #2563EB;
}

.result-btn {
  margin-top: 32rpx;
  width: 100%;
  background: $color-primary;
  color: #fff;
  border-radius: 40rpx;
}

.result-btn::after {
  border: none;
}
</style>

