import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface Thread {
    id: string;
    title: string;
    content: string;
    author: string;
    replies: number;
    views: number;
    createdAt: string;
    lastReplyAt: string;
}

export interface Reply {
    id: string;
    threadId: string;
    content: string;
    author: string;
    createdAt: string;
    likes: number;
}

export interface CreateThreadRequest {
    title: string;
    content: string;
    author_id: string;
}

export interface AddReplyRequest {
    thread_id: string;
    content: string;
    author_id: string;
}

@Injectable({
    providedIn: 'root'
})
export class DiscussionService {
    private apiUrl = `${environment.BACKEND_BASE_URL}/api/user/discussion`;

    constructor(private http: HttpClient) { }

    getThreads(): Observable<Thread[]> {
        return this.http.get<Thread[]>(this.apiUrl);
    }

    createThread(data: CreateThreadRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/create`, data);
    }

    updateThread(threadId: string, data: { title: string, content: string }): Observable<any> {
        return this.http.put(`${this.apiUrl}/${threadId}`, data);
    }

    getReplies(threadId: string): Observable<Reply[]> {
        return this.http.get<Reply[]>(`${this.apiUrl}/${threadId}/replies`);
    }

    addReply(data: AddReplyRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/reply`, data);
    }

    deleteThread(threadId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${threadId}`);
    }

    deleteReply(replyId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/reply/${replyId}`);
    }
}
