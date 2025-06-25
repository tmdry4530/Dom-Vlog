'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';

import { AdminPostCard } from '@/components/blog/AdminPostCard';
import { PostEditor } from '@/components/editor/PostEditor';
import { usePosts } from '@/hooks/usePosts';
import type { Post } from '@/hooks/usePosts';

export default function AdminPostsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'draft' | 'published' | 'archived'
  >('all');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { posts, isLoading, error, refreshPosts } = usePosts();

  // 필터링된 포스트
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNewPost = () => {
    setSelectedPost(null);
    setIsEditing(true);
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    setIsEditing(true);
  };

  const handleViewPost = (post: Post) => {
    // 실제로는 포스트 상세 페이지로 이동
    window.open(`/blog/${post.slug}`, '_blank');
  };

  const handlePostSaved = () => {
    setIsEditing(false);
    setSelectedPost(null);
    refreshPosts();
  };

  const handlePostDeleted = () => {
    refreshPosts();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedPost(null);
  };

  if (isEditing) {
    return (
      <PostEditor
        postId={selectedPost?.id}
        initialData={selectedPost || undefined}
        onSave={handlePostSaved}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">포스트 관리</h1>
          <p className="text-gray-600 mt-1">
            블로그 포스트를 관리하고 편집하세요
          </p>
        </div>
        <Button onClick={handleNewPost} className="gap-2">
          <Plus className="h-4 w-4" />새 포스트
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="제목이나 내용으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value: any) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="published">발행됨</SelectItem>
              <SelectItem value="draft">임시저장</SelectItem>
              <SelectItem value="archived">보관됨</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
          <div className="text-sm text-gray-600">총 포스트</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {posts.filter((p) => p.status === 'published').length}
          </div>
          <div className="text-sm text-gray-600">발행됨</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {posts.filter((p) => p.status === 'draft').length}
          </div>
          <div className="text-sm text-gray-600">임시저장</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {posts
              .reduce((total, post) => total + (post.viewCount || 0), 0)
              .toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">총 조회수</div>
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 font-medium">오류가 발생했습니다</div>
          <div className="text-red-500 text-sm mt-1">{error}</div>
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* 포스트 그리드 */}
      {!isLoading && (
        <>
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? '검색 조건에 맞는 포스트가 없습니다.'
                  : '아직 포스트가 없습니다.'}
              </div>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={handleNewPost} variant="outline">
                  첫 포스트 작성하기
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <AdminPostCard
                  key={post.id}
                  post={post}
                  onEdit={handleEditPost}
                  onView={handleViewPost}
                  onDeleted={handlePostDeleted}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* 페이지네이션 (추후 구현) */}
      {filteredPosts.length > 0 && (
        <div className="flex justify-center items-center space-x-4 pt-8">
          <div className="text-sm text-gray-600">
            {filteredPosts.length}개의 포스트
          </div>
        </div>
      )}
    </div>
  );
}
