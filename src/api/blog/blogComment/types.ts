export interface BlogCommentVO {
  /**
   * 评论ID
   */
  commentId: string | number;
  /**
   * 文章ID
   */
  articleId: string | number;
  /**
   * 评论用户ID
   */
  userId: string | number;
  /**
   * 父评论ID，MVP必须为空，预留未来回复功能
   */
  parentId: string | number;
  /**
   * 评论内容
   */
  content: string;
  /**
   * 创建者
   */
  createBy: number;
  /**
   * 创建时间
   */
  createTime: string;
}

export interface BlogCommentForm extends BaseEntity {
  /**
   * 评论ID
   */
  commentId?: string | number;
  /**
   * 文章ID
   */
  articleId?: string | number;
  /**
   * 评论用户ID
   */
  userId?: string | number;
  /**
   * 父评论ID，MVP必须为空，预留未来回复功能
   */
  parentId?: string | number;
  /**
   * 评论内容
   */
  content?: string;
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
   * 统一审计字段，业务层禁止修改评论
   */
  updateBy?: number;
  /**
   * 统一审计字段，业务层禁止修改评论
   */
  updateTime?: string;
}

export interface BlogCommentQuery extends PageQuery {
  /**
   * 文章ID
   */
  articleId?: string | number;
  /**
   * 评论用户ID
   */
  userId?: string | number;
  /**
   * 父评论ID，MVP必须为空，预留未来回复功能
   */
  parentId?: string | number;
  /**
   * 评论内容
   */
  content?: string;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 日期范围参数
   */
  params?: any;
}
