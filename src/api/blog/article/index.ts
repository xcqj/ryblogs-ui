import type {
  BlogArticleDetailVO,
  BlogArticleForm,
  BlogArticleQuery,
  BlogArticleVO,
  BlogArticleVersionVO
} from '@/api/blog/article/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

/**
 * 作者自助接口组（契约 §3 / §4）：仅要求登录，不设按钮级权限；
 * 归属与状态判定全部由服务端按登录用户校验（AGENTS.md §5 红线），前端按钮显隐仅为体验。
 */

/** 创建文章（草稿，§3.1）→ 返回新文章ID */
export const addBlogArticle = (data: BlogArticleForm): AxiosPromise<string | number> => {
  return request({
    url: '/blog/article',
    method: 'post',
    data: data
  });
};

/** 我的文章列表（§3.2） */
export const listMyBlogArticle = (query?: BlogArticleQuery): AxiosPromise<PageResult<BlogArticleVO>> => {
  return request({
    url: '/blog/article/my',
    method: 'get',
    params: query
  });
};

/** 我的文章详情（§3.3，作者本人或管理员） */
export const getBlogArticle = (articleId: string | number): AxiosPromise<BlogArticleDetailVO> => {
  return request({
    url: '/blog/article/' + articleId,
    method: 'get'
  });
};

/** 保存文章（§3.4，内容实际变化时创建新版本并立即生效） */
export const saveBlogArticle = (articleId: string | number, data: BlogArticleForm) => {
  return request({
    url: '/blog/article/' + articleId,
    method: 'put',
    data: data
  });
};

/** 发布文章（§3.5，DRAFT → PUBLISHED） */
export const publishBlogArticle = (articleId: string | number) => {
  return request({
    url: '/blog/article/' + articleId + '/publish',
    method: 'post'
  });
};

/** 用户隐藏文章（§3.6，PUBLISHED 且非 ADMIN_HIDDEN：PUBLIC → USER_HIDDEN） */
export const hideBlogArticle = (articleId: string | number) => {
  return request({
    url: '/blog/article/' + articleId + '/hide',
    method: 'post'
  });
};

/** 重新公开文章（§3.7，USER_HIDDEN → PUBLIC） */
export const showBlogArticle = (articleId: string | number) => {
  return request({
    url: '/blog/article/' + articleId + '/show',
    method: 'post'
  });
};

/** 删除文章（§3.8，逻辑删除，仅作者本人，四种状态均可） */
export const delBlogArticle = (articleId: string | number) => {
  return request({
    url: '/blog/article/' + articleId,
    method: 'delete'
  });
};

/** 文章版本列表（§4.1，只读，版本号倒序） */
export const listBlogArticleVersions = (articleId: string | number): AxiosPromise<BlogArticleVersionVO[]> => {
  return request({
    url: '/blog/article/' + articleId + '/versions',
    method: 'get'
  });
};

/** 历史版本详情（§4.2，只读，含完整快照） */
export const getBlogArticleVersion = (
  articleId: string | number,
  versionId: string | number
): AxiosPromise<BlogArticleVersionVO> => {
  return request({
    url: '/blog/article/' + articleId + '/versions/' + versionId,
    method: 'get'
  });
};
