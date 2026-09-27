<template>
  <div class="p-2 page-shell blog-blogUserProfile-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>筛选条件</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
            <el-form-item label="用户ID，RuoYi sys_user.user_id，同时作为主键" prop="userId">
              <el-input-number v-model="queryParams.userId" controls-position="right" />
            </el-form-item>
            <el-form-item label="个人简介" prop="bio">
              <el-input v-model="queryParams.bio" placeholder="请输入个人简介" clearable @keyup.enter="handleQuery" />
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
            <h3>博客用户资料列表</h3>
          </div>
          <div class="toolbar-actions">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['blog:blogUserProfile:add']">新增</el-button>
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['blog:blogUserProfile:edit']">修改</el-button>
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['blog:blogUserProfile:remove']">删除</el-button>
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['blog:blogUserProfile:export']">导出</el-button>
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="blogUserProfileList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="用户ID，RuoYi sys_user.user_id，同时作为主键" align="center" prop="userId" />
        <el-table-column label="个人简介" align="center" prop="bio" />
        <el-table-column label="创建者" align="center" prop="createBy" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['blog:blogUserProfile:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['blog:blogUserProfile:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改博客用户资料对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="blogUserProfileFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="个人简介" prop="bio">
            <el-input v-model="form.bio" type="textarea" placeholder="请输入内容" />
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

<script setup name="BlogUserProfile" lang="ts">
import {
  addBlogUserProfile,
  delBlogUserProfile,
  getBlogUserProfile,
  listBlogUserProfile,
  updateBlogUserProfile
} from '@/api/blog/blogUserProfile';
import { BlogUserProfileForm, BlogUserProfileQuery, BlogUserProfileVO } from '@/api/blog/blogUserProfile/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useDateRangeQuery } from '@/hooks/form/useDateRangeQuery';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import { parseTime } from '@/utils/ruoyi';
import modal from '@/plugins/modal';
import { download as requestDownload } from '@/utils/request';



const blogUserProfileList = ref<BlogUserProfileVO[]>([]);
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
const blogUserProfileFormRef = ref<ElFormInstance>();

const initFormData: BlogUserProfileForm = {
  userId: undefined,
  bio: undefined,
  createDept: undefined,
  createBy: undefined,
  createTime: undefined,
  updateBy: undefined,
  updateTime: undefined,
}
const data = reactive<PageData<BlogUserProfileForm, BlogUserProfileQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: undefined,
    bio: undefined,
    createBy: undefined,
    params: {
      createTime: undefined,
    }
  },
  rules: {
userId: [
      { required: true, message: "用户ID，RuoYi sys_user.user_id，同时作为主键不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<BlogUserProfileVO>(item => item.userId);
const { dialog, resetForm: reset, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: blogUserProfileFormRef,
  initialFormData: initFormData
});

/** 查询博客用户资料列表 */
const getList = async () => {
  await withLoading(async () => {
    let params = queryParams.value;
params = applyCreateTimeDateRange(params);
    const res = await listBlogUserProfile(params);
    blogUserProfileList.value = res.data?.rows;
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
  openDialog('添加博客用户资料');
};

/** 修改按钮操作 */
const handleUpdate = async (row?: Partial<BlogUserProfileVO>) => {
  reset();
  const _userId = row?.userId || ids.value[0];
  const res = await getBlogUserProfile(_userId);
  Object.assign(form.value, res.data);
  showDialog('修改博客用户资料');
};

/** 提交按钮 */
const submitForm = () => {
  blogUserProfileFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.userId) {
        await updateBlogUserProfile(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addBlogUserProfile(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess('操作成功');
      closeDialog();
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: Partial<BlogUserProfileVO>) => {
  const _userIds = row?.userId || ids.value;
  await modal.confirm('是否确认删除博客用户资料编号为"' + _userIds + '"的数据项？');
  await delBlogUserProfile(_userIds);
  modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  requestDownload(
    'blog/blogUserProfile/export',
    {
      ...queryParams.value
    },
    `blogUserProfile_${new Date().getTime()}.xlsx`
  );
};



onMounted(() => {
  getList();
});
</script>

