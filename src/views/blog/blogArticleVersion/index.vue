<template>
  <div class="p-2 page-shell blog-blogArticleVersion-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>筛选条件</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
            <el-form-item label="所属文章ID" prop="articleId">
              <el-input-number v-model="queryParams.articleId" controls-position="right" />
            </el-form-item>
            <el-form-item label="文章版本号，从1开始递增" prop="versionNo">
              <el-input-number v-model="queryParams.versionNo" controls-position="right" />
            </el-form-item>
            <el-form-item label="文章标题快照" prop="title">
              <el-input v-model="queryParams.title" placeholder="请输入文章标题快照" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="文章摘要快照" prop="summary">
              <el-input v-model="queryParams.summary" placeholder="请输入文章摘要快照" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="该版本创建者" prop="createBy">
              <el-input-number v-model="queryParams.createBy" controls-position="right" />
            </el-form-item>
            <el-form-item label="版本创建时间" style="width: 308px">
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
            <h3>博客文章版本历史列表</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['blog:blogArticleVersion:add']">新增</el-button>
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['blog:blogArticleVersion:edit']">修改</el-button>
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['blog:blogArticleVersion:remove']">删除</el-button>
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['blog:blogArticleVersion:export']">导出</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="blogArticleVersionList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="文章版本ID" align="center" prop="versionId" />
        <el-table-column label="所属文章ID" align="center" prop="articleId" />
        <el-table-column label="文章版本号，从1开始递增" align="center" prop="versionNo" />
        <el-table-column label="文章标题快照" align="center" prop="title" />
        <el-table-column label="文章摘要快照" align="center" prop="summary" />
        <el-table-column label="文章封面URL快照" align="center" prop="coverUrl" />
        <el-table-column label="文章正文HTML快照" align="center" prop="content" />
        <el-table-column label="该版本创建者" align="center" prop="createBy" />
        <el-table-column label="版本创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['blog:blogArticleVersion:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['blog:blogArticleVersion:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改博客文章版本历史对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="blogArticleVersionFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="所属文章ID" prop="articleId">
          <el-input-number v-model="form.articleId" controls-position="right" />
        </el-form-item>
        <el-form-item label="文章版本号，从1开始递增" prop="versionNo">
          <el-input-number v-model="form.versionNo" controls-position="right" />
        </el-form-item>
        <el-form-item label="文章标题快照" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题快照" />
        </el-form-item>
        <el-form-item label="文章摘要快照" prop="summary">
            <el-input v-model="form.summary" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="文章封面URL快照" prop="coverUrl">
            <el-input v-model="form.coverUrl" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="文章正文HTML快照">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
        <el-form-item label="创建部门" prop="createDept">
          <el-input-number v-model="form.createDept" controls-position="right" />
        </el-form-item>
        <el-form-item label="该版本创建者" prop="createBy">
          <el-input-number v-model="form.createBy" controls-position="right" />
        </el-form-item>
        <el-form-item label="版本创建时间" prop="createTime">
          <el-date-picker clearable
            v-model="form.createTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择版本创建时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="统一审计字段，业务层禁止更新" prop="updateBy">
          <el-input-number v-model="form.updateBy" controls-position="right" />
        </el-form-item>
        <el-form-item label="统一审计字段，业务层禁止更新" prop="updateTime">
          <el-date-picker clearable
            v-model="form.updateTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择统一审计字段，业务层禁止更新">
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

<script setup name="BlogArticleVersion" lang="ts">
import {
  addBlogArticleVersion,
  delBlogArticleVersion,
  getBlogArticleVersion,
  listBlogArticleVersion,
  updateBlogArticleVersion
} from '@/api/blog/blogArticleVersion';
import { BlogArticleVersionForm, BlogArticleVersionQuery, BlogArticleVersionVO } from '@/api/blog/blogArticleVersion/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useDateRangeQuery } from '@/hooks/form/useDateRangeQuery';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import { parseTime } from '@/utils/ruoyi';
import modal from '@/plugins/modal';
import { download as requestDownload } from '@/utils/request';



const blogArticleVersionList = ref<BlogArticleVersionVO[]>([]);
const buttonLoading = ref(false);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const total = ref(0);
const {
  dateRange: dateRangeCreateTime,
  applyDateRange: applyCreateTimeDateRange,
  resetDateRange: resetCreateTimeDateRange
} = useDateRangeQuery('CreateTime');

const queryFormRef = ref<ElFormInstance>();
const blogArticleVersionFormRef = ref<ElFormInstance>();

const initFormData: BlogArticleVersionForm = {
  versionId: undefined,
  articleId: undefined,
  versionNo: undefined,
  title: undefined,
  summary: undefined,
  coverUrl: undefined,
  content: undefined,
  createDept: undefined,
  createBy: undefined,
  createTime: undefined,
  updateBy: undefined,
  updateTime: undefined,
}
const data = reactive<PageData<BlogArticleVersionForm, BlogArticleVersionQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    articleId: undefined,
    versionNo: undefined,
    title: undefined,
    summary: undefined,
    content: undefined,
    createBy: undefined,
    params: {
      createTime: undefined,
    }
  },
  rules: {
versionId: [
      { required: true, message: "文章版本ID不能为空", trigger: "change" }
    ],
articleId: [
      { required: true, message: "所属文章ID不能为空", trigger: "change" }
    ],
versionNo: [
      { required: true, message: "文章版本号，从1开始递增不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<BlogArticleVersionVO>(item => item.versionId);
const { dialog, resetForm: reset, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: blogArticleVersionFormRef,
  initialFormData: initFormData
});

/** 查询博客文章版本历史列表 */
const getList = async () => {
  await withLoading(async () => {
    let params = queryParams.value;
params = applyCreateTimeDateRange(params);
    const res = await listBlogArticleVersion(params);
    blogArticleVersionList.value = res.data?.rows;
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
resetCreateTimeDateRange();
  },
  afterReset: () => {
    handleQuery();
  }
});

/** 新增按钮操作 */
const handleAdd = () => {
  openDialog('添加博客文章版本历史');
};

/** 修改按钮操作 */
const handleUpdate = async (row?: Partial<BlogArticleVersionVO>) => {
  reset();
  const _versionId = row?.versionId || ids.value[0];
  const res = await getBlogArticleVersion(_versionId);
  Object.assign(form.value, res.data);
  showDialog('修改博客文章版本历史');
};

/** 提交按钮 */
const submitForm = () => {
  blogArticleVersionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.versionId) {
        await updateBlogArticleVersion(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addBlogArticleVersion(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess('操作成功');
      closeDialog();
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: Partial<BlogArticleVersionVO>) => {
  const _versionIds = row?.versionId || ids.value;
  await modal.confirm('是否确认删除博客文章版本历史编号为"' + _versionIds + '"的数据项？');
  await delBlogArticleVersion(_versionIds);
  modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  requestDownload(
    'blog/blogArticleVersion/export',
    {
      ...queryParams.value
    },
    `blogArticleVersion_${new Date().getTime()}.xlsx`
  );
};



onMounted(() => {
  getList();
});
</script>

