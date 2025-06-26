// 커스텀 React 훅들

// Auth hooks
export { useAuth } from './useAuth';
export { useAuthPermissions } from './useAuthPermissions';
export type { AuthPermissions } from './useAuthPermissions';

// Responsive hooks
export {
  useResponsive,
  useBreakpoint,
  useMediaQuery,
  useOrientation,
} from './useResponsive';

// Post management hooks
export { usePosts } from './usePosts';
export type {
  Post,
  CreatePostData,
  UpdatePostData,
  PostsState,
  UsePostsResult,
} from './usePosts';

// Profile hooks
export { useProfile } from './useProfile';

// Notification hooks
export { useNotifications } from './useNotifications';
export type { UseNotificationsResult } from './useNotifications';

// AI hooks
export * from './ai';

// Blog stats hooks
export {
  useBlogStats,
  useCategoryStats,
  useRecentPosts,
  useBlogInfo,
} from './useBlogStats';
export type {
  BlogStats,
  CategoryStat,
  RecentPost,
  BlogInfo,
} from './useBlogStats';

// Profile stats hooks
export { useProfileStats } from './useProfileStats';
