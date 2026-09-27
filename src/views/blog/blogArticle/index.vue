<template>
  <div class="p-2 page-shell blog-blogArticle-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>筛选条件</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
            <el-form-item label="作者用户ID" prop="authorId">
              <el-input-number v-model="queryParams.authorId" controls-position="right" />
            </el-form-item>
            <el-form-item label="文章URL标识，MVP预留，全局唯一" prop="slug">
              <el-input v-model="queryParams.slug" placeholder="请输入文章URL标识，MVP预留，全局唯一" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="文章状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择文章状态" clearable >
                <el-option label="请选择字典生成" value="" />
              </el-select>
            </el-form-item>
            <el-form-item label="可见性" prop="visibility">
              <el-select v-model="queryParams.visibility" placeholder="请选择可见性" clearable >
                <el-option label="请选择字典生成" value="" />
              </el-select>
            </el-form-item>
            <el-form-item label="当前生效版本ID" prop="currentVersionId">
              <el-input-number v-model="queryParams.currentVersionId" controls-position="right" />
            </el-form-item>
            <el-form-item label="阅读量" prop="viewCount">
              <el-input-number v-model="queryParams.viewCount" controls-position="right" />
            </el-form-item>
            <el-form-item label="首次发布时间" style="width: 308px">
              <el-date-picker
                v-model="dateRangePublishedAt"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              />
            </el-form-item>
            <el-form-item label="管理员下线原因" prop="adminHiddenReason">
              <el-input v-model="queryParams.adminHiddenReason" placeholder="请输入管理员下线原因" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="执行管理员下线的用户ID" prop="adminHiddenBy">
              <el-input-number v-model="queryParams.adminHiddenBy" controls-position="right" />
            </el-form-item>
            <el-form-item label="管理员下线时间" style="width: 308px">
              <el-date-picker
                v-model="dateRangeAdminHiddenTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              />
            </el-form-item>
            <el-form-item label="创建者" prop="createBy">
              <el-input-number v-model="queryParams.createBy" controls-position="right" />
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
            <el-form-item label="更新者" prop="updateBy">
              <el-input-number v-model="queryParams.updateBy" controls-position="right" />
            </el-form-item>
            <el-form-item label="更新时间" style="width: 308px">
              <el-date-picker
                v-model="dateRangeUpdateTime"
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
            <h3>博客文章列表</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['blog:blogArticle:add']">新增</el-button>
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['blog:blogArticle:edit']">修改</el-button>
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['blog:blogArticle:remove']">删除</el-button>
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['blog:blogArticle:export']">导出</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="blogArticleList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="文章ID" align="center" prop="articleId" />
        <el-table-column label="作者用户ID" align="center" prop="authorId" />
        <el-table-column label="文章URL标识，MVP预留，全局唯一" align="center" prop="slug" />
        <el-table-column label="文章状态" align="center" prop="status" />
        <el-table-column label="可见性" align="center" prop="visibility" />
        <el-table-column label="当前生效版本ID" align="center" prop="currentVersionId" />
        <el-table-column label="阅读量" align="center" prop="viewCount" />
        <el-table-column label="首次发布时间" align="center" prop="publishedAt" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.publishedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="管理员下线原因" align="center" prop="adminHiddenReason" />
        <el-table-column label="执行管理员下线的用户ID" align="center" prop="adminHiddenBy" />
        <el-table-column label="管理员下线时间" align="center" prop="adminHiddenTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.adminHiddenTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建者" align="center" prop="createBy" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新者" align="center" prop="updateBy" />
        <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['blog:blogArticle:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['blog:blogArticle:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改博客文章对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="blogArticleFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="作者用户ID" prop="authorId">
          <el-input-number v-model="form.authorId" controls-position="right" />
        </el-form-item>
        <el-form-item label="文章URL标识，MVP预留，全局唯一" prop="slug">
          <el-input v-model="form.slug" placeholder="请输入文章URL标识，MVP预留，全局唯一" />
        </el-form-item>
        <el-form-item label="文章状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="1">请选择字典生成</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="可见性" prop="visibility">
          <el-radio-group v-model="form.visibility">
            <el-radio value="1">请选择字典生成</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="当前生效版本ID" prop="currentVersionId">
          <el-input-number v-model="form.currentVersionId" controls-position="right" />
        </el-form-item>
        <el-form-item label="阅读量" prop="viewCount">
          <el-input-number v-model="form.viewCount" controls-position="right" />
        </el-form-item>
        <el-form-item label="首次发布时间" prop="publishedAt">
          <el-date-picker clearable
            v-model="form.publishedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择首次发布时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="管理员下线原因" prop="adminHiddenReason">
            <el-input v-model="form.adminHiddenReason" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="执行管理员下线的用户ID" prop="adminHiddenBy">
          <el-input-number v-model="form.adminHiddenBy" controls-position="right" />
        </el-form-item>
        <el-form-item label="管理员下线时间" prop="adminHiddenTime">
          <el-date-picker clearable
            v-model="form.adminHiddenTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择管理员下线时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="创建部门" prop="createDept">
          <el-input-number v-model="form.createDept" controls-position="right" />
        </el-form-item>
        <el-form-item label="创建者" prop="createBy">
          <el-input-number v-model="form.createBy" controls-position="right" />
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker clearable
            v-model="form.createTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择创建时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="更新者" prop="updateBy">
          <el-input-number v-model="form.updateBy" controls-position="right" />
        </el-form-item>
        <el-form-item label="更新时间" prop="updateTime">
          <el-date-picker clearable
            v-model="form.updateTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择更新时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="BlogArticle" lang="ts">
import {
  addBlogArticle,
  delBlogArticle,
  getBlogArticle,
  listBlogArticle,
  updateBlogArticle
} from '@/api/blog/blogArticle';
import { BlogArticleForm, BlogArticleQuery, BlogArticleVO } from '@/api/blog/blogArticle/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useDateRangeQuery } from '@/hooks/form/useDateRangeQuery';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import { parseTime } from '@/utils/ruoyi';
import modal from '@/plugins/modal';
import { download as requestDownload } from '@/utils/request';



const blogArticleList = ref<BlogArticleVO[]>([]);
const buttonLoading = ref(false);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const total = ref(0);
const {
  dateRange: dateRangePublishedAt,
  applyDateRange: applyPublishedAtDateRange,
  resetDateRange: resetPublishedAtDateRange
} = useDateRangeQuery('PublishedAt');
const {
  dateRange: dateRangeAdminHiddenTime,
  applyDateRange: applyAdminHiddenTimeDateRange,
  resetDateRange: resetAdminHiddenTimeDateRange
} = useDateRangeQuery('AdminHiddenTime');
const {
  dateRange: dateRangeCreateTime,
  applyDateRange: applyCreateTimeDateRange,
  resetDateRange: resetCreateTimeDateRange
} = useDateRangeQuery('CreateTime');
const {
  dateRange: dateRangeUpdateTime,
  applyDateRange: applyUpdateTimeDateRange,
  resetDateRange: resetUpdateTimeDateRange
} = useDateRangeQuery('UpdateTime');

const queryFormRef = ref<ElFormInstance>();
const blogArticleFormRef = ref<ElFormInstance>();

const initFormData: BlogArticleForm = {
  articleId: undefined,
  authorId: undefined,
  slug: undefined,
  status: undefined,
  visibility: undefined,
  currentVersionId: undefined,
  viewCount: undefined,
  publishedAt: undefined,
  adminHiddenReason: undefined,
  adminHiddenBy: undefined,
  adminHiddenTime: undefined,
  createDept: undefined,
  createBy: undefined,
  createTime: undefined,
  updateBy: undefined,
  updateTime: undefined,
}
const data = reactive<PageData<BlogArticleForm, BlogArticleQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    authorId: undefined,
    slug: undefined,
    status: undefined,
    visibility: undefined,
    currentVersionId: undefined,
    viewCount: undefined,
    adminHiddenReason: undefined,
    adminHiddenBy: undefined,
    createBy: undefined,
    updateBy: undefined,
    params: {
      publishedAt: undefined,
      adminHiddenTime: undefined,
      createTime: undefined,
      updateTime: undefined,
    }
  },
  rules: {
articleId: [
      { required: true, message: "文章ID不能为空", trigger: "change" }
    ],
authorId: [
      { required: true, message: "作者用户ID不能为空", trigger: "change" }
    ],
status: [
      { required: true, message: "文章状态不能为空", trigger: "change" }
    ],
visibility: [
      { required: true, message: "可见性不能为空", trigger: "change" }
    ],
currentVersionId: [
      { required: true, message: "当前生效版本ID不能为空", trigger: "change" }
    ],
viewCount: [
      { required: true, message: "阅读量不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<BlogArticleVO>(item => item.articleId);
const { dialog, resetForm: reset, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: blogArticleFormRef,
  initialFormData: initFormData
});

/** 查询博客文章列表 */
const getList = async () => {
  await withLoading(async () => {
    let params = queryParams.value;
params = applyPublishedAtDateRange(params);
params = applyAdminHiddenTimeDateRange(params);
params = applyCreateTimeDateRange(params);
params = applyUpdateTimeDateRange(params);
    const res = await listBlogArticle(params);
    blogArticleList.value = res.data?.rows;
    total.value = res.data?.total;
  });
};

/** 取消按钮 */
const cancel = () => {
  reset();
  closeDialog();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const { resetQuery } = useSearchReset({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  pageSizeKey: 'pageSize',
  initialPageSize: 10,
  resetExtras: () => {
resetPublishedAtDateRange();
resetAdminHiddenTimeDateRange();
resetCreateTimeDateRange();
resetUpdateTimeDateRange();
  },
  afterReset: () => {
    handleQuery();
  }
});

/** 新增按钮操作 */
const handleAdd = () => {
  openDialog('添加博客文章');
};

/** 修改按钮操作 */
const handleUpdate = async (row?: Partial<BlogArticleVO>) => {
  reset();
  const _articleId = row?.articleId || ids.value[0];
  const res = await getBlogArticle(_articleId);
  Object.assign(form.value, res.data);
  showDialog('修改博客文章');
};

/** 提交按钮 */
const submitForm = () => {
  blogArticleFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.articleId) {
        await updateBlogArticle(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addBlogArticle(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess('操作成功');
      closeDialog();
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: Partial<BlogArticleVO>) => {
  const _articleIds = row?.articleId || ids.value;
  await modal.confirm('是否确认删除博客文章编号为"' + _articleIds + '"的数据项？');
  await delBlogArticle(_articleIds);
  modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  requestDownload(
    'blog/blogArticle/export',
    {
      ...queryParams.value
    },
    `blogArticle_${new Date().getTime()}.xlsx`
  );
};



onMounted(() => {
  getList();
});
</script>

