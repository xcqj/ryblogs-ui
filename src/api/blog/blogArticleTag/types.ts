export interface BlogArticleTagVO {
  /**
   * 文章标签关系ID
   */
  articleTagId: string | number;
  /**
   * 文章ID
   */
  articleId: string | number;
  /**
   * 标签ID
   */
  tagId: string | number;
  /**
   * 创建者
   */
  createBy: number;
  /**
   * 创建时间
   */
  createTime: string;
}

export interface BlogArticleTagForm extends BaseEntity {
  /**
   * 文章标签关系ID
   */
  articleTagId?: string | number;
  /**
   * 文章ID
   */
  articleId?: string | number;
  /**
   * 标签ID
   */
  tagId?: string | number;
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

export interface BlogArticleTagQuery extends PageQuery {
  /**
   * 文章标签关系ID
   */
  articleTagId?: string | number;
  /**
   * 文章ID
   */
  articleId?: string | number;
  /**
   * 标签ID
   */
  tagId?: string | number;
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
