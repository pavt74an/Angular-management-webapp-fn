import { NgForOf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-sidebar',
  imports: [NgForOf],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
 @Output() menuSelected = new EventEmitter<string>();

  menuItems = [
    { icon: 'bi-grid', label: 'Dashboard', active: true, value: 'dashboard' },
    { icon: 'bi-people', label: 'Users', active: false, value: 'users' },
    { icon: 'bi-file-text', label: 'Documents', active: false, value: 'documents' },
    { icon: 'bi-images', label: 'Photos', active: false, value: 'photos' },
    { icon: 'bi-diagram-3', label: 'Hierarchy', active: false, value: 'hierarchy' },
    { icon: 'bi-chat', label: 'Message', active: false, value: 'message' },
    { icon: 'bi-question-circle', label: 'Help', active: false, value: 'help' },
    { icon: 'bi-gear', label: 'Setting', active: false, value: 'setting' },
  ];

    onMenuClick(clickedItem: any) {
    // Reset all items to inactive
    this.menuItems.forEach(item => item.active = false);
    // Set clicked item as active
    clickedItem.active = true;
    // Emit the selected menu value to parent component
    this.menuSelected.emit(clickedItem.value);
  }
}
