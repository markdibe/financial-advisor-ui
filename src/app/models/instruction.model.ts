export interface OngoingInstruction {
  id: number;
  userId: number;
  instructionText: string;
  triggerType: string;
  triggerConditions?: string;
  actions?: string;
  isActive: boolean;
  priority: number;
  executionCount: number;
  createdAt: string;
  updatedAt?: string;
  lastExecutedAt?: string;
}

export interface AgentActivity {
  id: number;
  userId: number;
  ongoingInstructionId?: number;
  ongoingInstruction?: OngoingInstruction;
  activityType: string;
  description: string;
  details?: string;
  triggeredBy?: string;
  status: string;
  errorMessage?: string;
  createdAt: string;
  isRead: boolean;
}

export interface InstructionsResponse {
  success: boolean;
  instructions: OngoingInstruction[];
  count: number;
}

export interface ActivitiesResponse {
  success: boolean;
  activities: AgentActivity[];
  count: number;
  unreadCount: number;
}

export interface CreateInstructionRequest {
  userId: number;
  instructionText: string;
  triggerType?: string;
  priority?: number;
}

export interface UpdateInstructionRequest {
  instructionText?: string;
  triggerType?: string;
  priority?: number;
  isActive?: boolean;
}
