/**
 * 博客个人资料（契约 §8.1，对应 BlogUserProfileVo）
 * 昵称/头像实时取自 sys_user（不复制），bio 来自 sd_blog_user_profile
 */
export interface BlogUserProfileVO {
  userId: string | number;
  nickName?: string;
  avatar?: string | number;
  avatarUrl?: string;
  bio?: string;
}

/**
 * 修改个人资料入参（契约 §8.2，对应 BlogProfileBo）：仅 bio，userId 由后端取登录上下文
 */
export interface BlogProfileForm {
  bio?: string;
}
