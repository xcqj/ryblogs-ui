export interface BlogArticleVersionVO {
  /**
   * 文章版本ID
   */
  versionId: string | number;
  /**
   * 所属文章ID
   */
  articleId: string | number;
  /**
   * 文章版本号，从1开始递增
   */
  versionNo: number;
  /**
   * 文章标题快照
   */
  title: string;
  /**
   * 文章摘要快照
   */
  summary: string;
  /**
   * 文章封面URL快照
   */
  coverUrl: string;
  /**
   * 文章正文HTML快照（WangEditor内容，经安全处理后保存）
   */
  content: string;
  /**
   * 该版本创建者
   */
  createBy: number;
  /**
   * 版本创建时间
   */
  createTime: string;
}

export interface BlogArticleVersionForm extends BaseEntity {
  /**
   * 文章版本ID
   */
  versionId?: string | number;
  /**
   * 所属文章ID
   */
  articleId?: string | number;
  /**
   * 文章版本号，从1开始递增
   */
  versionNo?: number;
  /**
   * 文章标题快照
   */
  title?: string;
  /**
   * 文章摘要快照
   */
  summary?: string;
  /**
   * 文章封面URL快照
   */
  coverUrl?: string;
  /**
   * 文章正文HTML快照（WangEditor内容，经安全处理后保存）
   */
  content?: string;
  /**
   * 创建部门
   */
  createDept?: number;
  /**
   * 该版本创建者
   */
  createBy?: number;
  /**
   * 版本创建时间
   */
  createTime?: string;
  /**
   * 统一审计字段，业务层禁止更新
   */
  updateBy?: number;
  /**
   * 统一审计字段，业务层禁止更新
   */
  updateTime?: string;
}

export interface BlogArticleVersionQuery extends PageQuery {
  /**
   * 所属文章ID
   */
  articleId?: string | number;
  /**
   * 文章版本号，从1开始递增
   */
  versionNo?: number;
  /**
   * 文章标题快照
   */
  title?: string;
  /**
   * 文章摘要快照
   */
  summary?: string;
  /**
   * 文章正文HTML快照（WangEditor内容，经安全处理后保存）
   */
  content?: string;
  /**
   * 该版本创建者
   */
  createBy?: number;
  /**
   * 版本创建时间
   */
  createTime?: string;
  /**
   * 日期范围参数
   */
  params?: any;
}
