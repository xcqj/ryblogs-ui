/**
 * 管理员文章治理列表项（契约 §11.1，对应 BlogAdminArticleListItemVo）
 */
export interface BlogAdminArticleVO {
  /**
   * 文章ID
   */
  articleId: string | number;
  /**
   * 作者用户ID
   */
  authorId: string | number;
  /**
   * 作者昵称（后端 @Translation 实时翻译）
   */
  authorName?: string;
  /**
   * 标题（当前生效版本）
   */
  title?: string;
  /**
   * 文章状态（0草稿 1已发布）
   */
  status: string;
  /**
   * 可见性（0公开 1用户隐藏 2管理员下线）
   */
  visibility: string;
  /**
   * 阅读量
   */
  viewCount?: number;
  /**
   * 首次发布时间
   */
  publishedAt?: string;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 更新时间
   */
  updateTime?: string;
  /**
   * 管理员下线原因（治理字段）
   */
  adminHiddenReason?: string;
  /**
   * 执行下线的管理员ID
   */
  adminHiddenBy?: string | number;
  /**
   * 执行下线的管理员昵称（后端 @Translation 实时翻译）
   */
  adminHiddenByName?: string;
  /**
   * 下线时间
   */
  adminHiddenTime?: string;
}

/**
 * 管理员文章列表查询（契约 §11.1，对应 BlogAdminArticleQueryBo）
 * 日期字段是平铺 beginTime/endTime，不走 RuoYi 的 params 桶
 */
export interface BlogAdminArticleQuery extends PageQuery {
  /**
   * 标题关键字（联查当前版本 title 模糊匹配）
   */
  title?: string;
  /**
   * 文章状态（0草稿 1已发布），空为全部
   */
  status?: string;
  /**
   * 可见性（0公开 1用户隐藏 2管理员下线），空为全部
   */
  visibility?: string;
  /**
   * 作者用户ID，空为全部
   */
  authorId?: string | number;
  /**
   * 创建时间起（yyyy-MM-dd HH:mm:ss，含）
   */
  beginTime?: string;
  /**
   * 创建时间止（yyyy-MM-dd HH:mm:ss，含）
   */
  endTime?: string;
}

/**
 * 管理员下线入参（契约 §11.3，对应 BlogAdminArticleHideBo）
 */
export interface BlogAdminArticleHideForm {
  /**
   * 下线原因，必填，≤500 字符
   */
  reason: string;
}
