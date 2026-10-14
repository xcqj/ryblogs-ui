<template>
  <div class="home">
    <!-- 欢迎区：品牌定位 + 数据刷新入口 -->
    <section class="hero-panel">
      <div class="hero-copy">
        <span class="hero-badge">Stack Depth · 博客管理后台</span>
        <h1>{{ greeting }}</h1>
        <p class="hero-desc">
          多作者技术博客的内容治理工作台：文章状态与版本留痕、标签合并与别名迁移、评论巡检与删除，
          平台级治理能力统一收口，下方数据实时取自治理接口。
        </p>
        <div class="hero-actions">
          <el-button type="primary" icon="Refresh" :loading="loading" @click="loadOverview">刷新数据</el-button>
          <span class="hero-date">今天是 {{ todayText }}</span>
        </div>
      </div>
    </section>

    <!-- 数据概览：6 张统计卡，全部消费已有治理接口，零后端改动 -->
    <section class="section-card">
      <div class="section-head">
        <div>
          <span class="section-kicker">Content Overview</span>
          <h2>平台数据概览</h2>
        </div>
        <span class="section-note">统计实时取自治理列表接口</span>
      </div>

      <!-- 无任何治理权限时降级：不发起请求，仅作说明 -->
      <el-alert
        v-if="!hasAnyPermi"
        class="degrade-alert"
        type="info"
        :closable="false"
        show-icon
        title="当前账号暂无内容治理权限"
        description="数据概览需要 blog:article:list / blog:comment:list / blog:tag:list 权限，可向平台管理员申请；登录与作者功能不受影响。"
      />

      <div v-loading="loading" class="stat-grid">
        <article v-for="stat in stats" :key="stat.key" class="stat-card" :class="`is-${stat.key}`">
          <div class="stat-top">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-icon"><el-icon><component :is="stat.icon" /></el-icon></span>
          </div>
          <strong class="stat-value">{{ stat.value === null ? '—' : stat.value }}</strong>
          <span v-if="stat.hint" class="stat-hint">{{ stat.hint }}</span>
        </article>
      </div>
    </section>

    <!-- 三层接口边界说明：纯文案，不放治理页深链（治理页为后端动态菜单路由） -->
    <section class="section-card capability-card">
      <div class="section-head">
        <div>
          <span class="section-kicker">API Boundary</span>
          <h2>三层接口边界</h2>
        </div>
      </div>
      <div class="capability-groups">
        <article v-for="group in boundaryGroups" :key="group.title" class="capability-group">
          <h3>{{ group.title }}</h3>
          <p class="capability-path">{{ group.path }}</p>
          <ul>
            <li v-for="item in group.items" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
      <p class="boundary-note">治理入口见左侧「博客」目录菜单；本页仅做数据展示，不承担治理操作。</p>
    </section>
  </div>
</template>

<script setup name="Index" lang="ts">
import { ChatDotRound, CircleCheck, Document, EditPen, Hide, PriceTag } from '@element-plus/icons-vue';
import type { Component } from 'vue';
import { listBlogAdminArticle } from '@/api/blog/adminArticle';
import { listBlogAdminComment } from '@/api/blog/adminComment';
import { listBlogAdminTag } from '@/api/blog/adminTag';
import type { RuoYiAjaxResult } from '@/utils/api-types';
import { checkPermi } from '@/utils/permission';
import { useUserStore } from '@/store/modules/user';

/** 契约 §14：status 0=草稿 1=已发布；visibility 0=公开 1=用户隐藏 2=管理员下线 */
const STATUS = { DRAFT: '0', PUBLISHED: '1' } as const;
const VISIBILITY = { USER_HIDDEN: '1', ADMIN_HIDDEN: '2' } as const;

/** 治理权限标识（契约 §17，与治理菜单 C 型入口一致） */
const PERMI = {
  article: 'blog:article:list',
  comment: 'blog:comment:list',
  tag: 'blog:tag:list'
} as const;

/** 统计卡模型：value 为 null 时渲染「—」（无权限或请求失败），hint 为补充说明 */
interface OverviewStat {
  key: 'articleTotal' | 'published' | 'draft' | 'hidden' | 'commentTotal' | 'tagTotal';
  label: string;
  icon: Component;
  value: number | null;
  hint?: string;
}

