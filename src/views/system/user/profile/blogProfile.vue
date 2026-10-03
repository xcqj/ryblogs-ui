<template>
  <el-form ref="blogRef" :model="form" :rules="rules" label-width="80px" class="profile-form">
    <el-form-item label="昵称">
      <span>{{ profile.nickName || '-' }}</span>
      <span class="hint">昵称与头像在「基本资料」维护</span>
    </el-form-item>
    <el-form-item label="博客简介" prop="bio">
      <el-input
        v-model="form.bio"
        type="textarea"
        :rows="4"
        maxlength="500"
        show-word-limit
        placeholder="介绍一下你自己（最多 500 字，可留空）"
      />
    </el-form-item>
    <el-form-item class="profile-form__actions">
      <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import type { BlogProfileForm, BlogUserProfileVO } from '@/api/blog/userProfile/types';
import { getBlogProfile, updateBlogProfile } from '@/api/blog/userProfile';
import modal from '@/plugins/modal';

const blogRef = ref<ElFormInstance>();
const saving = ref(false);
const profile = ref<Partial<BlogUserProfileVO>>({});
const form = ref<BlogProfileForm>({ bio: '' });
const rules: ElFormRules = {
  bio: [{ max: 500, message: '个人简介长度不能超过500个字符', trigger: 'blur' }]
};

/** 加载自己的博客资料 */
const load = async () => {
  const res = await getBlogProfile();
  profile.value = res.data || {};
  form.value.bio = profile.value.bio || '';
};

/** 保存 bio（userId 由后端按登录用户强制取，前端不传） */
const submit = () => {
  blogRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    saving.value = true;
    try {
      await updateBlogProfile({ bio: form.value.bio });
      modal.msgSuccess('保存成功');
      await load();
    } finally {
      saving.value = false;
    }
  });
};

onMounted(() => {
  load();
});
</script>

<style lang="scss" scoped>
.profile-form {
  max-width: 520px;
}

.hint {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.profile-form :deep(.el-button) {
  border-radius: 10px;
}

.profile-form__actions :deep(.el-form-item__content) {
  display: flex;
  gap: 8px;
}
</style>
