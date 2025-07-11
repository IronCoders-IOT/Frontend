// header-content.component.ts
import { Component } from '@angular/core';
import { RouterModule,Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
  selector: 'app-header-content',
  templateUrl: './header-content.component.html',
  styleUrls: ['./header-content.component.css'],
  standalone: true,  imports: [
    RouterModule,
    CommonModule
  ]
})
export class HeaderContentComponent {

  username: string | null = null;


  constructor(private router: Router, private translationService: TranslationService) {
  }

  ngOnInit(): void {
    this.identifyUser();
  }

  private loadUsername(): void {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.username === 'admin') {
          this.username = user.username;
        }
        else{
          this.username = 'provider';
        }


      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.username = null;

      }
    }
  }
  navigateToDashboard(): void {
    if (this.username === 'admin') {
      this.router.navigate(['/admin/admin-dashboard']);
    } else if (this.username === 'provider') {
      this.router.navigate(['/home']);
    }
  }

  identifyUser(): void {
    this.loadUsername();

  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
