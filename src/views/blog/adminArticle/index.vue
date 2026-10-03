<template>
  <div class="p-2 app-container blog-adminArticle-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>筛选条件</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item label="标题" prop="title">
            <el-input v-model="queryParams.title" placeholder="请输入标题关键字" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 140px">
              <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="可见性" prop="visibility">
            <el-select v-model="queryParams.visibility" placeholder="全部" clearable style="width: 160px">
              <el-option v-for="opt in visibilityOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="作者ID" prop="authorId">
            <el-input
              v-model="queryParams.authorId"
              placeholder="请输入作者用户ID"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="创建时间" style="width: 308px">
            <el-date-picker
              v-model="dateRangeCreateTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
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
            <h3>博客文章治理</h3>
          </div>
          <div class="toolbar-actions">
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="articleList">
        <el-table-column label="文章ID" align="center" prop="articleId" width="100" />
        <el-table-column label="标题" align="left" prop="title" min-width="220" show-overflow-tooltip>
          <template #default="scope">
            <span>{{ scope.row.title || '(未命名草稿)' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="作者" align="center" prop="authorName" width="120" show-overflow-tooltip />
        <el-table-column label="状态" align="center" prop="status" width="90">
          <template #default="scope">
            <el-tag :type="statusTagType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="可见性" align="center" prop="visibility" width="110">
          <template #default="scope">
            <el-tag :type="visibilityTagType(scope.row.visibility)">{{ visibilityLabel(scope.row.visibility) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="阅读量" align="center" prop="viewCount" width="90" />
        <el-table-column label="首次发布" align="center" prop="publishedAt" width="170">
          <template #default="scope">
            <span>{{ scope.row.publishedAt || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="170" />
        <el-table-column label="更新时间" align="center" prop="updateTime" width="170" />
        <el-table-column label="治理信息" align="left" min-width="240" show-overflow-tooltip>
          <template #default="scope">
            <div v-if="scope.row.visibility === VISIBILITY.ADMIN_HIDDEN">
              <div>下线人：{{ scope.row.adminHiddenByName || '-' }}</div>
              <div>时间：{{ scope.row.adminHiddenTime || '-' }}</div>
              <div>原因：{{ scope.row.adminHiddenReason || '-' }}</div>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="140" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip v-if="canHide(scope.row)" content="下线" placement="top">
              <el-button
                v-hasPermi="['blog:article:adminHide']"
                link
                type="danger"
                icon="Hide"
                @click="handleHide(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip v-if="canRestore(scope.row)" content="恢复" placement="top">
              <el-button
                v-hasPermi="['blog:article:adminRestore']"
                link
                type="success"
                icon="RefreshRight"
                @click="handleRestore(scope.row)"
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

    <!-- 下线原因对话框（契约 §11.3，reason 必填 ≤500） -->
    <el-dialog v-model="hideDialog.visible" :title="hideDialog.title" width="520px" append-to-body>
      <el-form ref="hideFormRef" :model="hideForm" :rules="hideRules" label-width="80px">
        <el-form-item label="文章">
          <span>{{ currentRow?.title || '(未命名草稿)' }}</span>
        </el-form-item>
        <el-form-item label="下线原因" prop="reason">
          <el-input
            v-model="hideForm.reason"
            type="textarea"
            :rows="4"
            maxlength="500"
            show-word-limit
            placeholder="请填写下线依据，供作者与审计查看"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitHide">确 定</el-button>
          <el-button @click="cancelHide">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="BlogAdminArticle" lang="ts">
import { listBlogAdminArticle, hideBlogAdminArticle, restoreBlogAdminArticle } from '@/api/blog/adminArticle';
import { BlogAdminArticleVO, BlogAdminArticleQuery, BlogAdminArticleHideForm } from '@/api/blog/adminArticle/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useDialogState } from '@/hooks/dialog/useDialogState';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import modal from '@/plugins/modal';

/** 契约 §14 状态常量：status 0=草稿 1=已发布；visibility 0=公开 1=用户隐藏 2=管理员下线 */
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
const statusTagType = (v: string) => (v === STATUS.PUBLISHED ? 'success' : 'info');
const visibilityTagType = (v: string) => {
  if (v === VISIBILITY.PUBLIC) return 'primary';
  if (v === VISIBILITY.USER_HIDDEN) return 'warning';
  if (v === VISIBILITY.ADMIN_HIDDEN) return 'danger';
  return 'info';
};

/**
 * 是否显示「下线」按钮（体验层，最终以后端 ArticleGuards 为准）
 * PUBLISHED+PUBLIC → 可下线；已 ADMIN_HIDDEN → 可更新下线记录（D13 同态幂等）
 * 参数用 Partial<> 兼容 el-table 插槽 scope.row 的 DefaultRow 类型（与 demo/demo 现有页面同款做法）
 */
const canHide = (row: Partial<BlogAdminArticleVO>) =>
  row.status === STATUS.PUBLISHED &&
  (row.visibility === VISIBILITY.PUBLIC || row.visibility === VISIBILITY.ADMIN_HIDDEN);

/** 是否显示「恢复」按钮：仅 ADMIN_HIDDEN 可恢复（契约 §11.4） */
const canRestore = (row: Partial<BlogAdminArticleVO>) => row.visibility === VISIBILITY.ADMIN_HIDDEN;

const articleList = ref<BlogAdminArticleVO[]>([]);
const buttonLoading = ref(false);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const total = ref(0);
const dateRangeCreateTime = ref<[string, string] | []>([]);

const queryFormRef = ref<ElFormInstance>();
const hideFormRef = ref<ElFormInstance>();
const currentRow = ref<Partial<BlogAdminArticleVO>>();

const initHideForm: BlogAdminArticleHideForm = { reason: '' };
const hideForm = ref<BlogAdminArticleHideForm>({ ...initHideForm });
const hideRules = {
  reason: [
    { required: true, message: '下线原因不能为空', trigger: 'blur' },
    { max: 500, message: '下线原因长度不能超过500个字符', trigger: 'blur' }
  ]
};
const { dialog: hideDialog, openDialog: openHideDialog, closeDialog: closeHideDialog } = useDialogState('下线文章');

const queryParams = ref<BlogAdminArticleQuery>({
  pageNum: 1,
  pageSize: 10,
  title: undefined,
  status: undefined,
  visibility: undefined,
  authorId: undefined,
  beginTime: undefined,
  endTime: undefined
});

/** 拼接日期范围到查询参数（后端 BO 用平铺 beginTime/endTime，不走 params 桶） */
const buildQuery = (): BlogAdminArticleQuery => {
  const params: BlogAdminArticleQuery = { ...queryParams.value };
  if (dateRangeCreateTime.value && dateRangeCreateTime.value.length === 2) {
    params.beginTime = dateRangeCreateTime.value[0];
    params.endTime = dateRangeCreateTime.value[1];
  } else {
    params.beginTime = undefined;
    params.endTime = undefined;
  }
  return params;
};

/** 查询列表 */
const getList = async () => {
  await withLoading(async () => {
    const res = await listBlogAdminArticle(buildQuery());
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
const { resetQuery } = useSearchReset<BlogAdminArticleQuery>({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  resetExtras: () => {
    dateRangeCreateTime.value = [];
  },
  afterReset: () => {
    handleQuery();
  }
});

/** 打开下线对话框 */
const handleHide = (row: Partial<BlogAdminArticleVO>) => {
  if (!row.articleId) return;
  currentRow.value = row;
  hideForm.value = { ...initHideForm };
  // 已 ADMIN_HIDDEN 的行再次点下线 = 更新下线记录（D13），预填当前 reason 便于在原依据上补充
  if (row.visibility === VISIBILITY.ADMIN_HIDDEN && row.adminHiddenReason) {
    hideForm.value.reason = row.adminHiddenReason;
  }
  openHideDialog(row.visibility === VISIBILITY.ADMIN_HIDDEN ? '更新下线记录' : '下线文章');
  nextTick(() => hideFormRef.value?.clearValidate());
};

/** 取消下线 */
const cancelHide = () => {
  hideForm.value = { ...initHideForm };
  closeHideDialog();
};

/** 提交下线 */
const submitHide = () => {
  hideFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    const row = currentRow.value;
    if (!row?.articleId) return;
    buttonLoading.value = true;
    try {
      await hideBlogAdminArticle(row.articleId, { reason: hideForm.value.reason });
      modal.msgSuccess('操作成功');
      closeHideDialog();
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

/** 恢复文章 */
const handleRestore = async (row: Partial<BlogAdminArticleVO>) => {
  if (!row.articleId) return;
  await modal.confirm('是否确认恢复文章《' + (row.title || '未命名草稿') + '》？恢复后将重新对公众可见。');
  await restoreBlogAdminArticle(row.articleId);
  modal.msgSuccess('操作成功');
  await getList();
};

onMounted(() => {
  getList();
});
</script>
