'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Heart, 
  MoreVertical, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  LogIn
} from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { isAdmin as checkIsAdmin } from '@/lib/auth';

interface Comment {
  id: string;
  gameId: string;
  userId: string;
  parentId: string | null;
  content: string;
  isLovedByAdmin: boolean;
  createdAt: string;
  Profile?: {
    email: string;
    fullName?: string;
    avatarUrl?: string;
  };
  replies?: Comment[];
  likes: number;
  dislikes: number;
  userInteraction?: 'like' | 'dislike' | null;
}

interface CommentSectionProps {
  gameId: string;
  isAdmin?: boolean;
}

export function CommentSection({ gameId }: { gameId: string }) {
  const supabase = createClientComponentClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = checkIsAdmin(user);

  const fetchComments = useCallback(async () => {
    try {
      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('Comment')
        .select(`
          *,
          Profile (
            email,
            fullName,
            avatarUrl
          ),
          CommentInteraction (
            userId,
            type
          )
        `)
        .eq('gameId', gameId)
        .order('createdAt', { ascending: false });

      if (commentsError) throw commentsError;

      const formattedComments = (commentsData || []).map((c: any) => {
        const likes = c.CommentInteraction?.filter((i: any) => i.type === 'like').length || 0;
        const dislikes = c.CommentInteraction?.filter((i: any) => i.type === 'dislike').length || 0;
        const userInteraction = c.CommentInteraction?.find((i: any) => i.userId === user?.id)?.type || null;

        return {
          ...c,
          likes,
          dislikes,
          userInteraction,
          replies: []
        };
      });

      // Build tree structure
      const commentMap = new Map();
      const rootComments: Comment[] = [];

      formattedComments.forEach(c => commentMap.set(c.id, c));
      formattedComments.forEach(c => {
        if (c.parentId) {
          const parent = commentMap.get(c.parentId);
          if (parent) {
            parent.replies.push(c);
          }
        } else {
          rootComments.push(c);
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, supabase, user?.id]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
    fetchComments();

    // Realtime subscription
    const channel = supabase
      .channel('comments-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Comment' }, () => fetchComments())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'CommentInteraction' }, () => fetchComments())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchComments]);

  const handleSubmit = async (e: React.FormEvent, parentId: string | null = null, replyText: string = '') => {
    e.preventDefault();
    const content = parentId ? replyText : newComment;
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('Comment').insert({
        gameId,
        userId: user.id,
        parentId,
        content: content.trim()
      });

      if (error) throw error;
      if (!parentId) setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInteraction = async (commentId: string, type: 'like' | 'dislike') => {
    if (!user) return;

    try {
      // Check if interaction exists
      const { data: existing } = await supabase
        .from('CommentInteraction')
        .select()
        .eq('commentId', commentId)
        .eq('userId', user.id)
        .single();

      if (existing) {
        if (existing.type === type) {
          // Remove if same type
          await supabase
            .from('CommentInteraction')
            .delete()
            .eq('commentId', commentId)
            .eq('userId', user.id);
        } else {
          // Update if different type
          await supabase
            .from('CommentInteraction')
            .update({ type })
            .eq('commentId', commentId)
            .eq('userId', user.id);
        }
      } else {
        // Insert new
        await supabase
          .from('CommentInteraction')
          .insert({ commentId, userId: user.id, type });
      }
    } catch (error) {
      console.error('Error interacting with comment:', error);
    }
  };

  const handleAdminLove = async (commentId: string, currentStatus: boolean) => {
    if (!isAdmin) return;
    try {
      await supabase
        .from('Comment').update({ isLovedByAdmin: !currentStatus }).eq('id', commentId);
    } catch (error) {
      console.error('Error toggling admin love:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await supabase.from('Comment').delete().eq('id', commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic">
            Comms <span className="text-emerald-500">Link</span>
          </h2>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
        >
          {isExpanded ? (
            <>Collapse <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Expand <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      </div>

      <div className={`glass rounded-3xl border border-white/10 overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[800px]' : 'max-h-[400px]'}`}>
        <div className="p-6 space-y-6 overflow-y-auto max-h-full custom-scrollbar">
          {/* Post Comment Form */}
          {user ? (
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts on this game..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none text-sm"
                />
                <div className="absolute bottom-4 right-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="px-6 py-2 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-tight hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 border-dashed text-center space-y-4">
              <p className="text-white/40 font-medium italic">You must be connected to join the comms link.</p>
              <Link 
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-tight hover:bg-emerald-400 transition-all"
              >
                <LogIn className="w-4 h-4" /> Login to Comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-8">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  user={user}
                  isAdmin={isAdmin}
                  onInteract={handleInteraction}
                  onReply={handleSubmit}
                  onLove={handleAdminLove}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="text-center py-12 space-y-2">
                <p className="text-white/20 font-black uppercase tracking-widest text-xs">No comms detected</p>
                <p className="text-white/10 text-[10px] uppercase font-bold">Be the first to transmit a message</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentItem({ 
  comment, 
  user, 
  isAdmin, 
  onInteract, 
  onReply, 
  onLove, 
  onDelete,
  depth = 0 
}: { 
  comment: Comment; 
  user: any; 
  isAdmin?: boolean;
  onInteract: (id: string, type: 'like' | 'dislike') => void;
  onReply: (e: React.FormEvent, parentId: string, text: string) => void;
  onLove: (id: string, status: boolean) => void;
  onDelete: (id: string) => void;
  depth?: number;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (e: React.FormEvent) => {
    onReply(e, comment.id, replyText);
    setIsReplying(false);
    setReplyText('');
  };

  return (
    <div className={`space-y-4 ${depth > 0 ? 'ml-6 pl-6 border-l border-white/5' : ''}`}>
      <div className={`p-4 rounded-2xl bg-white/5 border transition-all ${comment.isLovedByAdmin ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-white/5'}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 overflow-hidden relative">
              {comment.Profile?.avatarUrl ? (
                <Image 
                  src={comment.Profile.avatarUrl} 
                  alt="Avatar" 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white/40">
                  {comment.Profile?.email?.[0].toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-tight text-white/80">
                  {comment.Profile?.fullName || comment.Profile?.email?.split('@')[0] || 'Unknown User'}
                </span>
                {comment.isLovedByAdmin && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                    <Heart className="w-2 h-2 fill-current" /> Dev Loved
                  </span>
                )}
              </div>
              <span className="text-[9px] text-white/20 font-bold uppercase">
                {formatDistanceToNow(new Date(comment.createdAt))} ago
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isAdmin && (
              <button 
                onClick={() => onLove(comment.id, comment.isLovedByAdmin)}
                className={`p-2 rounded-lg transition-all ${comment.isLovedByAdmin ? 'text-emerald-500 bg-emerald-500/10' : 'text-white/20 hover:text-emerald-500 hover:bg-white/5'}`}
              >
                <Heart className={`w-4 h-4 ${comment.isLovedByAdmin ? 'fill-current' : ''}`} />
              </button>
            )}
            {(isAdmin || user?.id === comment.userId) && (
              <button 
                onClick={() => onDelete(comment.id)}
                className="p-2 rounded-lg text-white/20 hover:text-red-500 hover:bg-white/5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-3 text-sm text-white/70 leading-relaxed">
          {comment.content}
        </p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1 bg-black/20 rounded-xl p-1">
            <button 
              onClick={() => onInteract(comment.id, 'like')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest ${comment.userInteraction === 'like' ? 'bg-emerald-500 text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <ThumbsUp className="w-3 h-3" /> {comment.likes}
            </button>
            <button 
              onClick={() => onInteract(comment.id, 'dislike')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest ${comment.userInteraction === 'dislike' ? 'bg-red-500/20 text-red-500' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              <ThumbsDown className="w-3 h-3" /> {comment.dislikes}
            </button>
          </div>

          <button 
            onClick={() => setIsReplying(!isReplying)}
            className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${isReplying ? 'text-emerald-500' : 'text-white/20 hover:text-white'}`}
          >
            <Reply className="w-3 h-3" /> Reply
          </button>
        </div>

        <AnimatePresence>
          {isReplying && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleReplySubmit}
              className="mt-4 pt-4 border-t border-white/5 space-y-3"
            >
              <textarea
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none min-h-[80px]"
              />
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-4 py-2 bg-emerald-500 text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50"
                >
                  Reply
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              user={user}
              isAdmin={isAdmin}
              onInteract={onInteract}
              onReply={onReply}
              onLove={onLove}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
