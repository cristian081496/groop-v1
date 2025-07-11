export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  imageURL?: string;
  pinned: boolean;
  views: number;
  likes: string[];
  likeCount: number;
  createdAt: string;
  updatedAt: string;
}
