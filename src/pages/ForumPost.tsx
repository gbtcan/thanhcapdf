import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, MessageSquare, User, Calendar, 
  Heart, Share, MoreVertical, Flag, 
  Edit, Trash2, Music, Pin, Star
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchPostById, fetchComments, deletePost, toggleLike } from '../lib/forumService';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/PageLayout';
import CommentList from '../components/forum/CommentList';
import CommentEditor from '../components/forum/CommentEditor';
import ForumSidebar from '../components/forum/ForumSidebar';
import BookmarkButton from '../components/forum/BookmarkButton';
import LoadingIndicator from '../components/LoadingIndicator';
import AlertBanner from '../components/AlertBanner';
import ReportModal from '../components/forum/ReportModal';
import ForumNav from '../components/forum/ForumNav';
import { formatDate } from '../utils/dateUtils';
import RelatedHymnPosts from '../components/forum/RelatedHymnPosts';
import { Music, FileText, Book } from 'lucide-react';

const ForumPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, userRole } = useAuth();
  const queryClient = useQueryClient();
  
  // Local state
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [replyToComment, setReplyToComment] = useState<{ id: string; userName: string } | null>(null);
  
  // Fetch post details
  const {
    data: post,
    isLoading: postLoading,
    error: postError
  } = useQuery({
    queryKey: ['forum-post', id],
    queryFn: () => fetchPostById(id!),
    enabled: !!id
  });
  
  // Fetch comments
  const {
    data: comments = [],
    isLoading: commentsLoading
  } = useQuery({
    queryKey: ['post-comments', id],
    queryFn: () => fetchComments(id!),
    enabled: !!id
  });
  
  // Check like status
  const { data: isLiked = false } = useQuery({
    queryKey: ['post-like', id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', id)
        .eq('user_id', user!.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!id && !!isAuthenticated && !!user
  });
  
  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: () => toggleLike({ userId: user!.id, postId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-post', id] });
      queryClient.invalidateQueries({ queryKey: ['post-like', id, user?.id] });
    }
  });
  
  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      navigate('/forum');
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    }
  });
  
  // Handle like button click
  const handleLike = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/forum/post/${id}` } });
      return;
    }
    
    likeMutation.mutate();
  };
  
  // Handle comment reply
  const handleReplyToComment = (commentId: string, userName: string) => {
    setReplyToComment({ id: commentId, userName });
  };
  
  // Check if user can edit the post
  const canEditPost = isAuthenticated && (
    userRole === 'administrator' || 
    userRole === 'moderator' || 
    (user?.id === post?.user_id)
  );
  
  // Cancel comment reply
  const cancelReply = () => {
    setReplyToComment(null);
  };
  
  // Handle comment submitted
  const handleCommentSubmitted = () => {
    queryClient.invalidateQueries({ queryKey: ['post-comments', id] });
    queryClient.invalidateQueries({ queryKey: ['forum-post', id] });
    setReplyToComment(null);
  };
  
  // Handle post deletion
  const handleDeletePost = () => {
    if (id) {
      deleteMutation.mutate(id);
    }
  };
  
  // Handle pin/unpin post
  const handlePinPost = async () => {
    if (!post) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_pinned: !post.is_pinned })
        .eq('id', id);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['forum-post', id] });
    } catch (error) {
      console.error('Error toggling pin status:', error);
    }
  };
  
  // Handle feature/unfeature post
  const handleFeaturePost = async () => {
    if (!post) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_featured: !post.is_featured })
        .eq('id', id);
        
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['forum-post', id] });
    } catch (error) {
      console.error('Error toggling feature status:', error);
    }
  };
  
  if (postLoading) {
    return (
      <PageLayout title="Loading Discussion">
        <div className="py-12 flex justify-center">
          <LoadingIndicator size="large" message="Loading discussion..." />
        </div>
      </PageLayout>
    );
  }
  
  if (postError || !post) {
    return (
      <PageLayout title="Discussion Not Found">
        <div className="max-w-4xl mx-auto">
          <AlertBanner
            type="error"
            title="Discussion Not Found"
            message="The requested discussion could not be found or has been removed."
          />
          <div className="mt-4">
            <Link
              to="/forum"
              className="text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Forum
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title={post.title}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <Link
                to="/forum"
                className="flex items-center text-gray-600 hover:text-indigo-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Discussions
              </Link>
            </div>
            
            <ForumNav />
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {/* Post card */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Post header */}
                <div className="p-6 border-b border-gray-200">
                  {/* Status banners */}
                  <div className="mb-2 flex flex-wrap gap-2">
                    {post.is_pinned && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Pin className="h-3 w-3 mr-1" />
                        Pinned Discussion
                      </div>
                    )}
                    
                    {post.is_featured && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Featured Discussion
                      </div>
                    )}
                    
                    {post.hymn && (
                      <Link
                        to={`/hymns/${post.hymn.id}`}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        <Music className="h-3 w-3 mr-1" />
                        {post.hymn.title}
                      </Link>
                    )}
                  </div>
                  
                  {/* Title & actions */}
                  <div className="flex justify-between items-start">
                    <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                          {canEditPost && (
                            <Link 
                              to={`/forum/edit/${post.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit className="h-4 w-4 inline mr-2" />
                              Edit
                            </Link>
                          )}
                          
                          {canEditPost && (
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4 inline mr-2" />
                              Delete
                            </button>
                          )}
                          
                          {isAuthenticated && (userRole === 'administrator' || userRole === 'moderator') && (
                            <>
                              <button
                                onClick={handlePinPost}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Pin className="h-4 w-4 inline mr-2" />
                                {post.is_pinned ? 'Unpin' : 'Pin'} Discussion
                              </button>
                              
                              <button
                                onClick={handleFeaturePost}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Star className="h-4 w-4 inline mr-2" />
                                {post.is_featured ? 'Unfeature' : 'Feature'} Discussion
                              </button>
                            </>
                          )}
                          
                          {isAuthenticated && !canEditPost && (
                            <button
                              onClick={() => {
                                setShowReportModal(true);
                                setShowMenu(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Flag className="h-4 w-4 inline mr-2" />
                              Report
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Post metadata */}
                  <div className="flex items-center mt-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                      {post.user?.avatar_url ? (
                        <img 
                          src={post.user.avatar_url} 
                          alt={post.user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-full w-full p-2 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{post.user?.name}</div>
                      <div className="text-xs text-gray-500">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(new Date(post.created_at), true)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Post content */}
                <div className="px-6 py-4">
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
                  
                  {/* Post tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <Link
                          key={tag.id}
                          to={`/forum?tagId=${tag.id}`}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Post actions */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Like button */}
                    <button
                      onClick={handleLike}
                      className={`flex items-center ${
                        isLiked 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      aria-label={isLiked ? 'Unlike post' : 'Like post'}
                    >
                      <Heart 
                        className={`h-5 w-5 mr-1 ${isLiked ? 'fill-red-600' : ''}`} 
                      />
                      <span>{post._count?.likes || 0}</span>
                    </button>
                    
                    {/* Comments counter */}
                    <button
                      className="flex items-center text-gray-600 hover:text-gray-800"
                      onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <MessageSquare className="h-5 w-5 mr-1" />
                      <span>{post._count?.comments || 0}</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Bookmark button */}
                    <BookmarkButton postId={post.id} showText />
                    
                    {/* Share button */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }}
                      className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                      <Share className="h-5 w-5 mr-1" />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Comments section */}
              <div id="comments-section" className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Comments ({post._count?.comments || 0})
                </h2>
                
                {/* Comments list */}
                {commentsLoading ? (
                  <div className="py-6 flex justify-center">
                    <LoadingIndicator size="medium" message="Loading comments..." />
                  </div>
                ) : (
                  <CommentList 
                    comments={comments} 
                    postId={post.id} 
                    onReply={handleReplyToComment} 
                  />
                )}
                
                {/* Comment editor */}
                {isAuthenticated ? (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {replyToComment ? `Reply to ${replyToComment.userName}` : 'Join the discussion'}
                    </h3>
                    
                    {replyToComment && (
                      <div className="mb-4 flex justify-between bg-gray-50 p-3 rounded-md text-sm">
                        <div>Replying to: <span className="font-medium">{replyToComment.userName}</span></div>
                        <button 
                          onClick={cancelReply}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    
                    <CommentEditor 
                      postId={post.id} 
                      replyToId={replyToComment?.id}
                      onCommentSubmitted={handleCommentSubmitted}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                    <p className="text-gray-600 mb-4">
                      Sign in to join the discussion
                    </p>
                    <Link
                      to={`/login?redirect=/forum/post/${post.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Sign In to Comment
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right sidebar */}
      <div className="hidden xl:block xl:col-span-3 space-y-6">
        {/* Related hymn information if this post is about a hymn */}
        {post.hymn && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Related Hymn</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Book className="h-8 w-8 text-indigo-500 mr-3" />
                <div>
                  <Link 
                    to={`/hymns/${post.hymn.id}`}
                    className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {post.hymn.title}
                  </Link>
                </div>
              </div>
              
              <Link
                to={`/hymns/${post.hymn.id}`}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                <FileText className="h-4 w-4 mr-1.5" />
                View Sheet Music
              </Link>
            </div>
          </div>
        )}
        
        {/* Related discussions */}
        {post.hymn && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Related Discussions</h2>
            </div>
            <div className="px-6 py-4">
              <RelatedHymnPosts 
                hymnId={post.hymn.id} 
                currentPostId={post.id}
                limit={3}
              />
            </div>
          </div>
        )}
        
        {/* Author info component */}
        {post.user && (
          <UserCard 
            user={post.user}
            joinedDate={post.user.created_at}
          />
        )}
      </div>
      
      {/* Report modal */}
      {showReportModal && (
        <ReportModal
          contentId={post.id}
          contentType="post"
          onClose={() => setShowReportModal(false)}
        />
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Discussion
            </h3>
            <p className="text-gray-500 mb-4">
              Are you sure you want to delete this discussion? This action cannot be undone 
              and all comments will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default ForumPostPage;
