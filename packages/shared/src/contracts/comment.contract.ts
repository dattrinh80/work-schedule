import { TaskComment } from '../types/models.js';

export interface CreateCommentDto {
  content: string;
}

export interface CommentListResponseDto {
  comments: TaskComment[];
  total: number;
}
