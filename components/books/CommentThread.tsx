import Link from 'next/link';
import { Reply, Loader2 } from 'lucide-react';
import { useT } from '@/lib/translations';
import type { Comment } from './types';
import css from './BookDetails.module.css';

interface CommentThreadProps {
  comment: Comment;
  canReply: boolean;
  replyToId: number | null;
  replyContent: string;
  submittingReply: boolean;
  onToggleReply: (id: number) => void;
  onReplyChange: (value: string) => void;
  onSubmitReply: (event: React.FormEvent) => void;
  onCancelReply: () => void;
}

export default function CommentThread({
  comment,
  canReply,
  replyToId,
  replyContent,
  submittingReply,
  onToggleReply,
  onReplyChange,
  onSubmitReply,
  onCancelReply,
}: CommentThreadProps) {
  const t = useT();

  return (
    <div className={`glass-panel ${css.commentCard}`}>
      <div className={css.commentHeader}>
        <Link href={`/users/${comment.user.id}`} className={css.commentUser}>
          {comment.user.name} {comment.user.surname}
        </Link>
        <span className={css.commentDate}>{new Date(comment.createdAt).toLocaleDateString()}</span>
      </div>
      <p className={css.commentTextContent}>{comment.content}</p>

      {canReply && (
        <div className={css.commentActions}>
          <button onClick={() => onToggleReply(comment.id)} className={css.replyActionBtn}>
            <Reply size={12} />
            {t('books.reply')}
          </button>
        </div>
      )}

      {replyToId === comment.id && (
        <form onSubmit={onSubmitReply} className={css.replyForm}>
          <textarea
            placeholder={t('books.replyPlaceholder')}
            value={replyContent}
            onChange={(e) => onReplyChange(e.target.value)}
            className={`glass-input ${css.replyTextarea}`}
          />
          <div className={css.replyFormButtons}>
            <button type="button" onClick={onCancelReply} className={`btn-secondary ${css.replyCancelBtn}`}>
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={submittingReply || !replyContent} className={`btn-primary ${css.replySubmitBtn}`}>
              {submittingReply ? <Loader2 size={14} className={css.spinner} /> : t('common.submit')}
            </button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className={css.repliesList}>
          {comment.replies.map((reply) => (
            <div key={reply.id} className={`glass-panel ${css.replyCard}`}>
              <div className={css.commentHeader}>
                <Link href={`/users/${reply.user.id}`} className={css.commentUser}>
                  {reply.user.name} {reply.user.surname}
                </Link>
                <span className={css.commentDate}>{new Date(reply.createdAt).toLocaleDateString()}</span>
              </div>
              <p className={css.commentTextContent}>{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
