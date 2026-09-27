export interface BlogUserProfileVO {
  /**
   * 用户ID，RuoYi sys_user.user_id，同时作为主键
   */
  userId: string | number;
  /**
   * 个人简介
   */
  bio: string;
  /**
   * 创建者
   */
  createBy: number;
  /**
   * 创建时间
   */
  createTime: string;
}

export interface BlogUserProfileForm extends BaseEntity {
  /**
   * 用户ID，RuoYi sys_user.user_id，同时作为主键
   */
  userId?: string | number;
  /**
   * 个人简介
   */
  bio?: string;
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

export interface BlogUserProfileQuery extends PageQuery {
  /**
   * 用户ID，RuoYi sys_user.user_id，同时作为主键
   */
  userId?: string | number;
  /**
   * 个人简介
   */
  bio?: string;
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