const userStore = useUserStore();

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];
const now = new Date();
const todayText = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${WEEKDAY_LABELS[now.getDay()]}`;
const greeting = computed(() => `欢迎回来，${userStore.nickname || '管理员'}`);

const stats = ref<OverviewStat[]>([
  { key: 'articleTotal', label: '文章总数', icon: Document, value: null },
  { key: 'published', label: '已发布', icon: CircleCheck, value: null },
  { key: 'draft', label: '草稿', icon: EditPen, value: null },
  { key: 'hidden', label: '隐藏中', icon: Hide, value: null },
  { key: 'commentTotal', label: '评论总数', icon: ChatDotRound, value: null },
  { key: 'tagTotal', label: '标签总数', icon: PriceTag, value: null }
]);

/** 「隐藏中」的两个分项，用于卡内拆分说明 */
const userHiddenCount = ref<number | null>(null);
const adminHiddenCount = ref<number | null>(null);

const loading = ref(false);

/** 是否持有任一治理权限：全部缺失时展示降级提示条，且不发起任何请求 */
const hasAnyPermi = computed(() => [PERMI.article, PERMI.comment, PERMI.tag].some(perm => checkPermi([perm])));

const setStat = (key: OverviewStat['key'], value: number | null) => {
  const target = stats.value.find(item => item.key === key);
  if (target) {
    target.value = value;
  }
};

/** 读取列表 total（pageSize=1 轻量统计）；失败返回 null，由卡片渲染「—」 */
const fetchTotal = async (request: () => Promise<RuoYiAjaxResult<{ total: number }>>): Promise<number | null> => {
  try {
    const res = await request();
    const total = res?.data?.total;
    return typeof total === 'number' ? total : null;
  } catch {
    return null;
  }
};

/** 渲染「隐藏中」卡：用户隐藏 + 管理员下线相加，hint 拆分两项；全部不可得时置「—」 */
const renderHiddenCard = () => {
  const target = stats.value.find(item => item.key === 'hidden');
  if (!target) {
    return;
  }
  if (userHiddenCount.value === null && adminHiddenCount.value === null) {
    target.value = null;
    target.hint = undefined;
    return;
  }
  target.value = (userHiddenCount.value ?? 0) + (adminHiddenCount.value ?? 0);
  target.hint = `用户隐藏 ${userHiddenCount.value ?? '—'} · 管理员下线 ${adminHiddenCount.value ?? '—'}`;
};

const loadOverview = async () => {
  loading.value = true;
  // 重置，避免刷新时残留旧值
  stats.value.forEach(item => {
    item.value = null;
  });
  userHiddenCount.value = null;
  adminHiddenCount.value = null;

  const tasks: Promise<unknown>[] = [];

  // 文章维度 5 发：总数 / 已发布 / 草稿 / 用户隐藏 / 管理员下线
  if (checkPermi([PERMI.article])) {
    tasks.push(
      fetchTotal(() => listBlogAdminArticle({ pageNum: 1, pageSize: 1 })).then(value => setStat('articleTotal', value)),
      fetchTotal(() => listBlogAdminArticle({ pageNum: 1, pageSize: 1, status: STATUS.PUBLISHED })).then(value =>
        setStat('published', value)
      ),
      fetchTotal(() => listBlogAdminArticle({ pageNum: 1, pageSize: 1, status: STATUS.DRAFT })).then(value =>
        setStat('draft', value)
      ),
      fetchTotal(() => listBlogAdminArticle({ pageNum: 1, pageSize: 1, visibility: VISIBILITY.USER_HIDDEN })).then(
        value => {
          userHiddenCount.value = value;
        }
      ),
      fetchTotal(() => listBlogAdminArticle({ pageNum: 1, pageSize: 1, visibility: VISIBILITY.ADMIN_HIDDEN })).then(
        value => {
          adminHiddenCount.value = value;
        }
      )
    );
  }
  if (checkPermi([PERMI.comment])) {
    tasks.push(
      fetchTotal(() => listBlogAdminComment({ pageNum: 1, pageSize: 1 })).then(value => setStat('commentTotal', value))
    );
  }
  if (checkPermi([PERMI.tag])) {
    tasks.push(fetchTotal(() => listBlogAdminTag({ pageNum: 1, pageSize: 1 })).then(value => setStat('tagTotal', value)));
  }

  await Promise.allSettled(tasks);
  renderHiddenCard();
  loading.value = false;
};

onMounted(loadOverview);

const boundaryGroups = [
  {
    title: '公共只读',
    path: '/blog/public/**',
    items: ['文章列表 / 详情 / 搜索、标签、用户公开资料', '匿名访问，后端强制 status=1 & visibility=0 & del_flag=0', '由 blog-web 前台消费，管理后台不直连']
  },
  {
    title: '登录作者与读者',
    path: '/blog/article/** · /blog/user/**',
    items: ['作者自助发文 / 编辑 / 发布 / 隐藏 / 删除', '文章归属与权限由后端按当前登录用户强制校验', '「我的文章」入口见左侧菜单']
  },
  {
    title: '平台治理',
    path: '/blog/admin/**',
    items: ['文章下线 / 恢复、标签 rename / merge、评论删除', '仅授予治理角色，按钮隐藏只是体验层', '入口见左侧「博客」目录菜单']
  }
];
</script>

<style lang="scss" scoped>
.home {
  // 间距由 --app-space-base 派生，避免魔法数字
  --home-gap: calc(var(--app-space-base) + 8px);
  --home-pad: calc(var(--app-space-base) * 2);
  --home-pad-sm: calc(var(--app-space-base) + 4px);

  display: flex;
  flex-direction: column;
  gap: var(--home-gap);
}

.hero-panel,
.section-card {
  border-radius: var(--app-radius-lg);
  border: 1px solid var(--app-surface-border);
  background: var(--app-surface-bg);
  box-shadow: var(--app-shadow-sm);
  backdrop-filter: blur(18px);
}

.hero-panel {
  padding: var(--home-pad);
  background:
    radial-gradient(circle at 12% 20%, var(--app-shell-spot-1), transparent 32%),
    radial-gradient(circle at 88% 8%, var(--app-shell-spot-2), transparent 26%),
    var(--app-surface-bg);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: calc(var(--app-space-base) - 2px);

  h1 {
    margin: 0;
    font-size: clamp(26px, 3.4vw, 38px);
    line-height: 1.1;
    letter-spacing: -0.03em;
    color: var(--app-text-title);
  }
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--app-accent-soft);
  color: var(--app-accent-strong);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-desc {
  margin: 0;
  max-width: 760px;
  color: var(--app-text-muted);
  font-size: var(--app-font-size-base);
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--app-space-base);
  margin-top: 6px;
}

.hero-date {
  color: var(--app-text-muted);
  font-size: 13px;
}

.section-card {
  padding: var(--home-pad);
}

.capability-card {
  background:
    radial-gradient(circle at 92% 0%, var(--app-shell-spot-1), transparent 24%),
    var(--app-surface-bg);
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--app-space-base);
  margin-bottom: var(--app-space-base);

  h2 {
    margin: 4px 0 0;
    color: var(--app-text-title);
    font-size: 22px;
    letter-spacing: -0.02em;
  }
}

.section-kicker {
  color: var(--app-accent-strong);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-note {
  flex-shrink: 0;
  color: var(--app-text-muted);
  font-size: 13px;
}

.degrade-alert {
  margin-bottom: var(--app-space-base);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--home-pad-sm);
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--home-pad-sm);
  border-radius: var(--app-radius-md);
  background: var(--app-elevated-soft-bg);
  border: 1px solid var(--app-surface-border);
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: var(--app-accent-soft);
    box-shadow: var(--app-shadow-md);
  }
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--app-space-base);
}

.stat-label {
  color: var(--app-text-muted);
  font-size: 13px;
  font-weight: 600;
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--app-radius-md);
  background: var(--app-accent-soft);
  color: var(--app-accent-strong);
  font-size: 18px;
}

.stat-card.is-published .stat-icon {
  background: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.stat-card.is-draft .stat-icon {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.stat-card.is-hidden .stat-icon {
  background: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.stat-value {
  color: var(--app-text-title);
  font-size: 28px;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.stat-hint {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.capability-groups {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--home-pad-sm);
}

.capability-group {
  padding: var(--home-pad-sm);
  border-radius: var(--app-radius-md);
  background: var(--app-elevated-soft-bg);
  border: 1px solid var(--app-surface-border);

  h3 {
    margin: 0 0 6px;
    color: var(--app-text-title);
    font-size: 16px;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 8px;
  }

  li {
    position: relative;
    padding-left: 14px;
    color: var(--app-text-muted);
    font-size: 13px;
    line-height: 1.7;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 9px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--app-accent-strong);
    }
  }
}

.capability-path {
  margin: 0 0 10px;
  color: var(--app-accent-strong);
  font-size: 12px;
  font-weight: 600;
}

.boundary-note {
  margin: var(--app-space-base) 0 0;
  color: var(--app-text-muted);
  font-size: 13px;
}

@media (max-width: 960px) {
  .capability-groups {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .hero-panel,
  .section-card {
    padding: var(--home-pad-sm);
  }

  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .section-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
