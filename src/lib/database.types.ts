export type Category = 'red_flags' | 'confesiones' | 'excusas' | 'aprendizajes';
export type ReactionType = 'red_flag' | 'clown' | 'wow';

export interface Story {
  id: string;
  category: Category;
  content: string;
  created_at: string;
  reactions_red_flag: number;
  reactions_clown: number;
  reactions_wow: number;
  total_reactions: number;
}

export interface StoryVote {
  id: string;
  story_id: string;
  voter_fingerprint: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      stories: {
        Row: Story;
        Insert: Omit<Story, 'id' | 'created_at' | 'reactions_red_flag' | 'reactions_clown' | 'reactions_wow' | 'total_reactions'>;
        Update: Partial<Omit<Story, 'id' | 'created_at'>>;
      };
      story_votes: {
        Row: StoryVote;
        Insert: Omit<StoryVote, 'id' | 'created_at'>;
        Update: Partial<Omit<StoryVote, 'id' | 'created_at'>>;
      };
    };
  };
}
