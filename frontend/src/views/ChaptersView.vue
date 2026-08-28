<template>
  <div class="chapters-view">
    <!-- 页头 -->
    <div class="page-header">
      <div>
        <h2>章节关卡</h2>
        <p class="page-desc">管理小程序中的章节与关卡配置</p>
      </div>
      <button class="btn btn-primary" :disabled="loading" @click="openChapterModal('create')">
        <Plus :size="16" />
        新增章节
      </button>
    </div>

    <!-- 加载态 -->
    <div v-if="loading" class="loading-box">
      <span class="spinner"></span>
      加载中...
    </div>

    <!-- 加载失败 -->
    <div v-else-if="loadError" class="error-box">
      <p>{{ loadError }}</p>
      <button class="btn btn-outline" @click="loadData">重试</button>
    </div>

    <!-- 主体：章节 + 关卡 -->
    <div v-else class="content">
      <!-- 左栏：章节列表 -->
      <aside class="chapter-panel panel">
        <div class="panel-title">章节（{{ chapters.length }}）</div>
        <div v-if="chapters.length === 0" class="empty-tip">
          暂无章节，点击右上角"新增章节"
        </div>
        <ul class="chapter-list">
          <li
            v-for="chapter in chapters"
            :key="chapter.id"
            class="chapter-item"
            :class="{ active: chapter.id === activeChapterId }"
            @click="selectChapter(chapter.id)"
          >
            <div class="chapter-head">
              <span class="chapter-order">第 {{ chapter.order }} 章</span>
              <span class="status-dot" :class="chapter.isPublished ? 'on' : 'off'"></span>
            </div>
            <div class="chapter-title">{{ chapter.title }}</div>
            <div class="chapter-subtitle">{{ chapter.subtitle || '暂无描述' }}</div>
            <div class="chapter-foot">
              <span class="chapter-meta">{{ chapter.levels.length }} 个关卡</span>
              <div class="chapter-actions" @click.stop>
                <button
                  class="icon-btn"
                  :title="chapter.isPublished ? '下架' : '发布'"
                  @click="toggleChapterPublish(chapter)"
                >
                  <component
                    :is="chapter.isPublished ? EyeOff : Eye"
                    :size="15"
                  />
                </button>
                <button class="icon-btn" title="编辑" @click="openChapterModal('edit', chapter)">
                  <Pencil :size="15" />
                </button>
                <button class="icon-btn danger" title="删除" @click="removeChapter(chapter)">
                  <Trash2 :size="15" />
                </button>
              </div>
            </div>
          </li>
        </ul>
      </aside>

      <!-- 右栏：关卡列表 -->
      <section class="level-panel panel">
        <div class="panel-title level-title">
          <span>关卡列表</span>
          <button
            class="btn btn-sm btn-primary"
            :disabled="!activeChapter"
            @click="openLevelModal('create')"
          >
            <Plus :size="14" />
            新增关卡
          </button>
        </div>

        <!-- 未选择章节 -->
        <div v-if="!activeChapter" class="empty-tip">
          请先选择左侧章节
        </div>

        <!-- 空关卡 -->
        <div v-else-if="activeChapter.levels.length === 0" class="empty-tip">
          该章节下暂无关卡，点击"新增关卡"创建
        </div>

        <!-- 关卡列表 -->
        <ul v-else class="level-list">
          <li v-for="level in activeChapter.levels" :key="level.id" class="level-item">
            <span class="level-badge">{{ level.order }}</span>
            <div class="level-main">
              <div class="level-head">
                <span class="level-name">{{ level.title }}</span>
                <span class="level-status" :class="level.isPublished ? 'on' : 'off'">
                  {{ level.isPublished ? '已发布' : '未发布' }}
                </span>
              </div>
              <div class="level-desc">{{ level.description || '暂无描述' }}</div>
            </div>
            <div class="level-actions">
              <button
                class="icon-btn"
                :title="level.isPublished ? '下架' : '发布'"
                @click="toggleLevelPublish(level)"
              >
                <component :is="level.isPublished ? EyeOff : Eye" :size="15" />
              </button>
              <button class="icon-btn" title="编辑" @click="openLevelModal('edit', level)">
                <Pencil :size="15" />
              </button>
              <button class="icon-btn danger" title="删除" @click="removeLevel(level)">
                <Trash2 :size="15" />
              </button>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <!-- ── 模态框：章节 / 关卡 表单 ── -->
    <div v-if="modal.visible" class="modal-mask" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ modal.title }}</h3>
          <button class="icon-btn" title="关闭" @click="closeModal">
            <X :size="16" />
          </button>
        </div>

        <!-- 章节表单 -->
        <form v-if="modal.kind === 'chapter'" class="modal-form" @submit.prevent="submitChapter">
          <div class="form-field">
            <label>章节标题 <em>*</em></label>
            <input
              v-model="chapterForm.title"
              type="text"
              placeholder="例如：畲族之源"
              required
            />
          </div>
          <div class="form-field">
            <label>章节描述</label>
            <textarea
              v-model="chapterForm.subtitle"
              rows="3"
              placeholder="简要描述该章节的内容主题"
            ></textarea>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>排序号</label>
              <input v-model.number="chapterForm.order" type="number" min="1" />
            </div>
            <div class="form-field">
              <label>状态</label>
              <select v-model="chapterForm.isPublished">
                <option :value="true">已发布</option>
                <option :value="false">未发布</option>
              </select>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="modal.saving">
              {{ modal.saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>

        <!-- 关卡表单 -->
        <form v-else class="modal-form" @submit.prevent="submitLevel">
          <div class="form-field">
            <label>关卡标题 <em>*</em></label>
            <input
              v-model="levelForm.title"
              type="text"
              placeholder="例如：高辛氏传说"
              required
            />
          </div>
          <div class="form-field">
            <label>关卡描述</label>
            <textarea
              v-model="levelForm.description"
              rows="3"
              placeholder="简要描述该关卡的内容或任务"
            ></textarea>
          </div>
          <div class="form-row">
            <div class="form-field">
              <label>排序号</label>
              <input v-model.number="levelForm.order" type="number" min="1" />
            </div>
            <div class="form-field">
              <label>状态</label>
              <select v-model="levelForm.isPublished">
                <option :value="true">已发布</option>
                <option :value="false">未发布</option>
              </select>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="modal.saving">
              {{ modal.saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Plus, Pencil, Trash2, X, Eye, EyeOff } from 'lucide-vue-next'
import {
  getChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  createLevel,
  updateLevel,
  deleteLevel,
} from '@/api/chapters'
import type { ChapterWithLevels, Level } from '@/types/admin'

// ── 状态 ───────────────────────────────────────────────────────

const loading = ref(true)
const loadError = ref('')
const chapters = ref<ChapterWithLevels[]>([])
const activeChapterId = ref('')

/** 当前选中章节 */
const activeChapter = computed<ChapterWithLevels | undefined>(() =>
  chapters.value.find((c) => c.id === activeChapterId.value),
)

// ── 模态框状态 ────────────────────────────────────────────────

const modal = reactive({
  visible: false,
  kind: '' as 'chapter' | 'level',
  mode: '' as 'create' | 'edit',
  title: '',
  saving: false,
})

const chapterForm = reactive({
  id: '',
  title: '',
  subtitle: '',
  order: 1,
  isPublished: false,
})

const levelForm = reactive({
  id: '',
  title: '',
  description: '',
  order: 1,
  isPublished: false,
})

// ── 数据加载 ──────────────────────────────────────────────────

async function loadData() {
  loading.value = true
  loadError.value = ''
  try {
    chapters.value = await getChapters()
    // 优先保留当前选中的章节；仅当首次加载或当前章节已不存在时，回退到第一个已发布章节
    if (chapters.value.length > 0) {
      const current = chapters.value.find((c) => c.id === activeChapterId.value)
      const first = current ?? chapters.value.find((c) => c.isPublished) ?? chapters.value[0]
      activeChapterId.value = first.id
    } else {
      activeChapterId.value = ''
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '章节数据加载失败'
    console.error('[Chapters] 加载失败 →', error)
  } finally {
    loading.value = false
  }
}

// ── 章节操作 ──────────────────────────────────────────────────

function openChapterModal(mode: 'create' | 'edit', chapter?: ChapterWithLevels) {
  chapterForm.id = chapter?.id ?? ''
  chapterForm.title = chapter?.title ?? ''
  chapterForm.subtitle = chapter?.subtitle ?? ''
  chapterForm.order = chapter?.order ?? chapters.value.length + 1
  chapterForm.isPublished = chapter?.isPublished ?? false

  modal.kind = 'chapter'
  modal.mode = mode
  modal.title = mode === 'create' ? '新增章节' : '编辑章节'
  modal.visible = true
}

async function submitChapter() {
  if (!chapterForm.title.trim()) return
  modal.saving = true
  try {
    const payload = {
      title: chapterForm.title.trim(),
      subtitle: chapterForm.subtitle.trim(),
      order: chapterForm.order,
      isPublished: chapterForm.isPublished,
    }
    if (modal.mode === 'create') {
      const created = await createChapter(payload)
      chapters.value.push(created)
      activeChapterId.value = created.id
    } else {
      await updateChapter(chapterForm.id, payload)
      await loadData()
    }
    closeModal()
  } catch (error) {
    console.error('[Chapters] 保存章节失败 →', error)
  } finally {
    modal.saving = false
  }
}

async function toggleChapterPublish(chapter: ChapterWithLevels) {
  try {
    await updateChapter(chapter.id, { isPublished: !chapter.isPublished })
    chapter.isPublished = !chapter.isPublished
  } catch (error) {
    console.error('[Chapters] 切换章节状态失败 →', error)
  }
}

async function removeChapter(chapter: ChapterWithLevels) {
  const count = chapter.levels.length
  const tip =
    count > 0
      ? `确定删除「${chapter.title}」吗？其下 ${count} 个关卡将一并删除，且不可恢复！`
      : `确定删除「${chapter.title}」吗？此操作不可恢复！`
  if (!window.confirm(tip)) return

  try {
    await deleteChapter(chapter.id)
    chapters.value = chapters.value.filter((c) => c.id !== chapter.id)
    if (activeChapterId.value === chapter.id) {
      activeChapterId.value = chapters.value[0]?.id ?? ''
    }
  } catch (error) {
    console.error('[Chapters] 删除章节失败 →', error)
  }
}

// ── 关卡操作 ──────────────────────────────────────────────────

function openLevelModal(mode: 'create' | 'edit', level?: Level) {
  if (mode === 'create' && !activeChapter.value) return

  levelForm.id = level?.id ?? ''
  levelForm.title = level?.title ?? ''
  levelForm.description = level?.description ?? ''
  levelForm.order = level?.order ?? (activeChapter.value?.levels.length ?? 0) + 1
  levelForm.isPublished = level?.isPublished ?? false

  modal.kind = 'level'
  modal.mode = mode
  modal.title = mode === 'create' ? `新增关卡（${activeChapter.value?.title}）` : '编辑关卡'
  modal.visible = true
}

async function submitLevel() {
  if (!levelForm.title.trim() || !activeChapter.value) return
  modal.saving = true
  try {
    const payload = {
      title: levelForm.title.trim(),
      description: levelForm.description.trim(),
      order: levelForm.order,
      isPublished: levelForm.isPublished,
    }
    if (modal.mode === 'create') {
      await createLevel(activeChapter.value.id, payload)
    } else {
      await updateLevel(levelForm.id, payload)
    }
    await loadData()
    closeModal()
  } catch (error) {
    console.error('[Chapters] 保存关卡失败 →', error)
  } finally {
    modal.saving = false
  }
}

async function toggleLevelPublish(level: Level) {
  try {
    await updateLevel(level.id, { isPublished: !level.isPublished })
    level.isPublished = !level.isPublished
  } catch (error) {
    console.error('[Chapters] 切换关卡状态失败 →', error)
  }
}

async function removeLevel(level: Level) {
  if (!window.confirm(`确定删除关卡「${level.title}」吗？此操作不可恢复！`)) return
  try {
    await deleteLevel(level.id)
    await loadData()
  } catch (error) {
    console.error('[Chapters] 删除关卡失败 →', error)
  }
}

// ── 其他 ──────────────────────────────────────────────────────

function selectChapter(id: string) {
  activeChapterId.value = id
}

function closeModal() {
  modal.visible = false
  modal.saving = false
}

// ── 生命周期 ──────────────────────────────────────────────────

onMounted(loadData)
</script>

<style scoped>
/* ── 页头 ────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 4px;
  font-size: 22px;
  color: var(--color-text);
}

.page-desc {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* ── 通用按钮 ────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  color: #fff;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light, #a53050));
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-outline {
  color: var(--color-primary);
  background: transparent;
  border: 1px solid var(--color-primary);
}

.btn-outline:hover {
  background: rgba(139, 30, 63, 0.06);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

/* ── 加载 / 错误 ──────────────────────────────────────────── */
.loading-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 48px 0;
  justify-content: center;
  color: var(--color-text-secondary);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  color: #c62828;
}

/* ── 主体布局 ────────────────────────────────────────────── */
.content {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
  align-items: start;
}

.panel {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 16px;
}

.empty-tip {
  padding: 32px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
}

/* ── 章节列表 ────────────────────────────────────────────── */
.chapter-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 70vh;
  overflow-y: auto;
}

.chapter-item {
  padding: 12px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.chapter-item:hover {
  border-color: rgba(139, 30, 63, 0.4);
}

.chapter-item.active {
  border-color: var(--color-primary);
  background: rgba(139, 30, 63, 0.05);
}

.chapter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.chapter-order {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary);
  background: rgba(139, 30, 63, 0.08);
  padding: 2px 8px;
  border-radius: 99px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.on {
  background: #2e7d32;
}

.status-dot.off {
  background: #bdbdbd;
}

.chapter-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.chapter-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chapter-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.chapter-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.chapter-actions,
.level-actions {
  display: flex;
  gap: 4px;
}

/* ── 图标按钮 ────────────────────────────────────────────── */
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.icon-btn:hover {
  background: rgba(139, 30, 63, 0.08);
  color: var(--color-primary);
}

.icon-btn.danger:hover {
  background: rgba(229, 57, 53, 0.08);
  color: #c62828;
}

/* ── 关卡列表 ────────────────────────────────────────────── */
.level-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 70vh;
  overflow-y: auto;
}

.level-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  transition: border-color 0.2s;
}

.level-item:hover {
  border-color: rgba(139, 30, 63, 0.4);
}

.level-badge {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: var(--color-primary);
  border-radius: 8px;
}

.level-main {
  flex: 1;
  min-width: 0;
}

.level-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.level-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.level-status {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 99px;
}

.level-status.on {
  color: #2e7d32;
  background: rgba(46, 125, 50, 0.1);
}

.level-status.off {
  color: #757575;
  background: rgba(117, 117, 117, 0.1);
}

.level-desc {
  margin-top: 2px;
  font-size: 12px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── 模态框 ──────────────────────────────────────────────── */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
}

.modal-card {
  width: 440px;
  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  padding: 24px;
  background: var(--color-surface);
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 17px;
  color: var(--color-text);
}

/* ── 表单 ────────────────────────────────────────────────── */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.form-field label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-field label em {
  color: #e53935;
  font-style: normal;
}

.form-field input,
.form-field textarea,
.form-field select {
  width: 100%;
  padding: 9px 12px;
  font-size: 14px;
  color: var(--color-text);
  background: var(--color-bg, #f8f8f8);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(139, 30, 63, 0.1);
}

.form-row {
  display: flex;
  gap: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

/* ── 响应式 ──────────────────────────────────────────────── */
@media (max-width: 900px) {
  .content {
    grid-template-columns: 1fr;
  }
}
</style>
