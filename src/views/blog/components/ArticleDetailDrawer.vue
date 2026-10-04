<template>
  <el-drawer
    :model-value="modelValue"
    title="文章详情"
    size="70%"
    direction="rtl"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-loading="loading" class="article-detail">
      <template v-if="detail">
        <!-- 版本切换（置于信息块上方） -->
        <div class="version-bar">
          <span class="version-bar__label">查看版本</span>
          <el-select v-model="viewingVersionId" style="width: 300px" @change="onVersionChange">
            <el-option
              v-for="v in versions"
              :key="String(v.versionId)"
              :label="versionLabel(v)"
              :value="String(v.versionId)"
            />
          </el-select>
          <span class="hint">共 {{ versions.length }} 个版本（只读快照，不可恢复）</span>
        </div>

        <!-- 文章级元信息（不随版本变化） -->
        <el-descriptions :column="2" border size="small" class="mb-3">
          <el-descriptions-item label="作者">{{ detail.authorName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detail.status === STATUS.PUBLISHED ? 'success' : 'info'">
              {{ detail.status === STATUS.PUBLISHED ? '已发布' : '草稿' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="可见性">
            <el-tag :type="visibilityTagType(detail.visibility)">{{ visibilityLabel(detail.visibility) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="阅读量">{{ detail.viewCount ?? 0 }}</el-descriptions-item>
          <el-descriptions-item label="首次发布">{{ detail.publishedAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detail.updateTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="标签" :span="2">
            <el-tag v-for="t in detail.tags || []" :key="String(t.tagId)" size="small" class="mr-1">
              {{ t.name }}
            </el-tag>
            <span v-if="!detail.tags || !detail.tags.length">-</span>
            <span class="hint">（标签为文章当前标签，不随历史版本变化）</span>
          </el-descriptions-item>
          <template v-if="detail.visibility === VISIBILITY.ADMIN_HIDDEN">
            <el-descriptions-item label="下线人">{{ detail.adminHiddenByName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="下线时间">{{ detail.adminHiddenTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="下线原因" :span="2">
              {{ detail.adminHiddenReason || '-' }}
            </el-descriptions-item>
          </template>
        </el-descriptions>

        <!-- 所选版本快照内容（标题/摘要/封面/正文随版本变化） -->
        <div v-if="viewing" class="version-body">
          <el-descriptions :column="1" border size="small" class="mb-3">
            <el-descriptions-item label="标题">{{ viewing.title || '(未命名草稿)' }}</el-descriptions-item>
            <el-descriptions-item label="摘要">{{ viewing.summary || '-' }}</el-descriptions-item>
            <el-descriptions-item label="封面">
              <el-image
                v-if="viewing.coverUrl"
                :src="viewing.coverUrl"
                fit="cover"
                style="width: 148px; height: 96px"
              />
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
          <editor :key="viewingVersionId" v-model="viewing.content" :read-only="true" :min-height="360" />
        </div>
      </template>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { getBlogAdminArticle } from '@/api/blog/adminArticle';
import { getBlogArticle, listBlogArticleVersions, getBlogArticleVersion } from '@/api/blog/article';
import { BlogArticleDetailVO, BlogArticleVersionVO } from '@/api/blog/article/types';
import modal from '@/plugins/modal';

/** 契约 §14 状态常量 */
const STATUS = { DRAFT: '0', PUBLISHED: '1' } as const;
const VISIBILITY = { PUBLIC: '0', USER_HIDDEN: '1', ADMIN_HIDDEN: '2' } as const;

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    articleId?: string | number;
    /** author: 走 /blog/article/{id}；admin: 走 /blog/admin/articles/{id}（§11.2，不混用边界） */
    scope?: 'author' | 'admin';
  }>(),
  { modelValue: false, articleId: undefined, scope: 'author' }
);
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();

const visibilityLabel = (v: string) =>
  ({ [VISIBILITY.PUBLIC]: '公开', [VISIBILITY.USER_HIDDEN]: '用户隐藏', [VISIBILITY.ADMIN_HIDDEN]: '管理员下线' })[v] ??
  v;
const visibilityTagType = (v: string) => {
  if (v === VISIBILITY.PUBLIC) return 'primary';
  if (v === VISIBILITY.USER_HIDDEN) return 'warning';
  if (v === VISIBILITY.ADMIN_HIDDEN) return 'danger';
  return 'info';
};

const loading = ref(false);
const detail = ref<BlogArticleDetailVO | null>(null);
const versions = ref<BlogArticleVersionVO[]>([]);
const viewing = ref<BlogArticleVersionVO | null>(null);
const viewingVersionId = ref<string>('');

const currentVersionId = computed(() =>
  detail.value?.currentVersion ? String(detail.value.currentVersion.versionId) : ''
);
const versionLabel = (v: BlogArticleVersionVO) =>
  `v${v.versionNo} · ${v.title || '未命名'}${String(v.versionId) === currentVersionId.value ? '（当前）' : ''}`;

/** 打开时加载详情 + 版本列表，默认展示当前生效版本 */
const loadAll = async () => {
  const id = props.articleId;
  if (!id) return;
  loading.value = true;
  try {
    const [detailRes, versionsRes] = await Promise.all([
      props.scope === 'admin' ? getBlogAdminArticle(id) : getBlogArticle(id),
      listBlogArticleVersions(id)
    ]);
    detail.value = detailRes.data;
    versions.value = versionsRes.data || [];
    viewing.value = detail.value?.currentVersion ?? null;
    viewingVersionId.value = currentVersionId.value;
  } finally {
    loading.value = false;
  }
};

/** 切换版本：当前版本用已加载快照，历史版本按需拉 §4.2 完整快照 */
const onVersionChange = async (vid: string) => {
  if (!props.articleId) return;
  if (vid === currentVersionId.value && detail.value?.currentVersion) {
    viewing.value = detail.value.currentVersion;
    return;
  }
  const res = await getBlogArticleVersion(props.articleId, vid);
  viewing.value = res.data;
};

const reset = () => {
  detail.value = null;
  versions.value = [];
  viewing.value = null;
  viewingVersionId.value = '';
};

watch(
  () => [props.modelValue, props.articleId] as const,
  ([visible, id]) => {
    if (visible && id) {
      loadAll().catch(() => modal.msgError('文章详情加载失败（可能无权访问该文章的版本历史）'));
    } else if (!visible) {
      reset();
    }
  }
);
</script>

<style lang="scss" scoped>
.article-detail {
  min-height: 200px;
}

.version-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;

  &__label {
    font-weight: 600;
  }
}

.hint {
  margin-left: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.version-body {
  :deep(.el-descriptions) {
    margin-bottom: 0;
  }
}
</style>
