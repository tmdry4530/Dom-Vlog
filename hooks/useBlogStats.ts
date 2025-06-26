'use client';

import { useState, useEffect } from 'react';

export interface BlogStats {
  totalPosts: number;
  totalViews: number;
  todayViews: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  color: string | null;
  count: number;
}

export interface RecentPost {
  id: string;
  title: string;
  slug: string;
  date: string;
}

export interface BlogInfo {
  displayName: string;
  blogTitle: string;
  blogSubtitle: string | null;
  avatar: string | null;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
  email: string | null;
}

export function useBlogStats() {
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stats');
        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        } else {
          setError(result.error || '통계 데이터를 가져올 수 없습니다.');
        }
      } catch (err) {
        setError('통계 데이터를 가져오는 중 오류가 발생했습니다.');
        console.error('Stats fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}

export function useCategoryStats() {
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/categories/stats');
        const result = await response.json();

        if (result.success) {
          setCategories(result.data);
        } else {
          setError(result.error || '카테고리 데이터를 가져올 수 없습니다.');
        }
      } catch (err) {
        setError('카테고리 데이터를 가져오는 중 오류가 발생했습니다.');
        console.error('Category stats fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, isLoading, error };
}

export function useRecentPosts() {
  const [posts, setPosts] = useState<RecentPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts/recent');
        const result = await response.json();

        if (result.success) {
          setPosts(result.data);
        } else {
          setError(result.error || '최근 글 데이터를 가져올 수 없습니다.');
        }
      } catch (err) {
        setError('최근 글 데이터를 가져오는 중 오류가 발생했습니다.');
        console.error('Recent posts fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  return { posts, isLoading, error };
}

export function useBlogInfo() {
  const [blogInfo, setBlogInfo] = useState<BlogInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogInfo = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/profile/blog-info');
        const result = await response.json();

        if (result.success) {
          setBlogInfo(result.data);
        } else {
          setError(result.error || '블로그 정보를 가져올 수 없습니다.');
        }
      } catch (err) {
        setError('블로그 정보를 가져오는 중 오류가 발생했습니다.');
        console.error('Blog info fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogInfo();
  }, []);

  return { blogInfo, isLoading, error };
}
