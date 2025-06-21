import { Component, OnInit } from '@angular/core';
import { AddUserModalComponent } from '../add-user-modal/add-user-modal.component';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserService, User, Role, DataTableRequest } from '../services/UserService';

// Interface for display purposes (mapping API response to UI format)
export interface DisplayUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleColor: string;
  createDate: string;
  updatedDate: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [AddUserModalComponent, FormsModule, NgForOf, NgIf, HttpClientModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [UserService]
})
export class DashboardComponent implements OnInit {
  searchTerm: string = '';
  selectedSort: string = 'createdAt';
  selectedSortDirection: 'asc' | 'desc' = 'desc';
  selectedSavedSearch: string = '';
  itemsPerPage: number = 6;
  currentPage: number = 1;
  showAddUserModal: boolean = false;
  editMode: boolean = false;
  userToEdit: any = null;
  loading: boolean = false;
  error: string = '';

  users: DisplayUser[] = [];
  roles: Role[] = [];
  totalRecords: number = 0;
  filteredRecords: number = 0;
  totalPages: number = 1;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles() {
    this.userService.getRoles().subscribe({
      next: (roles: any) => {
        console.log('Roles Response:', roles);
        
        // Handle specific API format: { status: {...}, data: [...] }
        if (roles && Array.isArray(roles.data)) {
          this.roles = roles.data;
        } else if (Array.isArray(roles)) {
          this.roles = roles;
        } else if (roles && typeof roles === 'object') {
          const possibleArrayKeys = ['data', 'roles', 'items', 'result'];
          for (const key of possibleArrayKeys) {
            if (Array.isArray(roles[key])) {
              this.roles = roles[key];
              break;
            }
          }
        }
        
        // If no valid roles found, keep empty array
        if (!Array.isArray(this.roles)) {
          this.roles = [];
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.roles = [];
        if (error.status === 0) {
          this.error = 'Cannot connect to API server. Please check if the server is running.';
        } else {
          this.error = 'Failed to load roles from server.';
        }
      }
    });
  }

  loadUsers() {
    this.loading = true;
    this.error = '';

    const request: DataTableRequest = {
      orderBy: this.selectedSort,
      orderDirection: this.selectedSortDirection,
      pageNumber: this.currentPage.toString(),
      pageSize: this.itemsPerPage.toString(),
      search: this.searchTerm
    };

    this.userService.getUsersDataTable(request).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        
        let userData: User[] = [];
        let totalRecords = 0;
        let filteredRecords = 0;

        if (response && response.data && Array.isArray(response.data.users)) {
          userData = response.data.users;
          totalRecords = response.data.totalCount || 0;
          filteredRecords = response.data.totalCount || 0;
        } else if (Array.isArray(response)) {
          userData = response;
          totalRecords = response.length;
          filteredRecords = response.length;
        } else if (response && Array.isArray(response.data)) {
          userData = response.data;
          totalRecords = response.totalRecords || response.recordsTotal || response.data.length;
          filteredRecords = response.filteredRecords || response.recordsFiltered || response.data.length;
        } else if (response && typeof response === 'object') {
          const possibleArrayKeys = ['data', 'users', 'items', 'result'];
          for (const key of possibleArrayKeys) {
            if (Array.isArray(response[key])) {
              userData = response[key];
              totalRecords = response.totalRecords || response.recordsTotal || userData.length;
              filteredRecords = response.filteredRecords || response.recordsFiltered || userData.length;
              break;
            }
          }
        }

        // If no valid data found, use empty array
        if (!Array.isArray(userData)) {
          console.error('Invalid API response format:', response);
          userData = [];
        }

        this.users = this.mapUsersToDisplayFormat(userData);
        this.totalRecords = totalRecords;
        this.filteredRecords = filteredRecords;
        this.calculatePagination();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
        this.users = []; // Clear users array on error
        
        if (error.status === 0) {
          this.error = 'Cannot connect to API server. Please check if the server is running.';
        } else if (error.status === 500) {
          this.error = 'Internal server error. Please try again later.';
        } else if (error.status === 404) {
          this.error = 'API endpoint not found.';
        } else {
          this.error = 'Failed to load users from server.';
        }
      }
    });
  }

  private mapUsersToDisplayFormat(apiUsers: User[]): DisplayUser[] {
    if (!Array.isArray(apiUsers)) {
      console.error('mapUsersToDisplayFormat: apiUsers is not an array:', apiUsers);
      return [];
    }

    return apiUsers.map(user => {
      const roleName = user.role ? user.role.roleName : 'Unknown Role';
      
      return {
        id: user.id || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.email || '',
        role: roleName,
        roleColor: this.getRoleColor(roleName),
        createDate: this.userService.formatDate(user.createdAt),
        updatedDate: this.userService.formatDate(user.updatedAt),
        description: 'User Description'
      };
    });
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredRecords / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
      this.loadUsers();
    }
  }

  getPaginatedUsers(): DisplayUser[] {
    return this.users;
  }

  onSearch() {
    this.currentPage = 1;
    this.loadUsers();
  }

  onSort(sortBy: string) {
    if (this.selectedSort === sortBy) {
      this.selectedSortDirection = this.selectedSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.selectedSort = sortBy;
      this.selectedSortDirection = 'asc';
    }
    this.currentPage = 1;
    this.loadUsers();
  }

  openAddUserModal() {
    this.editMode = false;
    this.userToEdit = null;
    this.showAddUserModal = true;
  }

  openEditUserModal(user: DisplayUser) {
    console.log('Opening edit modal for user:', user);
    this.editMode = true;
    this.userToEdit = user;
    this.showAddUserModal = true;
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
    this.editMode = false;
    this.userToEdit = null;
  }

  onUserAdded(eventData: any) {
    if (eventData.success) {
      this.error = '';
      const successMessage = eventData.message || 'User created successfully!';
      console.log(successMessage);
      this.showSuccessMessage(successMessage);
      this.loadUsers();
      this.closeAddUserModal();
    }
  }

  onUserUpdated(eventData: any) {
    if (eventData.success) {
      this.error = '';
      const successMessage = eventData.message || 'User updated successfully!';
      console.log(successMessage);
      this.showSuccessMessage(successMessage);
      this.loadUsers();
      this.closeAddUserModal();
    }
  }

  private showSuccessMessage(message: string) {
    const originalError = this.error;
    this.error = `SUCCESS: ${message}`;
    
    setTimeout(() => {
      if (this.error.startsWith('SUCCESS:')) {
        this.error = originalError;
      }
    }, 3000);
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'Super Admin':
      case 'Admin':
      case 'HR Admin':
        return 'primary';
      case 'Employee':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.loading = true;
      this.error = '';
      
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          console.log('User deleted successfully');
          this.showSuccessMessage('User deleted successfully!');
          this.loadUsers();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.error = 'Failed to delete user';
          this.loading = false;
        }
      });
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  onItemsPerPageChange() {
    this.currentPage = 1;
    this.loadUsers();
  }

  getDisplayRange(): string {
    if (this.filteredRecords === 0) {
      return '0-0 of 0';
    }
    
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredRecords);
    return `${start}-${end} of ${this.filteredRecords}`;
  }

  // Utility methods for sorting dropdown
  onSortByName() {
    this.onSort('firstName');
  }

  onSortByDate() {
    this.onSort('createdAt');
  }

  onSortByUpdatedDate() {
    this.onSort('updatedAt');
  }

  onSortByRole() {
    this.onSort('roleId');
  }
}
