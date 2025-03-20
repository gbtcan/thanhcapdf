import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Smile, ThumbsUp, Heart, Coffee, Zap, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmojiReactionProps {
  contentId: string;
  contentType: 'post' | 'comment';
  className?: string;
}

type ReactionType = 'like' | 'love' | 'thanks' | 'insightful' | 'celebrate';

interface ReactionCount {
  type: ReactionType;
  count: number;
  hasReacted: boolean;
}

const EmojiReaction: React.FC<EmojiReactionProps> = ({ 
  contentId, 
  contentType, 
  className = '' 
}) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  
  // Fetch existing reactions
  const { data: reactionCounts = [] } = useQuery({
    queryKey: ['reactions', contentType, contentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reactions')
        .select('type, user_id')
        .eq('content_type', contentType)
        .eq('content_id', contentId);
        
      if (error) throw error;
      
      // Group by type and count
      const counts: Record<string, ReactionCount> = {};
      data.forEach(reaction => {
        const type = reaction.type as ReactionType;
        if (!counts[type]) {
          counts[type] = {
            type,
            count: 0,
            hasReacted: false
          };
        }
        
        counts[type].count++;
        
        if (user && reaction.user_id === user.id) {
          counts[type].hasReacted = true;
        }
      });
      
      return Object.values(counts);
    },
    enabled: !!contentId
  });
  
  // Toggle reaction mutation
  const toggleReactionMutation = useMutation({
    mutationFn: async ({ type }: { type: ReactionType }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Check if user has already reacted with this type
      const { data: existingReaction, error: checkError } = await supabase
        .from('reactions')
        .select('id')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('user_id', user.id)
        .eq('type', type)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      // If existing reaction, delete it
      if (existingReaction) {
        const { error: deleteError } = await supabase
          .from('reactions')
          .delete()
          .eq('id', existingReaction.id);
          
        if (deleteError) throw deleteError;
        return { added: false, type };
      }
      
      // Otherwise add new reaction
      const { error: insertError } = await supabase
        .from('reactions')
        .insert({
          content_type: contentType,
          content_id: contentId,
          user_id: user.id,
          type
        });
        
      if (insertError) throw insertError;
      return { added: true, type };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', contentType, contentId] });
      setShowReactionPicker(false);
    }
  });
  
  // Handle reaction click
  const handleReactionClick = (type: ReactionType) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    toggleReactionMutation.mutate({ type });
  };
  
  // Reaction button definitions with icons and labels
  const reactionButtons = [
    { type: 'like' as ReactionType, icon: <ThumbsUp className="h-4 w-4" />, label: 'Like' },
    { type: 'love' as ReactionType, icon: <Heart className="h-4 w-4" />, label: 'Love' },
    { type: 'thanks' as ReactionType, icon: <Coffee className="h-4 w-4" />, label: 'Thanks' },
    { type: 'insightful' as ReactionType, icon: <Zap className="h-4 w-4" />, label: 'Insightful' },
  ];
  
  // Get emoji for reaction type
  const getEmojiForReaction = (type: ReactionType) => {
    switch(type) {
      case 'like': return '👍';
      case 'love': return '❤️';
      case 'thanks': return '☕';
      case 'insightful': return '⚡';
      case 'celebrate': return '🎉';
      default: return '👍';
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Reaction picker */}
      <div className="flex items-center space-x-1">
        {/* Show existing reactions */}
        {reactionCounts.map(reaction => (
          <button
            key={reaction.type}
            onClick={() => handleReactionClick(reaction.type)}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
              reaction.hasReacted
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{getEmojiForReaction(reaction.type)}</span>
            <span>{reaction.count}</span>
          </button>
        ))}
        
        {/* Add reaction button */}
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          <Smile className="h-4 w-4" />
        </button>
      </div>
      
      {/* Reaction picker dropdown */}
      {showReactionPicker && (
        <div className="absolute bottom-full mb-2 bg-white rounded-lg shadow-md border border-gray-200 p-2 z-10">
          <div className="flex space-x-2">
            {reactionButtons.map(button => {
              // Find if user has this reaction
              const userReaction = reactionCounts.find(r => r.type === button.type && r.hasReacted);
              
              return (
                <button
                  key={button.type}
                  onClick={() => handleReactionClick(button.type)}
                  disabled={toggleReactionMutation.isPending}
                  className={`p-2 rounded-full ${
                    userReaction
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'hover:bg-gray-100'
                  }`}
                  title={button.label}
                >
                  {toggleReactionMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    button.icon
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiReaction;
