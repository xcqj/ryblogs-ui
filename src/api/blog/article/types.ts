/**
 * 文章标签（列表/详情内嵌，对应 SdBlogTagVo 的作者视角子集）
 */
export interface BlogTagVO {
  tagId: string | number;
  name: string;
  slug: string;
}

/**
 * 文章版本快照（契约 §4，对应 SdBlogArticleVersionVo，append-only 只读）
 */
export interface BlogArticleVersionVO {
  versionId: string | number;
  articleId: string | number;
  /**
   * 版本号，从 1 递增
   */
  versionNo: number;
  title: string;
  summary?: string;
  coverUrl?: string;
  content: string;
  createBy?: string | number;
  createTime?: string;
}

/**
 * 我的文章列表项（契约 §3.2，对应 BlogArticleListItemVo）
 */
export interface BlogArticleVO {
  articleId: string | number;
  authorId: string | number;
  authorName?: string;
  /**
   * 状态（0草稿 1已发布）
   */
  status: string;
  /**
   * 可见性（0公开 1用户隐藏 2管理员下线）
   */
  visibility: string;
  title?: string;
  summary?: string;
  coverUrl?: string;
  viewCount?: number;
  publishedAt?: string;
  updateTime?: string;
  tags?: BlogTagVO[];
}

/**
 * 文章详情（契约 §3.3，对应 BlogArticleDetailVo；正文在 currentVersion）
 */
export interface BlogArticleDetailVO {
  articleId: string | number;
  authorId: string | number;
  authorName?: string;
  slug?: string;
  status: string;
  visibility: string;
  viewCount?: number;
  publishedAt?: string;
  createTime?: string;
  updateTime?: string;
  /** 治理信息（管理员下线后非空） */
  adminHiddenReason?: string;
  adminHiddenBy?: string | number;
  adminHiddenByName?: string;
  adminHiddenTime?: string;
  /** 当前生效版本（含正文） */
  currentVersion?: BlogArticleVersionVO;
  tags?: BlogTagVO[];
}

/**
 * 我的文章列表查询（契约 §3.2，对应 BlogArticleMyQueryBo；authorId 由服务端强制过滤，不接收）
 */
export interface BlogArticleQuery extends PageQuery {
  status?: string;
  visibility?: string;
  keyword?: string;
}

/**
 * 文章保存入参（契约 §3.1/§3.4，对应 BlogArticleSaveBo）
 * 创建与保存共用；tagNames 与正文一起提交，规范化/建标签/关系同步由后端负责
 */
export interface BlogArticleForm {
  title: string;
  summary?: string;
  coverUrl?: string;
  content: string;
  /**
   * 标签原始名集合，1~6 个
   */
  tagNames: string[];
}
