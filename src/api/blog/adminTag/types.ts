/**
 * 标签治理列表项（契约 §13.1，对应 SdBlogTagVo）
 */
export interface BlogAdminTagVO {
  /**
   * 标签ID
   */
  tagId: string | number;
  /**
   * 当前标签名称
   */
  name: string;
  /**
   * 规范化 slug，全局唯一
   */
  slug: string;
  /**
   * 标签状态（0正常 1已合并）
   */
  status: string;
  /**
   * 合并目标标签ID，正常状态时为空
   */
  mergedInto?: string | number;
  /**
   * 是否精选（0否 1是）
   */
  isFeatured: string;
  /**
   * 精选展示顺序（越小越靠前）
   */
  sortOrder?: number;
  /**
   * 创建者
   */
  createBy?: string | number;
  /**
   * 创建时间
   */
  createTime?: string;
}

/**
 * 标签管理列表查询（契约 §13.1，对应 SdBlogTagBo 的可查字段：name/status/isFeatured）
 */
export interface BlogAdminTagQuery extends PageQuery {
  /**
   * 标签名称（模糊）
   */
  name?: string;
  /**
   * 标签状态（0正常 1已合并），空为全部
   */
  status?: string;
  /**
   * 是否精选（0否 1是），空为全部
   */
  isFeatured?: string;
}

/**
 * 运营属性更新入参（契约 §13.3，对应 BlogTagOpsBo）：仅 isFeatured/sortOrder
 */
export interface BlogTagOpsForm {
  /**
   * 是否精选（0否 1是）
   */
  isFeatured: string;
  /**
   * 精选展示顺序
   */
  sortOrder: number;
}

/**
 * 重命名入参（契约 §13.4，对应 BlogTagRenameBo）
 */
export interface BlogTagRenameForm {
  /**
   * 新标签名称，必填 ≤50
   */
  name: string;
}

/**
 * 合并入参（契约 §13.5，对应 BlogTagMergeBo）：目标为当前 ACTIVE 标签
 */
export interface BlogTagMergeForm {
  targetTagId: string | number;
}
