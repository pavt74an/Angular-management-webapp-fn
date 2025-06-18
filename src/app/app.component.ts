import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DashboardComponent } from './dashboard/dashboard.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NgIf,NgFor,SidebarComponent,DashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
   title = 'management-webapp';
  activeView = 'dashboard'; // Default view

  onMenuSelected(menuValue: string) {
    this.activeView = menuValue;
  }
}
