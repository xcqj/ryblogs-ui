<template>
  <div class="p-2 app-container blog-adminComment-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>筛选条件</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item label="文章ID" prop="articleId">
            <el-input v-model="queryParams.articleId" placeholder="请输入文章ID" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="用户ID" prop="userId">
            <el-input
              v-model="queryParams.userId"
              placeholder="请输入评论用户ID"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="内容关键字" prop="keyword">
            <el-input
              v-model="queryParams.keyword"
              placeholder="请输入评论内容关键字"
              clearable
              @keyup.enter="handleQuery"
            />
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
            <h3>博客评论治理</h3>
          </div>
          <div class="toolbar-actions">
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="commentList">
        <el-table-column label="评论ID" align="center" prop="commentId" width="110" />
        <el-table-column label="文章ID" align="center" prop="articleId" width="110" />
        <el-table-column label="评论用户" align="center" prop="userName" width="140" show-overflow-tooltip />
        <el-table-column label="评论内容" align="left" prop="content" min-width="280" show-overflow-tooltip />
        <el-table-column label="评论时间" align="center" prop="createTime" width="180" />
        <el-table-column label="操作" align="center" width="120" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看文章" placement="top">
              <el-button
                v-hasPermi="['blog:article:query']"
                link
                type="primary"
                icon="Document"
                @click="handleViewArticle(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                v-hasPermi="['blog:comment:remove']"
                link
                type="danger"
                icon="Delete"
                @click="handleDelete(scope.row)"
              ></el-button>
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

    <!-- 文章详情 + 版本切换（共享组件，admin scope） -->
    <ArticleDetailDrawer v-model="detailVisible" :article-id="detailArticleId" scope="admin" />
  </div>
</template>

<script setup name="BlogAdminComment" lang="ts">
import { listBlogAdminComment, delBlogAdminComment } from '@/api/blog/adminComment';
import { BlogAdminCommentVO, BlogAdminCommentQuery } from '@/api/blog/adminComment/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import modal from '@/plugins/modal';
import ArticleDetailDrawer from '@/views/blog/components/ArticleDetailDrawer.vue';

const commentList = ref<BlogAdminCommentVO[]>([]);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

// 文章详情抽屉（共享组件）
const detailVisible = ref(false);
const detailArticleId = ref<string | number>();
const handleViewArticle = (row: Partial<BlogAdminCommentVO>) => {
  if (!row.articleId) return;
  detailArticleId.value = row.articleId;
  detailVisible.value = true;
};

const queryParams = ref<BlogAdminCommentQuery>({
  pageNum: 1,
  pageSize: 10,
  articleId: undefined,
  userId: undefined,
  keyword: undefined
});

/** 查询列表 */
const getList = async () => {
  await withLoading(async () => {
    const res = await listBlogAdminComment(queryParams.value);
    commentList.value = res.data?.rows;
    total.value = res.data?.total;
  });
};

/** 搜索 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置 */
const { resetQuery } = useSearchReset<BlogAdminCommentQuery>({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  afterReset: () => {
    handleQuery();
  }
});

/** 删除评论（契约 §12.2，逻辑删除，唯一治理手段） */
const handleDelete = async (row: Partial<BlogAdminCommentVO>) => {
  if (!row.commentId) return;
  await modal.confirm('是否确认删除该条评论（ID：' + row.commentId + '）？删除为逻辑删除，不可恢复显示。');
  await delBlogAdminComment(row.commentId);
  modal.msgSuccess('删除成功');
  await getList();
};

onMounted(() => {
  getList();
});
</script>
