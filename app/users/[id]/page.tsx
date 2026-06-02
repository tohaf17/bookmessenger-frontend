import UserProfile from '@/components/users/UserProfile';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfilePage({ params }: PageProps) {
  return <UserProfile params={params} />;
}
