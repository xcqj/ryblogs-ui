import type {
  BlogAdminTagQuery,
  BlogAdminTagVO,
  BlogTagMergeForm,
  BlogTagOpsForm,
  BlogTagRenameForm
} from '@/api/blog/adminTag/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 标签管理列表（契约 §13.1，权限 blog:tag:list）：可见 ACTIVE/MERGED
 */
export const listBlogAdminTag = (query?: BlogAdminTagQuery): AxiosPromise<PageResult<BlogAdminTagVO>> => {
  return request({
    url: '/blog/admin/tags',
    method: 'get',
    params: query
  });
};

/**
 * 标签详情（契约 §13.2，权限 blog:tag:query）
 */
export const getBlogAdminTag = (tagId: string | number): AxiosPromise<BlogAdminTagVO> => {
  return request({
    url: '/blog/admin/tags/' + tagId,
    method: 'get'
  });
};

/**
 * 更新运营属性（契约 §13.3，权限 blog:tag:edit）：仅 isFeatured/sortOrder
 */
export const updateBlogTagOps = (tagId: string | number, data: BlogTagOpsForm) => {
  return request({
    url: '/blog/admin/tags/' + tagId,
    method: 'put',
    data: data
  });
};

/**
 * 重命名标签（契约 §13.4，权限 blog:tag:rename）：旧 name/slug 保留为 alias，tag_id 不变
 */
export const renameBlogTag = (tagId: string | number, data: BlogTagRenameForm) => {
  return request({
    url: '/blog/admin/tags/' + tagId + '/rename',
    method: 'put',
    data: data
  });
};

/**
 * 合并标签（契约 §13.5，权限 blog:tag:merge）：源标签关系迁移到目标，源置 MERGED，事务六步不可逆
 */
export const mergeBlogTag = (tagId: string | number, data: BlogTagMergeForm) => {
  return request({
    url: '/blog/admin/tags/' + tagId + '/merge',
    method: 'post',
    data: data
  });
};

/**
 * 删除垃圾标签（契约 §13.6，权限 blog:tag:remove）：解除关系 + 逻辑删除，不建 alias
 */
export const delBlogAdminTag = (tagId: string | number) => {
  return request({
    url: '/blog/admin/tags/' + tagId,
    method: 'delete'
  });
};
