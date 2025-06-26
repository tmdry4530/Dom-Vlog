import { Metadata } from 'next';
import { NewPostClient } from '@/components/admin/NewPostClient';

export const metadata: Metadata = {
  title: '새 글 작성 | Dom Vlog',
  description: '새로운 블로그 포스트를 작성합니다.',
};

export default function NewPostPage() {
  return <NewPostClient />;
}
