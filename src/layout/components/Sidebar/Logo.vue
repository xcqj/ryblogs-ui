<template>
  <div class="sidebar-logo-container" :class="{ collapse: collapse }">
    <transition :enter-active-class="animateConfig.logoAnimate.enter" mode="out-in">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <!-- 品牌标：错位叠框（Stack）+ 前框发光（Depth），与 blog-web AppBrand.vue 同源；
             内联 SVG 使描边色随侧栏深浅主题切换（<img> 会把颜色烤死） -->
        <svg class="sidebar-logo" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <rect x="6" y="10" width="22" height="22" rx="6" :stroke="markBack" stroke-width="2.6" />
          <rect x="12" y="6" width="22" height="22" rx="6" :stroke="markFront" stroke-width="2.6" />
        </svg>
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <svg class="sidebar-logo" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <rect x="6" y="10" width="22" height="22" rx="6" :stroke="markBack" stroke-width="2.6" />
          <rect x="12" y="6" width="22" height="22" rx="6" :stroke="markFront" stroke-width="2.6" />
        </svg>
        <h1 class="sidebar-title">
          {{ title }}
        </h1>
      </router-link>
    </transition>
  </div>
</template>

<script setup lang="ts">
import animateConfig from '@/animate';
import { NavTypeEnum } from '@/enums/NavTypeEnum';
import { useSettingsStore } from '@/store/modules/settings';

defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
});

const title = import.meta.env.VITE_APP_LOGO_TITLE;
const settingsStore = useSettingsStore();
const sideTheme = computed(() => settingsStore.sideTheme);
const isTopNav = computed(() => settingsStore.navType === NavTypeEnum.TOP);
const isDarkSide = computed(() => !isTopNav.value && sideTheme.value === 'theme-dark');
const logoSurface = computed(() => (isDarkSide.value ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc'));
const logoBorder = computed(() => (isDarkSide.value ? 'rgba(148, 163, 184, 0.12)' : '#e5e7eb'));
const logoTextColor = computed(() => (isDarkSide.value ? '#f8fbff' : 'var(--app-text-title)'));

/** 品牌标描边色（与 blog-web tokens.css 同值）：后框随侧栏深浅切换，前框为品牌黄 */
const markBack = computed(() => (isDarkSide.value ? '#f4f1ea' : '#211e1c'));
const markFront = computed(() => '#ffd500');
/** 品牌标发光：blog-web 同款强度，深浅各自适配 */
const markGlow = computed(() =>
  isDarkSide.value ? 'drop-shadow(0 0 5px rgb(228 219 201 / 0.26))' : 'drop-shadow(0 0 5px rgb(47 44 37 / 0.2))'
);
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  flex-shrink: 0;
  height: 46px;
  line-height: 46px;
  padding: 0 8px;
  margin-top: 8px;
  background: transparent;
  text-align: center;
  overflow: hidden;
  margin-bottom: 0;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 14px;
    background: v-bind(logoSurface);
    border: 1px solid v-bind(logoBorder);

    & .sidebar-logo {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
      vertical-align: middle;
      margin-right: 0;
      margin-left: 0;
      filter: v-bind(markGlow);
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: v-bind(logoTextColor);
      font-weight: 600;
      line-height: 1;
      font-size: 15px;
      letter-spacing: 0.02em;
      font-family: 'MiSans', 'HarmonyOS Sans SC', 'PingFang SC', sans-serif;
      vertical-align: middle;
    }
  }

  &.collapse {
    .sidebar-logo-link {
      padding: 0;
    }

    .sidebar-logo {
      margin-right: 0;
    }
  }
}
</style>
