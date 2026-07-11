'use client';

import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import CommentsPanel from './CommentsPanel';
import { data } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';
import type { Comment } from '@/types';

export default function ArticleComments({ articleId }: { articleId: string }) {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    data.getCommentsForArticle(articleId).then(setComments);
  }, [articleId]);

  function handleAddComment(text: string, parentId?: string) {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `local-${Date.now()}`,
      user: currentUser.name,
      avatar: currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`,
      time: new Date().toISOString(),
      text,
      likes: 0,
      articleId,
      status: 'visible',
      parentId,
    };
    // TEMP: local-only, resets on refresh. Will be persisted to a real
    // "comments" collection once Appwrite is connected.
    setComments((prev) => [...prev, newComment]);
  }

  function handleReportComment(commentId: string) {
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, status: 'reported' } : c)));
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-bold text-sm transition-colors"
      >
        <MessageSquare size={16} />
        التعليقات ({comments.length})
      </button>

      <CommentsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        commentsData={comments}
        onAddComment={handleAddComment}
        onReportComment={handleReportComment}
      />
    </>
  );
}
