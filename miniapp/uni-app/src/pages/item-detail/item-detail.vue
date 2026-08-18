<template>
  <view class="container">
    <image class="cover" src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600" mode="aspectFill" />
    <view class="content">
      <text class="name">凤凰冠</text>
      <text class="pinyin">Phoenix Crown</text>
      <text class="section-title">文化内涵</text>
      <text class="desc">
        凤凰冠是畲族新娘服饰的巅峰之作，象征着重生、繁荣以及畲族女性坚韧不拔的力量。
      </text>
      <button class="collect-btn">收入图鉴</button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  background: $color-bg;
  min-height: 100vh;
}

.cover {
  width: 100%;
  height: 500rpx;
}

.content {
  padding: 32rpx;
}

.name {
  font-size: 48rpx;
  font-weight: 700;
}

.pinyin {
  display: block;
  color: $color-text-secondary;
  margin: 12rpx 0 32rpx;
}

.section-title {
  display: block;
  font-weight: 700;
  margin-bottom: 16rpx;
}

.desc {
  display: block;
  line-height: 1.8;
  color: $color-text-secondary;
}

.collect-btn {
  margin-top: 48rpx;
  background: #1E2A4A;
  color: #fff;
  border-radius: 48rpx;
}
</style>
