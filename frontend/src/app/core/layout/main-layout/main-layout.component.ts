import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserInfo } from '../../auth/auth.service';
import { environment } from 'src/environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

interface MenuItem {
    name: string;
    icon: string;
    route: string;
}

@Component({
    selector: 'app-main-layout',
    templateUrl: './main-layout.component.html',
    styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
    isSidebarCollapsed: boolean = false;
    isDarkMode: boolean = false;
    userDetails: UserInfo | null = null;

    menuItems = {
        overview: [
            { name: 'Dashboard', icon: '📊', route: '/dashboard' },
            { name: 'Leaderboard', icon: '🏆', route: '/leaderboard' }
        ],
        learn: [
            { name: 'Video Class', icon: '🎥', route: '/video-class' },
            { name: 'Materials', icon: '📚', route: '/materials' },
            { name: 'Video to Text', icon: '✨', route: '/video-to-text' },
            { name: 'Learning Paths', icon: '🛤️', route: '/learning-paths' }
        ],
        practice: [
            { name: 'Chatbot', icon: '🤖', route: '/chatbot' },
            { name: 'Flash Card', icon: '🎴', route: '/flashcard' },
            { name: 'Quiz', icon: '📝', route: '/quiz' },
            { name: 'Discussion Forum', icon: '💬', route: '/discussion-forum' }
        ],
        profile: [
            { name: 'Profile', icon: '👤', route: '/profile' }
        ],
        teacher: [
            { name: 'Upload Video', icon: '⬆️', route: '/video-upload' }
        ]
    };

    filteredOverviewItems: MenuItem[] = [];
    filteredLearnItems: MenuItem[] = [];
    filteredPracticeItems: MenuItem[] = [];
    filteredProfileItems: MenuItem[] = [];
    filteredTeacherItems: MenuItem[] = [];

    constructor(
        private router: Router,
        private authService: AuthService,
        private http: HttpClient
    ) { }

    ngOnInit(): void {
        this.loadUserData();
        this.loadThemePreference();

        this.authService.user$.subscribe(user => {
            this.userDetails = user;
            this.filterMenu();
        });
    }

    filterMenu(): void {
        const isReviewer = this.authService.isReviewer();
        const isTeacher = this.authService.isTeacher();
        const isAdmin = this.authService.isAdmin();

        if (isAdmin) {
            // Admin sees everything
            this.filteredOverviewItems = this.menuItems.overview;
            this.filteredLearnItems = this.menuItems.learn;
            this.filteredPracticeItems = this.menuItems.practice;
            this.filteredProfileItems = this.menuItems.profile;
            this.filteredTeacherItems = this.menuItems.teacher;
        } else if (isReviewer) {
            this.filteredOverviewItems = [];
            this.filteredLearnItems = [];
            this.filteredPracticeItems = this.menuItems.practice.filter(item => item.route === '/discussion-forum');
            this.filteredProfileItems = this.menuItems.profile;
            this.filteredTeacherItems = [];
        } else if (isTeacher) {
            this.filteredOverviewItems = []; // Or maybe dashboard? User didn't specify, safest to restrict as requested "only perform in their respective routes"
            this.filteredLearnItems = this.menuItems.learn; // Teachers usually need to see materials/videos
            this.filteredPracticeItems = this.menuItems.practice.filter(item => item.route === '/discussion-forum'); // Teachers might want to see discussions
            this.filteredProfileItems = this.menuItems.profile;
            this.filteredTeacherItems = this.menuItems.teacher;
        } else {
            // Student (Default)
            this.filteredOverviewItems = this.menuItems.overview;
            this.filteredLearnItems = this.menuItems.learn;
            this.filteredPracticeItems = this.menuItems.practice;
            this.filteredProfileItems = this.menuItems.profile;
            this.filteredTeacherItems = [];
        }
    }

    loadUserData(): void {
        const storedUser = localStorage.getItem('e_learning_user');
        if (storedUser) {
            this.userDetails = JSON.parse(storedUser);
        }
    }

    loadThemePreference(): void {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.isDarkMode = true;
            document.body.classList.add('dark-mode');
        }
    }

    toggleSidebar(): void {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    toggleTheme(): void {
        this.isDarkMode = !this.isDarkMode;

        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }

    getInitials(): string {
        if (this.userDetails?.name) {
            const names = this.userDetails.name.split(' ');
            if (names.length >= 2) {
                return (names[0][0] + names[1][0]).toUpperCase();
            }
            return names[0][0].toUpperCase();
        }
        return '??';
    }

    logout(): void {
        const user_token = localStorage.getItem('e_learning_token');
        if (user_token) {
            try {
                const decode_token: any = jwtDecode(user_token);
                this.http.post<any>(`${environment.BACKEND_BASE_URL}/api/auth/logout`, { session: decode_token.session }).subscribe({
                    next: (res) => console.log('Logout successful:', res),
                    error: (err) => console.error('Logout error:', err)
                });
            } catch (e) {
                console.error('Error decoding token', e);
            }
        }
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    isActive(route: string): boolean {
        return this.router.url === route;
    }
}
