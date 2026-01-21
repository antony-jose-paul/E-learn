import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';

export interface UserInfo{
  user_id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'e_learning_token';
  private storedUser = 'e_learning_user';

  private userDetails = new BehaviorSubject<UserInfo | null>(null);
  user$ = this.userDetails.asObservable();

  constructor() {
    const elearningUser = localStorage.getItem(this.storedUser);

    if(elearningUser){
      this.userDetails.next(JSON.parse(elearningUser));
    }
  }

  setUserDetails(user: UserInfo): void{
    localStorage.setItem(this.storedUser, JSON.stringify(user));
    this.userDetails.next(user);
  }

  setToken(token: string): void{
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if(!token) return false;

    try{
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    }catch{
      return false;
    }
  }

  logout(): void{
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.storedUser);
  }

  getUser(): UserInfo | null {
    return this.userDetails.getValue();
  }

  isReviewer(): boolean {
    const user = this.getUser();
    return user?.role === 'reviewer';
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  isTeacher(): boolean {
    const user = this.getUser();
    return user?.role === 'teacher';
  }
}
