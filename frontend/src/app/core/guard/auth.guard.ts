import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (!authService.isLoggedIn()) {
    const router = inject(Router);
    router.navigate(['/login']);
    return false;
  }

  // Check for role-based restriction
  const user = authService.getUser();
  if (user) {
    const role = user.role;
    const url = state.url;

    // Admin has access to everything
    if (role === 'admin') {
      return true;
    }

    // Reviewer Restriction
    if (role === 'reviewer') {
      const allowedRoutes = ['/discussion-forum', '/profile'];
      const isAllowed = allowedRoutes.some(r => url.startsWith(r));
      if (!isAllowed) {
        const router = inject(Router);
        router.navigate(['/discussion-forum']);
        return false;
      }
    }

    // Teacher Restriction
    if (role === 'teacher') {
      const allowedRoutes = ['/video-upload', '/profile', '/video-class', '/discussion-forum'];
      const isAllowed = allowedRoutes.some(r => url.startsWith(r));
      if (!isAllowed) {
        const router = inject(Router);
        router.navigate(['/profile']);
        return false;
      }
    }

    // Student Restriction (Default)
    if (role === 'student') {
      const restrictedRoutes = ['/video-upload'];
      const isRestricted = restrictedRoutes.some(r => url.startsWith(r));
      if (isRestricted) {
        const router = inject(Router);
        router.navigate(['/dashboard']);
        return false;
      }
    }
  }

  return true;
};
