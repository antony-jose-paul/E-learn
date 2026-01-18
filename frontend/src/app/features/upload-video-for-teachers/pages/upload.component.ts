import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.development';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-teacher-upload',
  template: `
    <div class="upload-container">
      <div class="glass-panel form-card">
        <h2>⬆️ Upload Video Class</h2>
        <div class="form-group">
          <label>Title</label>
          <input type="text" [(ngModel)]="title" placeholder="Video Title" class="input-field">
        </div>
        <div class="form-group">
          <label>Subject</label>
          <input type="text" [(ngModel)]="subject" placeholder="e.g. Mathematics, AI" class="input-field">
        </div>
        <div class="form-group">
          <label>Video URL</label>
          <input type="text" [(ngModel)]="url" placeholder="YouTube or Video Link" class="input-field">
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea [(ngModel)]="description" rows="4" placeholder="Brief description of the class..." class="textarea-field"></textarea>
        </div>
        <div class="form-actions">
           <button class="btn-primary" (click)="uploadVideo()" [disabled]="isLoading">
             {{ isLoading ? 'Uploading...' : 'Upload Video' }}
           </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-container {
      display: flex;
      justify-content: center;
      padding: 40px;
    }
    .form-card {
      width: 100%;
      max-width: 600px;
      padding: 30px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    h2 {
      color: var(--text-primary);
      text-align: center;
      margin-bottom: 10px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    label {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .input-field, .textarea-field {
      padding: 12px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      color: white;
      outline: none;
      transition: all 0.3s ease;
    }
    .input-field:focus, .textarea-field:focus {
      border-color: var(--accent-primary);
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
    }
    .btn-primary {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
    }
    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `]
})
export class TeacherUploadComponent {
  title: string = '';
  subject: string = '';
  url: string = '';
  description: string = '';
  isLoading: boolean = false;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) { }

  uploadVideo() {
    if (!this.title || !this.subject || !this.url) {
      alert('Please fill in all required fields');
      return;
    }

    this.isLoading = true;
    const token = this.authService.getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    this.http.post(`${environment.BACKEND_BASE_URL}/api/video/upload`, {
      title: this.title,
      subject: this.subject,
      url: this.url,
      description: this.description
    }, { headers }).subscribe({
      next: () => {
        alert('Video uploaded successfully!');
        this.isLoading = false;
        // Reset form
        this.title = '';
        this.subject = '';
        this.url = '';
        this.description = '';
      },
      error: (err) => {
        console.error(err);
        alert('Failed to upload video');
        this.isLoading = false;
      }
    });
  }
}
