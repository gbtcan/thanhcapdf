/**
 * Types for social features
 */

export interface ShareOptions {
  title: string;
  url: string;
  description?: string;
  hashtags?: string[];
}

export interface ShareDestination {
  name: string;
  icon: React.ReactNode;
  shareUrl: (options: ShareOptions) => string;
  color: string;
  bgColor: string;
}

export interface UserTagging {
  userId: string;
  displayName: string;
  offset: number;
  length: number;
}

export interface EmojiReaction {
  emoji: string;
  count: number;
  users: {
    id: string;
    name: string;
  }[];
  reacted: boolean;
}
