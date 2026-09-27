export interface BlogTagAliasVO {
  /**
   * 标签别名ID
   */
  tagAliasId: string | number;
  /**
   * 当前有效canonical标签ID
   */
  tagId: string | number;
  /**
   * 历史标签slug，全局唯一
   */
  aliasSlug: string;
  /**
   * 历史标签名称
   */
  aliasName: string;
  /**
   * 创建者
   */
  createBy: number;
  /**
   * 创建时间
   */
  createTime: string;
}

export interface BlogTagAliasForm extends BaseEntity {
  /**
   * 标签别名ID
   */
  tagAliasId?: string | number;
  /**
   * 当前有效canonical标签ID
   */
  tagId?: string | number;
  /**
   * 历史标签slug，全局唯一
   */
  aliasSlug?: string;
  /**
   * 历史标签名称
   */
  aliasName?: string;
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

export interface BlogTagAliasQuery extends PageQuery {
  /**
   * 当前有效canonical标签ID
   */
  tagId?: string | number;
  /**
   * 历史标签slug，全局唯一
   */
  aliasSlug?: string;
  /**
   * 历史标签名称
   */
  aliasName?: string;
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
