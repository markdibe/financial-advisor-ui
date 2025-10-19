import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  OngoingInstruction,
  AgentActivity,
  InstructionsResponse,
  ActivitiesResponse,
  CreateInstructionRequest,
  UpdateInstructionRequest,
} from '../models/instruction.model';

@Injectable({
  providedIn: 'root',
})
export class InstructionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all instructions for a user
   */
  getInstructions(userId: number): Observable<InstructionsResponse> {
    return this.http.get<InstructionsResponse>(
      `${this.apiUrl}/instructions/user/${userId}`
    );
  }

  /**
   * Create a new instruction
   */
  createInstruction(
    request: CreateInstructionRequest
  ): Observable<{
    success: boolean;
    message: string;
    instruction: OngoingInstruction;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      instruction: OngoingInstruction;
    }>(`${this.apiUrl}/instructions`, request);
  }

  /**
   * Update an instruction
   */
  updateInstruction(
    id: number,
    request: UpdateInstructionRequest
  ): Observable<{
    success: boolean;
    message: string;
    instruction: OngoingInstruction;
  }> {
    return this.http.put<{
      success: boolean;
      message: string;
      instruction: OngoingInstruction;
    }>(`${this.apiUrl}/instructions/${id}`, request);
  }

  /**
   * Delete an instruction
   */
  deleteInstruction(
    id: number
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/instructions/${id}`
    );
  }

  /**
   * Toggle instruction active status
   */
  toggleInstruction(
    id: number
  ): Observable<{
    success: boolean;
    message: string;
    instruction: OngoingInstruction;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      instruction: OngoingInstruction;
    }>(`${this.apiUrl}/instructions/${id}/toggle`, {});
  }

  /**
   * Get agent activities for a user
   */
  getActivities(
    userId: number,
    limit: number = 50,
    unreadOnly: boolean = false
  ): Observable<ActivitiesResponse> {
    return this.http.get<ActivitiesResponse>(
      `${this.apiUrl}/instructions/activities/${userId}?limit=${limit}&unreadOnly=${unreadOnly}`
    );
  }

  /**
   * Mark activities as read
   */
  markActivitiesRead(
    activityIds: number[]
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/instructions/activities/mark-read`,
      { activityIds }
    );
  }
}
