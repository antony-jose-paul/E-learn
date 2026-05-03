import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/pages/dashboard.component';
import { FlashcardComponent } from './features/flashcard/pages/flashcard.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { SignupComponent } from './features/auth/pages/signup/signup.component';
import { LeaderboardComponent } from './features/leaderboard/pages/leaderboard.component';
import { EmailverificationComponent } from './features/emailverification/pages/emailverification.component';
import { DiscussionfomrComponent } from './features/discussionforum/pages/discussionforum.component';
import { ChatbotComponent } from './features/chatbot/pages/chatbot.component';
import { VideoToTextComponent } from './features/video-to-text/pages/video-to-text.component';
import { ProfileComponent } from './features/profile/profile.component';
import { TeacherUploadComponent } from './features/upload-video-for-teachers/pages/upload.component';
import { TeacherNotesUploadComponent } from './features/upload-notes-for-teachers/pages/notes-upload.component';
import { TeacherCreateQuizComponent } from './features/create-quiz-for-teachers/pages/create-quiz.component';
import { VideoClassComponent } from './features/video-class/pages/video-class.component';
import { MaterialsComponent } from './features/study-materials/pages/materials.component';
import { SchedulerComponent } from './features/microlearning-scheduler/pages/scheduler.component';
import { QuizBattleComponent } from './features/quiz-battle/pages/quiz-battle.component';
import { authGuard } from './core/guard/auth.guard';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'verify-email', component: EmailverificationComponent },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'flashcard', component: FlashcardComponent },
      { path: 'leaderboard', component: LeaderboardComponent },
      { path: 'chatbot', component: ChatbotComponent },
      { path: 'discussion-forum', component: DiscussionfomrComponent },
      { path: 'video-to-text', component: VideoToTextComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'video-upload', component: TeacherUploadComponent },
      { path: 'notes-upload', component: TeacherNotesUploadComponent },
      { path: 'create-quiz', component: TeacherCreateQuizComponent },
      { path: 'video-class', component: VideoClassComponent },
      { path: 'materials', component: MaterialsComponent },
      { path: 'scheduler', component: SchedulerComponent },
      { path: 'quiz-battle', component: QuizBattleComponent },
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }