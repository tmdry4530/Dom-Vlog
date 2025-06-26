import { Metadata } from 'next';
import { ProfilePageClient } from '@/components/profile/ProfilePageClient';

export const metadata: Metadata = {
  title: '프로필',
  description: 'Dom Vlog 프로필 및 활동 현황을 확인해보세요.',
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
