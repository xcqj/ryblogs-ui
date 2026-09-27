export interface BlogTagVO {
  /**
   * 标签ID
   */
  tagId: string | number;
  /**
   * 当前标签名称
   */
  name: string;
  /**
   * 当前规范化标签slug，全局唯一
   */
  slug: string;
  /**
   * 标签状态（0正常 1已合并）
   */
  status: boolean;
  /**
   * 合并目标标签ID，正常状态时为空
   */
  mergedInto: number;
  /**
   * 是否精选（0否 1是）
   */
  isFeatured: boolean;
  /**
   * 精选标签展示顺序
   */
  sortOrder: number;
  /**
   * 创建者
   */
  createBy: number;
  /**
   * 创建时间
   */
  createTime: string;
}

export interface BlogTagForm extends BaseEntity {
  /**
   * 标签ID
   */
  tagId?: string | number;
  /**
   * 当前标签名称
   */
  name?: string;
  /**
   * 当前规范化标签slug，全局唯一
   */
  slug?: string;
  /**
   * 标签状态（0正常 1已合并）
   */
  status?: boolean;
  /**
   * 合并目标标签ID，正常状态时为空
   */
  mergedInto?: number;
  /**
   * 是否精选（0否 1是）
   */
  isFeatured?: boolean;
  /**
   * 精选标签展示顺序
   */
  sortOrder?: number;
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

export interface BlogTagQuery extends PageQuery {
  /**
   * 当前标签名称
   */
  name?: string;
  /**
   * 当前规范化标签slug，全局唯一
   */
  slug?: string;
  /**
   * 标签状态（0正常 1已合并）
   */
  status?: boolean;
  /**
   * 合并目标标签ID，正常状态时为空
   */
  mergedInto?: number;
  /**
   * 是否精选（0否 1是）
   */
  isFeatured?: boolean;
  /**
   * 精选标签展示顺序
   */
  sortOrder?: number;
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
