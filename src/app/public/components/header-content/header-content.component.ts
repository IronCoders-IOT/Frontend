import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
@Component({
  selector: 'app-header-content',
  imports: [
    NgOptimizedImage, MatButtonModule, MatDividerModule, MatIconModule
  ],
  templateUrl: './header-content.component.html',
  standalone: true,
  styleUrl: './header-content.component.css'
})
export class HeaderContentComponent {

}
