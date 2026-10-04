<template>
  <div class="p-2 app-container blog-adminTag-page">
    <div class="search-wrap">
      <el-card shadow="hover" class="search-panel" :class="{ 'is-collapsed': !showSearch }">
        <template #header>
          <div class="panel-heading search-panel-toggle" @click.stop="showSearch = !showSearch">
            <div><h3>筛选条件</h3></div>
          </div>
        </template>
        <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form">
          <el-form-item label="名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入标签名称" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 140px">
              <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="精选" prop="isFeatured">
            <el-select v-model="queryParams.isFeatured" placeholder="全部" clearable style="width: 120px">
              <el-option v-for="opt in featuredOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
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
            <h3>博客标签治理</h3>
          </div>
          <div class="toolbar-actions">
            <right-toolbar v-model:show-search="showSearch" :search="false" @query-table="getList"></right-toolbar>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" border class="data-table" :data="tagList">
        <el-table-column label="标签ID" align="center" prop="tagId" width="100" />
        <el-table-column label="名称" align="left" prop="name" min-width="140" show-overflow-tooltip />
        <el-table-column label="slug" align="left" prop="slug" min-width="140" show-overflow-tooltip />
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === TAG_STATUS.MERGED ? 'info' : 'success'">
              {{ statusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="精选" align="center" prop="isFeatured" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.isFeatured === FEATURED.YES ? 'warning' : 'info'">
              {{ scope.row.isFeatured === FEATURED.YES ? '精选' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="展示顺序" align="center" prop="sortOrder" width="90" />
        <el-table-column label="合并目标" align="center" min-width="140" show-overflow-tooltip>
          <template #default="scope">
            <span v-if="scope.row.status === TAG_STATUS.MERGED">
              {{ tagNameMap[String(scope.row.mergedInto)] || '#' + scope.row.mergedInto }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="170" />
        <el-table-column label="操作" align="center" width="180" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="运营属性" placement="top">
              <el-button
                v-hasPermi="['blog:tag:edit']"
                link
                type="primary"
                icon="Star"
                @click="handleOps(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip v-if="scope.row.status === TAG_STATUS.ACTIVE" content="重命名" placement="top">
              <el-button
                v-hasPermi="['blog:tag:rename']"
                link
                type="primary"
                icon="Edit"
                @click="handleRename(scope.row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip v-if="scope.row.status === TAG_STATUS.ACTIVE" content="删除" placement="top">
              <el-button
                v-hasPermi="['blog:tag:remove']"
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

    <!-- 运营属性更新对话框（契约 §13.3，仅 isFeatured/sortOrder） -->
    <el-dialog v-model="opsDialog.visible" :title="opsDialog.title" width="460px" append-to-body>
      <el-form ref="opsFormRef" :model="opsForm" :rules="opsRules" label-width="90px">
        <el-form-item label="标签">
          <span>{{ currentTag?.name }}</span>
        </el-form-item>
        <el-form-item label="是否精选" prop="isFeatured">
          <el-switch v-model="opsForm.isFeatured" :active-value="FEATURED.YES" :inactive-value="FEATURED.NO" />
        </el-form-item>
        <el-form-item label="展示顺序" prop="sortOrder">
          <el-input-number v-model="opsForm.sortOrder" :min="0" controls-position="right" />
          <span class="ml-2 text-gray-400">越小越靠前</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitOps">确 定</el-button>
          <el-button @click="opsDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 重命名对话框（契约 §13.4，name 必填 ≤50） -->
    <el-dialog v-model="renameDialog.visible" :title="renameDialog.title" width="460px" append-to-body>
      <el-form ref="renameFormRef" :model="renameForm" :rules="renameRules" label-width="90px">
        <el-form-item label="原名称">
          <span>{{ currentTag?.name }}</span>
        </el-form-item>
        <el-form-item label="新名称" prop="name">
          <el-input v-model="renameForm.name" maxlength="50" show-word-limit placeholder="请输入新的标签名称" />
        </el-form-item>
        <el-form-item>
          <span class="text-gray-400">旧名称与 slug 将自动保留为别名，标签 ID 不变。</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitRename">确 定</el-button>
          <el-button @click="renameDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="BlogAdminTag" lang="ts">
import {
  listBlogAdminTag,
  updateBlogTagOps,
  renameBlogTag,
  delBlogAdminTag,
  getBlogAdminTag
} from '@/api/blog/adminTag';
import { BlogAdminTagVO, BlogAdminTagQuery, BlogTagOpsForm, BlogTagRenameForm } from '@/api/blog/adminTag/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useDialogState } from '@/hooks/dialog/useDialogState';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useSearchToggle } from '@/hooks/form/useSearchToggle';
import modal from '@/plugins/modal';

/** 契约 §13 常量：status 0=正常(ACTIVE) 1=已合并(MERGED)；isFeatured 0否 1是 */
const TAG_STATUS = { ACTIVE: '0', MERGED: '1' } as const;
const FEATURED = { NO: '0', YES: '1' } as const;

const statusOptions = [
  { value: TAG_STATUS.ACTIVE, label: '正常' },
  { value: TAG_STATUS.MERGED, label: '已合并' }
];
const featuredOptions = [
  { value: FEATURED.NO, label: '普通' },
  { value: FEATURED.YES, label: '精选' }
];
const statusLabel = (v: string) => statusOptions.find(o => o.value === v)?.label ?? v;

const tagList = ref<BlogAdminTagVO[]>([]);
// tagId→name 缓存：合并目标列展示目标标签名而非裸 ID
const tagNameMap = reactive<Record<string, string>>({});
const buttonLoading = ref(false);
const { loading, withLoading } = useLoading(true);
const { showSearch } = useSearchToggle();
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const opsFormRef = ref<ElFormInstance>();
const renameFormRef = ref<ElFormInstance>();
const currentTag = ref<Partial<BlogAdminTagVO>>();

const queryParams = ref<BlogAdminTagQuery>({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  status: undefined,
  isFeatured: undefined
});

const initOpsForm: BlogTagOpsForm = { isFeatured: FEATURED.NO, sortOrder: 0 };
const opsForm = ref<BlogTagOpsForm>({ ...initOpsForm });
const opsRules = {
  sortOrder: [{ required: true, message: '展示顺序不能为空', trigger: 'blur' }]
};
const { dialog: opsDialog, openDialog: openOpsDialog } = useDialogState('运营属性设置');

const initRenameForm: BlogTagRenameForm = { name: '' };
const renameForm = ref<BlogTagRenameForm>({ ...initRenameForm });
const renameRules = {
  name: [
    { required: true, message: '标签名称不能为空', trigger: 'blur' },
    { max: 50, message: '标签名称长度不能超过50个字符', trigger: 'blur' }
  ]
};
const { dialog: renameDialog, openDialog: openRenameDialog } = useDialogState('重命名标签');

/** 解析合并目标名称：先用当前页行种子，缺失的（跨页 MERGED 目标）按需拉详情补全 */
const resolveTagNames = async (rows: BlogAdminTagVO[]) => {
  rows.forEach(r => {
    if (r.tagId) tagNameMap[String(r.tagId)] = r.name;
  });
  const missing = [
    ...new Set(rows.filter(r => r.status === TAG_STATUS.MERGED && r.mergedInto).map(r => String(r.mergedInto)))
  ].filter(id => !tagNameMap[id]);
  await Promise.all(
    missing.map(async id => {
      try {
        const res = await getBlogAdminTag(id);
        if (res.data) tagNameMap[id] = res.data.name;
      } catch {
        /* 拉取失败则回落显示 ID，不阻断列表 */
      }
    })
  );
};

/** 查询列表 */
const getList = async () => {
  await withLoading(async () => {
    const res = await listBlogAdminTag(queryParams.value);
    tagList.value = res.data?.rows;
    total.value = res.data?.total;
  });
  resolveTagNames(tagList.value);
};

/** 搜索 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置 */
const { resetQuery } = useSearchReset<BlogAdminTagQuery>({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  afterReset: () => {
    handleQuery();
  }
});

/** 打开运营属性对话框 */
const handleOps = (row: Partial<BlogAdminTagVO>) => {
  if (!row.tagId) return;
  currentTag.value = row;
  opsForm.value = {
    isFeatured: row.isFeatured ?? FEATURED.NO,
    sortOrder: row.sortOrder ?? 0
  };
  openOpsDialog('运营属性设置');
  nextTick(() => opsFormRef.value?.clearValidate());
};

/** 提交运营属性 */
const submitOps = () => {
  opsFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    const tagId = currentTag.value?.tagId;
    if (!tagId) return;
    buttonLoading.value = true;
    try {
      await updateBlogTagOps(tagId, opsForm.value);
      modal.msgSuccess('操作成功');
      opsDialog.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

/** 打开重命名对话框 */
const handleRename = (row: Partial<BlogAdminTagVO>) => {
  if (!row.tagId) return;
  currentTag.value = row;
  renameForm.value = { name: '' };
  openRenameDialog('重命名标签');
  nextTick(() => renameFormRef.value?.clearValidate());
};

/** 提交重命名 */
const submitRename = () => {
  renameFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    const tagId = currentTag.value?.tagId;
    if (!tagId) return;
    buttonLoading.value = true;
    try {
      await renameBlogTag(tagId, renameForm.value);
      modal.msgSuccess('重命名成功');
      renameDialog.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

/** 删除标签（契约 §13.6，仅 ACTIVE） */
const handleDelete = async (row: Partial<BlogAdminTagVO>) => {
  if (!row.tagId) return;
  await modal.confirm('是否确认删除标签《' + row.name + '》？将解除其与文章的关联（逻辑删除）。');
  await delBlogAdminTag(row.tagId);
  modal.msgSuccess('删除成功');
  await getList();
};

onMounted(() => {
  getList();
});
</script>
