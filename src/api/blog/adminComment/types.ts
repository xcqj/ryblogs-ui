/**
 * 评论列表项（契约 §12.1，对应 BlogCommentListItemVo）
 */
export interface BlogAdminCommentVO {
  /**
   * 评论ID
   */
  commentId: string | number;
  /**
   * 文章ID
   */
  articleId: string | number;
  /**
   * 评论内容（纯文本）
   */
  content: string;
  /**
   * 评论用户ID
   */
  userId: string | number;
  /**
   * 评论用户昵称（后端 @Translation 实时翻译）
   */
  userName?: string;
  /**
   * 评论时间
   */
  createTime?: string;
}

/**
 * 评论管理列表查询（契约 §12.1，对应 BlogAdminCommentQueryBo：articleId/userId/keyword）
 */
export interface BlogAdminCommentQuery extends PageQuery {
  /**
   * 文章ID，空为全部
   */
  articleId?: string | number;
  /**
   * 评论用户ID，空为全部
   */
  userId?: string | number;
  /**
   * 内容关键字（模糊）
   */
  keyword?: string;
}
