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
  selectedSort: string = 'firstName';
  selectedSortDirection: 'asc' | 'desc' = 'asc';
  selectedSavedSearch: string = '';
  itemsPerPage: number = 6;
  currentPage: number = 1;
  showAddUserModal: boolean = false;
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
        console.log('Roles Response:', roles); // Debug log
        
        // Handle specific API format: { status: {...}, data: [...] }
        if (roles && Array.isArray(roles.data)) {
          this.roles = roles.data;
        } else if (Array.isArray(roles)) {
          // If response is directly an array (fallback)
          this.roles = roles;
        } else if (roles && typeof roles === 'object') {
          // Try to find array in response (generic fallback)
          const possibleArrayKeys = ['data', 'roles', 'items', 'result'];
          for (const key of possibleArrayKeys) {
            if (Array.isArray(roles[key])) {
              this.roles = roles[key];
              break;
            }
          }
        }
        
        // If still no valid roles array, use fallback
        if (!Array.isArray(this.roles) || this.roles.length === 0) {
          console.warn('No valid roles found in response, using fallback');
          this.roles = this.getFallbackRoles();
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        // Use fallback roles if API is not available
        this.roles = this.getFallbackRoles();
        if (error.status === 0) {
          this.error = 'Cannot connect to API server. Please check if the server is running at http://localhost:5163';
        } else {
          this.error = 'Failed to load roles';
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
        console.log('API Response:', response); // Debug log
        
        // Handle API response format: { status: {...}, data: { users: [...], totalCount: ..., ... } }
        let userData: User[] = [];
        let totalRecords = 0;
        let filteredRecords = 0;

        if (response && response.data && Array.isArray(response.data.users)) {
          // Handle the specific API format we received
          userData = response.data.users;
          totalRecords = response.data.totalCount || 0;
          filteredRecords = response.data.totalCount || 0; // Assuming filtered count equals total for now
        } else if (Array.isArray(response)) {
          // If response is directly an array (fallback)
          userData = response;
          totalRecords = response.length;
          filteredRecords = response.length;
        } else if (response && Array.isArray(response.data)) {
          // If response has data property with array (another format)
          userData = response.data;
          totalRecords = response.totalRecords || response.recordsTotal || response.data.length;
          filteredRecords = response.filteredRecords || response.recordsFiltered || response.data.length;
        } else if (response && typeof response === 'object') {
          // If response is an object, try to find array property (generic fallback)
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
        
        if (error.status === 0) {
          this.error = 'Cannot connect to API server. Please check if the server is running at http://localhost:5163';
          // Use fallback data when API is not available
          this.loadFallbackUsers();
        } else {
          this.error = 'Failed to load users from server';
        }
      }
    });
  }

  private getFallbackRoles(): Role[] {
    return [
      { roleId: 'ROLE001', roleName: 'System Administrator' },
      { roleId: 'ROLE002', roleName: 'Operations Manager' },
      { roleId: 'ROLE003', roleName: 'Sales Executive' },
      { roleId: 'ROLE004', roleName: 'Financial Analyst' },
      { roleId: 'ROLE005', roleName: 'Warehouse Supervisor' },
      { roleId: 'ROLE006', roleName: 'Customer Service Representative' }
    ];
  }

  private loadFallbackUsers() {
    // Fallback data when API is not available - updated to match new format
    const fallbackUsers: User[] = [
      {
        id: 'USR001',
        firstName: 'Alexander',
        lastName: 'Anderson',
        email: 'alex.anderson@techcorp.com',
        phone: '02-555-0101',
        role: {
          roleId: 'ROLE001',
          roleName: 'System Administrator'
        },
        username: 'alex.anderson',
        permission: []
      },
      {
        id: 'USR002',
        firstName: 'Sophia',
        lastName: 'Chen',
        email: 'sophia.chen@techcorp.com',
        phone: '02-555-0102',
        role: {
          roleId: 'ROLE002',
          roleName: 'Operations Manager'
        },
        username: 'sophia.chen',
        permission: []
      },
      {
        id: 'USR003',
        firstName: 'Marcus',
        lastName: 'Rodriguez',
        email: 'marcus.rodriguez@techcorp.com',
        phone: '02-555-0103',
        role: {
          roleId: 'ROLE003',
          roleName: 'Sales Executive'
        },
        username: 'marcus.rodriguez',
        permission: []
      }
    ];

    this.users = this.mapUsersToDisplayFormat(fallbackUsers);
    this.filteredRecords = this.users.length;
    this.totalRecords = this.users.length;
    this.calculatePagination();
  }

  private mapUsersToDisplayFormat(apiUsers: User[]): DisplayUser[] {
    // Ensure apiUsers is an array and not null/undefined
    if (!Array.isArray(apiUsers)) {
      console.error('mapUsersToDisplayFormat: apiUsers is not an array:', apiUsers);
      return [];
    }

    return apiUsers.map(user => {
      // Handle the new API format where role is an object
      const roleName = user.role ? user.role.roleName : 'Unknown Role';
      
      return {
        id: user.id || '',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        email: user.email || '',
        role: roleName,
        roleColor: this.getRoleColor(roleName),
        createDate: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }), // API doesn't provide create date, using current date as fallback
        description: 'User Description' // API doesn't provide description, using placeholder
      };
    });
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredRecords / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
      this.loadUsers(); // Reload with corrected page
    }
  }

  getPaginatedUsers(): DisplayUser[] {
    // Since API handles pagination, return all loaded users
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
    this.showAddUserModal = true;
  }

  closeAddUserModal() {
    this.showAddUserModal = false;
  }

  onUserAdded(eventData: any) {
    if (eventData.success) {
      // Show success message
      this.error = ''; // Clear any existing errors
      
      // Show temporary success message
      const successMessage = eventData.message || 'User created successfully!';
      console.log(successMessage);
      
      // You can also show a toast notification here if you have a toast service
      this.showSuccessMessage(successMessage);
      
      // Refresh the users list to show the new user
      this.loadUsers();
      
      // Close the modal
      this.closeAddUserModal();
    }
  }

  private showSuccessMessage(message: string) {
    // Temporarily show success message in the error area (green styling can be added via CSS)
    const originalError = this.error;
    this.error = `SUCCESS: ${message}`;
    
    // Clear the success message after 3 seconds
    setTimeout(() => {
      if (this.error.startsWith('SUCCESS:')) {
        this.error = originalError;
      }
    }, 3000);
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'System Administrator':
      case 'Operations Manager':
      case 'Super Admin':
      case 'Admin':
      case 'HR Admin':
        return 'primary';
      case 'Sales Executive':
      case 'Financial Analyst':
      case 'Warehouse Supervisor':
      case 'Customer Service Representative':
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
          this.loadUsers(); // Reload the users list
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
    this.onSort('createDate');
  }

  onSortByRole() {
    this.onSort('roleId');
  }
}
