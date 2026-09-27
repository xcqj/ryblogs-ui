export interface BlogArticleVO {
  /**
   * 文章ID
   */
  articleId: string | number;
  /**
   * 作者用户ID
   */
  authorId: string | number;
  /**
   * 文章URL标识，MVP预留，全局唯一
   */
  slug: string;
  /**
   * 文章状态（0草稿 1已发布）
   */
  status: boolean;
  /**
   * 可见性（0公开 1用户隐藏 2管理员下线）
   */
  visibility: string;
  /**
   * 当前生效版本ID
   */
  currentVersionId: string | number;
  /**
   * 阅读量
   */
  viewCount: number;
  /**
   * 首次发布时间
   */
  publishedAt: string;
  /**
   * 管理员下线原因
   */
  adminHiddenReason: string | number;
  /**
   * 执行管理员下线的用户ID
   */
  adminHiddenBy: string | number;
  /**
   * 管理员下线时间
   */
  adminHiddenTime: string | number;
  /**
   * 创建者
   */
  createBy: number;
  /**
   * 创建时间
   */
  createTime: string;
  /**
   * 更新者
   */
  updateBy: number;
  /**
   * 更新时间
   */
  updateTime: string;
}

export interface BlogArticleForm extends BaseEntity {
  /**
   * 文章ID
   */
  articleId?: string | number;
  /**
   * 作者用户ID
   */
  authorId?: string | number;
  /**
   * 文章URL标识，MVP预留，全局唯一
   */
  slug?: string;
  /**
   * 文章状态（0草稿 1已发布）
   */
  status?: boolean;
  /**
   * 可见性（0公开 1用户隐藏 2管理员下线）
   */
  visibility?: string;
  /**
   * 当前生效版本ID
   */
  currentVersionId?: string | number;
  /**
   * 阅读量
   */
  viewCount?: number;
  /**
   * 首次发布时间
   */
  publishedAt?: string;
  /**
   * 管理员下线原因
   */
  adminHiddenReason?: string | number;
  /**
   * 执行管理员下线的用户ID
   */
  adminHiddenBy?: string | number;
  /**
   * 管理员下线时间
   */
  adminHiddenTime?: string | number;
  /**
   * 创建部门
   */
  createDept?: number;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: string;
}

export interface BlogArticleQuery extends PageQuery {
  /**
   * 作者用户ID
   */
  authorId?: string | number;
  /**
   * 文章URL标识，MVP预留，全局唯一
   */
  slug?: string;
  /**
   * 文章状态（0草稿 1已发布）
   */
  status?: boolean;
  /**
   * 可见性（0公开 1用户隐藏 2管理员下线）
   */
  visibility?: string;
  /**
   * 当前生效版本ID
   */
  currentVersionId?: string | number;
  /**
   * 阅读量
   */
  viewCount?: number;
  /**
   * 首次发布时间
   */
  publishedAt?: string;
  /**
   * 管理员下线原因
   */
  adminHiddenReason?: string | number;
  /**
   * 执行管理员下线的用户ID
   */
  adminHiddenBy?: string | number;
  /**
   * 管理员下线时间
   */
  adminHiddenTime?: string | number;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: string;
  /**
   * 日期范围参数
   */
  params?: any;
}
