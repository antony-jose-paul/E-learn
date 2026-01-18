import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard.component';
import { FlashcardComponent } from './features/flashcard/pages/flashcard.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { SignupComponent } from './features/auth/pages/signup/signup.component';
import { LeaderboardComponent } from './features/leaderboard/pages/leaderboard.component';
import { DiscussionfomrComponent } from './features/discussionforum/pages/discussionforum.component';
import { ChatbotComponent } from './features/chatbot/pages/chatbot.component';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { HttpClientModule } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { VideoToTextComponent } from './features/video-to-text/pages/video-to-text.component';
import { ProfileComponent } from './features/profile/profile.component';
import { TeacherUploadComponent } from './features/upload-video-for-teachers/pages/upload.component';
import { VideoClassComponent } from './features/video-class/pages/video-class.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    FlashcardComponent,
    LoginComponent,
    SignupComponent,
    LeaderboardComponent,
    DiscussionfomrComponent,
    ChatbotComponent,
    VideoToTextComponent,
    ProfileComponent,
    TeacherUploadComponent,
    VideoClassComponent,
    MainLayoutComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule, // Add FormsModule here
    RouterModule,
    AppRoutingModule,
    MarkdownModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }