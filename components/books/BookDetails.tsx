'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronLeft, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdminRedirect from '@/components/common/AdminRedirect';
import TabSwitcher from '@/components/common/TabSwitcher';
import { api } from '@/lib/api';
import { isAdminUser } from '@/lib/auth';
import { useT } from '@/lib/translations';
import { useAuthStore } from '@/store/authStore';
import BookInfo from './BookInfo';
import DiscussionsList from './DiscussionsList';
import ReviewsList from './ReviewsList';
import ShelfSelector from './ShelfSelector';
import type { BookDetailsData, Comment, Review } from './types';
import css from './BookDetails.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

type ActiveTab = 'comments' | 'reviews';

export default function BookDetails({ params }: PageProps) {
  const bookId = Number(use(params).id);
  const { user } = useAuthStore();
  const isAdmin = isAdminUser(user);
  const t = useT();
  const [details, setDetails] = useState<BookDetailsData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('comments');
  const [shelfStatus, setShelfStatus] = useState('');
  const [readPages, setReadPages] = useState(0);
  const [updatingShelf, setUpdatingShelf] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [votingReview, setVotingReview] = useState<{ reviewId: number; action: 'like' | 'dislike' } | null>(null);
  const [reviewVotes, setReviewVotes] = useState<Record<number, 'like' | 'dislike'>>({});
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const votesStorageKey = `review-votes:${user?.id ?? 'guest'}`;

  const loadAllDetails = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const detailsRes = await api.get(`/books/${bookId}/details`);
      setDetails(detailsRes.data);
      setShelfStatus(detailsRes.data.currentUserBook?.status || '');
      setReadPages(detailsRes.data.currentUserBook?.readPages || 0);

      const reviewsRes = await api.get('/reviews', { params: { page: 1, quantity: 50 } });
      setReviews(
        (reviewsRes.data?.data || reviewsRes.data || [])
          .filter((r: any) => r.bookId === bookId || r.book?.id === bookId)
          .map((review: any) => ({
            ...review,
            likesCount: review.likesCount ?? 0,
            dislikesCount: review.dislikesCount ?? 0,
          })),
      );

      const commentsRes = await api.get('/comments', { params: { bookId, page: 1, quantity: 50 } });
      setComments(commentsRes.data?.data || commentsRes.data || []);
    } catch (err) {
      console.error('Failed to load book info', err);
      if (showLoader) {
        setDetails(null);
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadAllDetails(true);
  }, [loadAllDetails]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawVotes = window.localStorage.getItem(votesStorageKey);
      setReviewVotes(rawVotes ? JSON.parse(rawVotes) : {});
    } catch {
      setReviewVotes({});
    }
  }, [votesStorageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(votesStorageKey, JSON.stringify(reviewVotes));
    } catch {
    }
  }, [reviewVotes, votesStorageKey]);

  const handleUpdateShelf = async () => {
    if (!details) return;
    setUpdatingShelf(true);
    try {
      const payload = { status: shelfStatus, readPages };
      const request = details.currentUserBook
        ? api.patch(`/user-books/${details.currentUserBook.id}`, payload)
        : api.post('/user-books', { bookId, ...payload });
      await request;
      await loadAllDetails(false);
      alert(t('books.shelfUpdated'));
    } catch (err: any) {
      alert(err.response?.data?.message || t('books.updateFailed'));
    } finally {
      setUpdatingShelf(false);
    }
  };

  const handleRemoveFromShelf = async () => {
    if (!details?.currentUserBook || !confirm(t('books.removeConfirm'))) return;
    setUpdatingShelf(true);
    try {
      await api.delete(`/user-books/${details.currentUserBook.id}`);
      await loadAllDetails(false);
    } catch (err: any) {
      alert(err.response?.data?.message || t('books.removeFailed'));
    } finally {
      setUpdatingShelf(false);
    }
  };

  const handlePostReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reviewContent) return;
    setSubmittingReview(true);
    try {
      await api.post('/reviews', { bookId, rating: reviewRating, text: reviewContent });
      setReviewContent('');
      await loadAllDetails(false);
    } catch (err: any) {
      alert(err.response?.data?.message || t('books.reviewFailed'));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVoteReview = async (reviewId: number, action: 'like' | 'dislike') => {
    if (reviewVotes[reviewId]) return;
    setVotingReview({ reviewId, action });
    
    try {
      const res = await api.post(`/reviews/${reviewId}/${action}`);
      const updatedReview = res.data;

      setReviews((currentReviews) =>
        currentReviews.map((review) => {
          if (review.id !== reviewId) return review;

          const currentLikes = review.likesCount ?? 0;
          const currentDislikes = review.dislikesCount ?? 0;

          const hasLikesCount = updatedReview && typeof updatedReview === 'object' && 'likesCount' in updatedReview;
          const hasDislikesCount = updatedReview && typeof updatedReview === 'object' && 'dislikesCount' in updatedReview;

          return {
            ...review,
            likesCount: hasLikesCount 
              ? updatedReview.likesCount 
              : (action === 'like' ? currentLikes + 1 : currentLikes),
            dislikesCount: hasDislikesCount 
              ? updatedReview.dislikesCount 
              : (action === 'dislike' ? currentDislikes + 1 : currentDislikes),
          };
        }),
      );
      
      setReviewVotes((currentVotes) => ({ ...currentVotes, [reviewId]: action }));
    } catch (err: any) {
      console.error('Помилка при кліку на лайк/дизлайк:', err);
      alert(err.response?.data?.message || t('books.reviewFailed'));
    } finally {
      setVotingReview(null);
    }
  };

  const handlePostComment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newComment) return;
    setSubmittingComment(true);
    try {
      await api.post('/comments', { bookId, text: newComment });
      setNewComment('');
      await loadAllDetails(false);
    } catch (err: any) {
      alert(err.response?.data?.message || t('books.commentFailed'));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handlePostReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!replyContent || replyToId === null) return;
    setSubmittingReply(true);
    try {
      console.log('Sending reply:', { bookId, parentId: replyToId, content: replyContent });
      await api.post('/comments/reply', { bookId, parentId: replyToId, content: replyContent });
      setReplyContent('');
      setReplyToId(null);
      await loadAllDetails(false);
    } catch (err: any) {
      alert(err.response?.data?.message || t('books.replyFailed'));
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) return <BookDetailsState message={t('common.loadingBookInfo')} />;
  if (!details) return <BookDetailsNotFound />;

  const { book, averageRating, reviewsCount, commentsCount, currentUserBook, readRightNowCount, wantToReadCount, alreadyReadCount } = details;

  return (
    <div className={css.appContainer}>
      <AdminRedirect />
      <Navbar />
      <main className={css.main}>
        <Link href="/books" className={css.backBtn}>
          <ChevronLeft size={16} />
          {t('books.backToCatalog')}
        </Link>

        <div className={css.columns}>
          <aside className={css.leftCol}>
            <ShelfSelector
              book={book}
              averageRating={averageRating}
              reviewsCount={reviewsCount}
              readRightNowCount={readRightNowCount}
              wantToReadCount={wantToReadCount}
              alreadyReadCount={alreadyReadCount}
              currentUserBook={currentUserBook}
              shelfStatus={shelfStatus}
              readPages={readPages}
              updatingShelf={updatingShelf}
              showShelf={Boolean(user) && !isAdmin}
              onStatusChange={setShelfStatus}
              onReadPagesChange={setReadPages}
              onSave={handleUpdateShelf}
              onRemove={handleRemoveFromShelf}
            />
          </aside>

          <section className={css.rightCol}>
            <BookInfo book={book} />
            <TabSwitcher
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab as ActiveTab)}
              tabs={[
                { key: 'comments', label: `${t('books.discussion')} (${commentsCount})` },
                { key: 'reviews', label: `${t('books.reviewList')} (${reviewsCount})` },
              ]}
            />
            <div className={css.tabContent}>
              {activeTab === 'comments' ? (
                <DiscussionsList
                  comments={comments}
                  canComment={Boolean(user)}
                  newComment={newComment}
                  submittingComment={submittingComment}
                  replyToId={replyToId}
                  replyContent={replyContent}
                  submittingReply={submittingReply}
                  onNewCommentChange={setNewComment}
                  onSubmitComment={handlePostComment}
                  onToggleReply={(id) => setReplyToId(replyToId === id ? null : id)}
                  onReplyChange={setReplyContent}
                  onSubmitReply={handlePostReply}
                  onCancelReply={() => setReplyToId(null)}
                />
              ) : (
                <ReviewsList
                  reviews={reviews}
                  canReview={Boolean(user) && !isAdmin}
                  canVote={Boolean(user) && !isAdmin}
                  reviewContent={reviewContent}
                  reviewRating={reviewRating}
                  submittingReview={submittingReview}
                  votingReview={votingReview}
                  reviewVotes={reviewVotes}
                  onReviewContentChange={setReviewContent}
                  onRatingChange={setReviewRating}
                  onSubmitReview={handlePostReview}
                  onVoteReview={handleVoteReview}
                />
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function BookDetailsState({ message }: { message: string }) {
  return (
    <div className={css.appContainer}>
      <Navbar />
      <div className={css.loaderContainer}>
        <Loader2 size={48} className={css.spinner} />
        <p>{message}</p>
      </div>
    </div>
  );
}

function BookDetailsNotFound() {
  const t = useT();

  return (
    <div className={css.appContainer}>
      <Navbar />
      <div className={css.errorContainer}>
        <BookOpen size={48} color="#4b5563" />
        <h2>{t('books.notFound')}</h2>
        <Link href="/books" className="btn-primary">{t('books.backToCatalog')}</Link>
      </div>
    </div>
  );
}
