import { Loader2, Send } from 'lucide-react';
import { useT } from '@/lib/translations';
import type { Comment } from './types';
import CommentThread from './CommentThread';
import css from './BookDetails.module.css';

interface DiscussionsListProps {
  comments: Comment[];
  canComment: boolean;
  newComment: string;
  submittingComment: boolean;
  replyToId: number | null;
  replyContent: string;
  submittingReply: boolean;
  onNewCommentChange: (value: string) => void;
  onSubmitComment: (event: React.FormEvent) => void;
  onToggleReply: (id: number) => void;
  onReplyChange: (value: string) => void;
  onSubmitReply: (event: React.FormEvent) => void;
  onCancelReply: () => void;
}

export default function DiscussionsList(props: DiscussionsListProps) {
  const t = useT();

  return (
    <div className={css.commentsPanel}>
      {props.canComment && (
        <form onSubmit={props.onSubmitComment} className={`glass-panel ${css.commentForm}`}>
          <h4 className={css.sectionHeader}>{t('books.postComment')}</h4>
          <div className={css.commentInputGroup}>
            <textarea
              placeholder={t('books.commentPlaceholder')}
              value={props.newComment}
              onChange={(e) => props.onNewCommentChange(e.target.value)}
              className={`glass-input ${css.commentTextarea}`}
            />
            <button type="submit" disabled={props.submittingComment || !props.newComment} className={`btn-primary ${css.commentSubmitBtn}`}>
              {props.submittingComment ? <Loader2 size={16} className={css.spinner} /> : <Send size={16} />}
            </button>
          </div>
        </form>
      )}

      <div className={css.commentsList}>
        {props.comments.length === 0 ? (
          <p className={css.emptyText}>{t('books.noComments')}</p>
        ) : (
          props.comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              canReply={props.canComment}
              replyToId={props.replyToId}
              replyContent={props.replyContent}
              submittingReply={props.submittingReply}
              onToggleReply={props.onToggleReply}
              onReplyChange={props.onReplyChange}
              onSubmitReply={props.onSubmitReply}
              onCancelReply={props.onCancelReply}
            />
          ))
        )}
      </div>
    </div>
  );
}
