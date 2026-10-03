<template>
  <div class="p-2 app-container blog-article-edit-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="toolbar-shell">
          <div class="table-heading">
            <h3>{{ isEdit ? '编辑文章' : '写文章' }}</h3>
          </div>
          <div class="toolbar-actions">
            <el-button icon="Back" @click="handleBack">返回</el-button>
            <el-button :loading="buttonLoading" type="info" plain @click="submit(false)">保存草稿</el-button>
            <el-button
              v-if="canPublishNow"
              :loading="buttonLoading"
              type="primary"
              icon="Promotion"
              @click="submit(true)"
            >
              保存并发布
            </el-button>
          </div>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="article-form">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="200" show-word-limit placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="2"
            maxlength="500"
            show-word-limit
            placeholder="可选，列表展示用的纯文本摘要"
          />
        </el-form-item>
        <el-form-item label="标签" prop="tagNames">
          <el-select
            v-model="form.tagNames"
            multiple
            filterable
            allow-create
            default-first-option
            :reserve-keyword="false"
            :multiple-limit="6"
            placeholder="输入标签名后回车添加，1~6 个（新标签自动入库）"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="封面" prop="coverUrl">
          <div class="cover-uploader">
            <el-upload
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              accept="image/*"
              :before-upload="beforeCoverUpload"
              :on-success="onCoverSuccess"
              :on-error="onCoverError"
            >
              <el-image v-if="form.coverUrl" :src="form.coverUrl" fit="cover" class="cover-preview" />
              <div v-else class="cover-placeholder">
                <el-icon><Plus /></el-icon>
                <span>上传封面</span>
              </div>
            </el-upload>
            <el-button v-if="form.coverUrl" link type="danger" icon="Delete" @click="form.coverUrl = ''">
              移除封面
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <editor v-model="form.content" :min-height="420" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="BlogArticleEdit" lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { getBlogArticle, addBlogArticle, saveBlogArticle, publishBlogArticle } from '@/api/blog/article';
import { BlogArticleForm } from '@/api/blog/article/types';
import modal from '@/plugins/modal';
import { globalHeaders } from '@/utils/request';

/** 契约 §14：status 0草稿 1已发布；visibility 2管理员下线 */
const STATUS_DRAFT = '0';
const VISIBILITY_ADMIN_HIDDEN = '2';

const route = useRoute();
const router = useRouter();
const formRef = ref<ElFormInstance>();
const buttonLoading = ref(false);

const articleId = ref<string | number | undefined>(route.query.id ? String(route.query.id) : undefined);
const isEdit = computed(() => !!articleId.value);
// 加载到的当前状态：仅草稿（或未创建）显示“保存并发布”；已发布文章保存即生效，不再显示发布
const loadedStatus = ref<string>(STATUS_DRAFT);
const loadedVisibility = ref<string>('');
const canPublishNow = computed(
  () => loadedStatus.value === STATUS_DRAFT && loadedVisibility.value !== VISIBILITY_ADMIN_HIDDEN
);

const initForm: BlogArticleForm = { title: '', summary: '', coverUrl: '', content: '', tagNames: [] };
const form = ref<BlogArticleForm>({ ...initForm, tagNames: [] });

const rules = {
  title: [
    { required: true, message: '标题不能为空', trigger: 'blur' },
    { max: 200, message: '标题长度不能超过200个字符', trigger: 'blur' }
  ],
  content: [{ required: true, message: '正文不能为空', trigger: 'blur' }],
  tagNames: [
    {
      validator: (_rule: any, value: string[], callback: (err?: Error) => void) => {
        if (!value || value.length < 1 || value.length > 6) {
          callback(new Error('文章标签数量必须为 1~6 个'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

/* ==================== 封面上传（捕获 URL，贴合后端 coverUrl=URL 契约） ==================== */
const uploadUrl = import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload';
const uploadHeaders = computed(() => globalHeaders());

const beforeCoverUpload = (file: File) => {
  const isImg = file.type.startsWith('image/');
  if (!isImg) {
    modal.msgError('只能上传图片文件');
    return false;
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    modal.msgError('封面大小不能超过 5MB');
    return false;
  }
  return true;
};
const onCoverSuccess = (res: any) => {
  if (res.code === 200) {
    form.value.coverUrl = res.data.url;
  } else {
    modal.msgError(res.msg || '封面上传失败');
  }
};
const onCoverError = () => modal.msgError('封面上传失败');

/* ==================== 加载已有文章（编辑回填） ==================== */
const loadArticle = async (id: string | number) => {
  const res = await getBlogArticle(id);
  const d = res.data;
  if (!d) return;
  loadedStatus.value = d.status;
  loadedVisibility.value = d.visibility;
  const v = d.currentVersion;
  form.value = {
    title: v?.title ?? '',
    summary: v?.summary ?? '',
    coverUrl: v?.coverUrl ?? '',
    content: v?.content ?? '',
    tagNames: (d.tags || []).map(t => t.name)
  };
};

onMounted(() => {
  if (articleId.value) {
    loadArticle(articleId.value);
  }
});

/* ==================== 提交 ==================== */
const submit = (publish: boolean) => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      let id = articleId.value;
      if (id) {
        await saveBlogArticle(id, form.value);
      } else {
        const res = await addBlogArticle(form.value);
        id = res.data;
        articleId.value = id;
      }
      if (publish && id) {
        await publishBlogArticle(id);
        modal.msgSuccess('发布成功');
        handleBack();
      } else {
        modal.msgSuccess('已保存草稿');
      }
    } finally {
      buttonLoading.value = false;
    }
  });
};

const handleBack = () => {
  router.push({ path: '/blog-article/index' });
};
</script>

<style lang="scss" scoped>
.article-form {
  max-width: 1000px;
}

.cover-uploader {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.cover-preview,
.cover-placeholder {
  width: 148px;
  height: 96px;
  border: 1px dashed var(--el-border-color);
  border-radius: var(--el-border-radius-base);
}

.cover-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  gap: 4px;
  cursor: pointer;

  &:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }
}
</style>
