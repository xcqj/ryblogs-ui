<template>
  <div class="p-2 app-container blog-article-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>筛选条件</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item label="标题" prop="keyword">
            <el-input
              v-model="queryParams.keyword"
              placeholder="请输入标题关键字"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 130px">
              <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="可见性" prop="visibility">
            <el-select v-model="queryParams.visibility" placeholder="全部" clearable style="width: 150px">
              <el-option v-for="opt in visibilityOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="toolbar-shell">
          <div class="table-heading">
            <h3>我的文章</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" plain icon="Plus" @click="handleCreate">新增文章</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="articleList">
        <el-table-column label="文章ID" align="center" prop="articleId" width="90" />
        <el-table-column label="标题" align="left" prop="title" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row.title || '(未命名草稿)' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="标签" align="left" min-width="160">
          <template #default="scope">
            <el-tag v-for="t in scope.row.tags || []" :key="t.tagId" size="small" class="mr-1">{{ t.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status === STATUS.PUBLISHED ? 'success' : 'info'">
              {{ statusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="可见性" align="center" width="110">
          <template #default="scope">
            <el-tag :type="visibilityTagType(scope.row.visibility)">{{ visibilityLabel(scope.row.visibility) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="阅读量" align="center" prop="viewCount" width="80" />
        <el-table-column label="更新时间" align="center" prop="updateTime" width="170" />
        <el-table-column label="操作" align="center" width="220" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <!-- 作者接口仅登录不设按钮权限，以下显隐只按状态机（镜像 ArticleGuards），权限由后端强制 -->
            <el-tooltip v-if="canEdit(scope.row)" content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleEdit(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip v-if="canPublish(scope.row)" content="发布" placement="top">
              <el-button link type="primary" icon="Promotion" @click="handlePublish(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip v-if="canHide(scope.row)" content="隐藏" placement="top">
              <el-button link type="warning" icon="Hide" @click="handleHide(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip v-if="canShow(scope.row)" content="重新公开" placement="top">
              <el-button link type="success" icon="View" @click="handleShow(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>
  </div>
</template>

<script setup name="BlogArticle" lang="ts">
import { useRouter } from 'vue-router';
import {
  listMyBlogArticle,
  publishBlogArticle,
  hideBlogArticle,
  showBlogArticle,
  delBlogArticle
} from '@/api/blog/article';
import { BlogArticleVO, BlogArticleQuery } from '@/api/blog/article/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import modal from '@/plugins/modal';

/** 契约 §14 状态常量：status 0草稿 1已发布；visibility 0公开 1用户隐藏 2管理员下线 */
const STATUS = { DRAFT: '0', PUBLISHED: '1' } as const;
const VISIBILITY = { PUBLIC: '0', USER_HIDDEN: '1', ADMIN_HIDDEN: '2' } as const;

const statusOptions = [
  { value: STATUS.DRAFT, label: '草稿' },
  { value: STATUS.PUBLISHED, label: '已发布' }
];
const visibilityOptions = [
  { value: VISIBILITY.PUBLIC, label: '公开' },
  { value: VISIBILITY.USER_HIDDEN, label: '用户隐藏' },
  { value: VISIBILITY.ADMIN_HIDDEN, label: '管理员下线' }
];
const statusLabel = (v: string) => statusOptions.find(o => o.value === v)?.label ?? v;
const visibilityLabel = (v: string) => visibilityOptions.find(o => o.value === v)?.label ?? v;
const visibilityTagType = (v: string) => {
  if (v === VISIBILITY.PUBLIC) return 'primary';
  if (v === VISIBILITY.USER_HIDDEN) return 'warning';
  if (v === VISIBILITY.ADMIN_HIDDEN) return 'danger';
  return 'info';
};

/** 以下按钮可用性逐条镜像后端 ArticleGuards（仅体验，后端仍强制校验） */
// requireEditable：非 ADMIN_HIDDEN 可编辑
const canEdit = (row: Partial<BlogArticleVO>) => row.visibility !== VISIBILITY.ADMIN_HIDDEN;
// requirePublishable：DRAFT 且 PUBLIC 可发布
const canPublish = (row: Partial<BlogArticleVO>) => row.status === STATUS.DRAFT && row.visibility === VISIBILITY.PUBLIC;
// requireUserToggleVisible：PUBLISHED 且非 ADMIN_HIDDEN；hide 仅 PUBLIC→USER_HIDDEN
const canHide = (row: Partial<BlogArticleVO>) =>
  row.status === STATUS.PUBLISHED && row.visibility === VISIBILITY.PUBLIC;
// show 仅 USER_HIDDEN→PUBLIC
const canShow = (row: Partial<BlogArticleVO>) =>
  row.status === STATUS.PUBLISHED && row.visibility === VISIBILITY.USER_HIDDEN;

const router = useRouter();
const articleList = ref<BlogArticleVO[]>([]);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

const queryParams = ref<BlogArticleQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: undefined,
  status: undefined,
  visibility: undefined
});

/** 查询列表 */
const getList = async () => {
  await withLoading(async () => {
    const res = await listMyBlogArticle(queryParams.value);
    articleList.value = res.data?.rows;
    total.value = res.data?.total;
  });
};

/** 搜索 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置 */
const { resetQuery } = useSearchReset<BlogArticleQuery>({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  afterReset: () => {
    handleQuery();
  }
});

/** 新增文章（跳转发文的编辑页，编辑页在 A2 落地） */
const handleCreate = () => {
  router.push({ path: '/blog-article/edit' });
};

/** 编辑文章 */
const handleEdit = (row: Partial<BlogArticleVO>) => {
  if (!row.articleId) return;
  router.push({ path: '/blog-article/edit', query: { id: String(row.articleId) } });
};

/** 发布 */
const handlePublish = async (row: Partial<BlogArticleVO>) => {
  if (!row.articleId) return;
  await modal.confirm('发布后文章将立即对公众可见，确认发布《' + (row.title || '未命名草稿') + '》？');
  await publishBlogArticle(row.articleId);
  modal.msgSuccess('发布成功');
  await getList();
};

/** 隐藏（转用户隐藏，不进公共列表） */
const handleHide = async (row: Partial<BlogArticleVO>) => {
  if (!row.articleId) return;
  await modal.confirm('隐藏后文章将从公共列表移除（仅自己可见），确认隐藏《' + (row.title || '') + '》？');
  await hideBlogArticle(row.articleId);
  modal.msgSuccess('已隐藏');
  await getList();
};

/** 重新公开 */
const handleShow = async (row: Partial<BlogArticleVO>) => {
  if (!row.articleId) return;
  await modal.confirm('确认重新公开《' + (row.title || '') + '》？');
  await showBlogArticle(row.articleId);
  modal.msgSuccess('已重新公开');
  await getList();
};

/** 删除（逻辑删除） */
const handleDelete = async (row: Partial<BlogArticleVO>) => {
  if (!row.articleId) return;
  await modal.confirm('是否确认删除文章《' + (row.title || '未命名草稿') + '》？删除为逻辑删除。');
  await delBlogArticle(row.articleId);
  modal.msgSuccess('删除成功');
  await getList();
};

onMounted(() => {
  getList();
});
</script>
