// header-content.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-content',
  templateUrl: './header-content.component.html',
  styleUrls: ['./header-content.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ]
})
export class HeaderContentComponent {
  constructor() {}
}