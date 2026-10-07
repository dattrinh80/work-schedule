import { Subtask } from '../types/models.js';

export interface CreateSubtaskDto {
  title: string;
  assigneeUserId?: string;
}

export interface UpdateSubtaskDto {
  title?: string;
  isCompleted?: boolean;
  assigneeUserId?: string;
}

export interface SubtaskListResponseDto {
  subtasks: Subtask[];
  total: number;
}
