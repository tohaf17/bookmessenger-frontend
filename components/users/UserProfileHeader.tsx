import { Loader2, User as UserIcon, UserMinus, UserPlus } from 'lucide-react';
import { useT } from '@/lib/translations';
import type { UserProfileData } from './types';
import css from './UserProfile.module.css';

interface UserProfileHeaderProps {
  profile: UserProfileData;
  followersCount: number;
  followingCount: number;
  isSelf: boolean;
  canFollow: boolean;
  isFollowing: boolean;
  updatingFollow: boolean;
  onFollowToggle: () => void;
}

export default function UserProfileHeader({ profile, followersCount, followingCount, isSelf, canFollow, isFollowing, updatingFollow, onFollowToggle }: UserProfileHeaderProps) {
  const t = useT();

  return (
    <div className={`glass-panel ${css.profileHeaderCard}`}>
      <div className={css.avatarWrapper}>
        <div className={css.avatar}>
          <UserIcon size={48} color="#9333ea" />
        </div>
      </div>

      <div className={css.profileInfo}>
        <div className={css.nameRow}>
          <h2 className={css.profileName}>{profile.name} {profile.surname}</h2>
          <span className={css.roleTag}>{profile.role}</span>
        </div>
        <p className={css.profileEmail}>{profile.email}</p>
        <div className={css.socialCounts}>
          <span className={css.socialCountItem}><strong>{followersCount}</strong> {t('users.followers')}</span>
          <span className={css.socialCountItem}><strong>{followingCount}</strong> {t('users.following')}</span>
        </div>
      </div>

      {!isSelf && canFollow && (
        <div className={css.followActions}>
          <button onClick={onFollowToggle} disabled={updatingFollow} className={`${isFollowing ? 'btn-secondary' : 'btn-primary'} ${css.followBtn}`}>
            {updatingFollow ? <Loader2 size={16} className={css.spinner} /> : isFollowing ? <><UserMinus size={16} /> {t('users.unfollow')}</> : <><UserPlus size={16} /> {t('users.follow')}</>}
          </button>
        </div>
      )}
    </div>
  );
}
