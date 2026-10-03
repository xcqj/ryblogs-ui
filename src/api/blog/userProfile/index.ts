import type { BlogProfileForm, BlogUserProfileVO } from '@/api/blog/userProfile/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 查询自己的博客资料（契约 §8.1，仅登录，不设按钮权限）
 */
export const getBlogProfile = (): AxiosPromise<BlogUserProfileVO> => {
  return request({
    url: '/blog/user/profile',
    method: 'get'
  });
};

/**
 * 修改自己的博客资料（契约 §8.2，首次填写自动建记录；userId 由后端取登录上下文）
 */
export const updateBlogProfile = (data: BlogProfileForm) => {
  return request({
    url: '/blog/user/profile',
    method: 'put',
    data: data
  });
};
