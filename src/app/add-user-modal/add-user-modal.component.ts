import { NgForOf, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService, Role } from '../services/UserService';

interface PermissionModule {
  permissionId: string;
  permissionName: string;
  isReadable: boolean;
  isWritable: boolean;
  isDeletable: boolean;
}

@Component({
  selector: 'app-add-user-modal',
  imports: [FormsModule, NgIf, NgForOf],
  templateUrl: './add-user-modal.component.html',
  styleUrl: './add-user-modal.component.css',
  providers: [UserService]
})
export class AddUserModalComponent implements OnInit {
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() userAdded = new EventEmitter<any>();

  newUser = {
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    roleType: '',
    username: '',
    password: '',
    confirmPassword: ''
  };

  roles: Role[] = [];
  permissions: PermissionModule[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles() {
    this.userService.getRoles().subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response.data)) {
          this.roles = response.data;
        } else if (Array.isArray(response)) {
          this.roles = response;
        } else {
          console.error('Invalid roles response format:', response);
          this.roles = this.getFallbackRoles();
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.roles = this.getFallbackRoles();
      }
    });
  }

  loadPermissions() {
    this.userService.getPermissions().subscribe({
      next: (response: any) => {
        let permissionsData = [];
        if (response && Array.isArray(response.data)) {
          permissionsData = response.data;
        } else if (Array.isArray(response)) {
          permissionsData = response;
        } else {
          console.error('Invalid permissions response format:', response);
          permissionsData = this.getFallbackPermissions();
        }

        // Convert to PermissionModule format with default values
        this.permissions = permissionsData.map((perm: any) => ({
          permissionId: perm.permissionId,
          permissionName: perm.permissionName,
          isReadable: false,
          isWritable: false,
          isDeletable: false
        }));
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.permissions = this.getFallbackPermissions().map(perm => ({
          permissionId: perm.permissionId,
          permissionName: perm.permissionName,
          isReadable: false,
          isWritable: false,
          isDeletable: false
        }));
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

  private getFallbackPermissions() {
    return [
      { permissionId: 'PERM001', permissionName: 'User Management' },
      { permissionId: 'PERM002', permissionName: 'Report Analytics' },
      { permissionId: 'PERM003', permissionName: 'System Configuration' },
      { permissionId: 'PERM004', permissionName: 'Financial Operations' },
      { permissionId: 'PERM005', permissionName: 'Inventory Control' },
      { permissionId: 'PERM006', permissionName: 'Customer Relations' },
      { permissionId: 'PERM007', permissionName: 'Product Catalog' }
    ];
  }

  onClose() {
    this.resetForm();
    this.close.emit();
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.loading = true;
      this.error = '';

      // Get selected permissions
      const selectedPermissions = this.permissions
        .filter(perm => perm.isReadable || perm.isWritable || perm.isDeletable)
        .map(perm => ({
          permissionId: perm.permissionId,
          isReadable: perm.isReadable,
          isWritable: perm.isWritable,
          isDeletable: perm.isDeletable
        }));

      // Create user data in exact API format (based on the API examples)
      const userData = {
        id: this.newUser.userId,
        firstName: this.newUser.firstName,
        lastName: this.newUser.lastName,
        email: this.newUser.email,
        phone: this.newUser.mobile || null, // API expects null if no phone
        roleId: this.newUser.roleType, // API expects roleId not role object
        username: this.newUser.username,
        password: this.newUser.password,
        permission: selectedPermissions // API expects array of permissions
      };

      console.log('Sending user data to API:', userData); // Debug log

      // Call API to create user
      this.userService.createUser(userData).subscribe({
        next: (response) => {
          console.log('User created successfully:', response);
          
          // Emit success event with user data
          this.userAdded.emit({
            success: true,
            userData: userData,
            message: 'User created successfully!'
          });
          
          this.resetForm();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating user:', error);
          // More detailed error message
          if (error.status === 400) {
            this.error = 'Bad Request: Please check all required fields and try again.';
          } else if (error.status === 409) {
            this.error = 'User ID or email already exists. Please use different values.';
          } else {
            this.error = 'Failed to create user. Please try again.';
          }
          this.loading = false;
        }
      });
    }
  }

  isFormValid(): boolean {
    const passwordsMatch = this.newUser.password === this.newUser.confirmPassword;
    const requiredFieldsFilled = !!(
      this.newUser.userId &&
      this.newUser.firstName &&
      this.newUser.lastName &&
      this.newUser.email &&
      this.newUser.roleType &&
      this.newUser.username &&
      this.newUser.password &&
      this.newUser.confirmPassword
    );

    // Check if at least one permission is selected
    const hasPermissions = this.permissions.some(perm => 
      perm.isReadable || perm.isWritable || perm.isDeletable
    );

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmail = emailPattern.test(this.newUser.email);

    // Validate User ID format (should start with USR)
    const validUserId = this.newUser.userId.startsWith('USR');

    return requiredFieldsFilled && passwordsMatch && hasPermissions && validEmail && validUserId;
  }

  resetForm() {
    this.newUser = {
      userId: '',
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      roleType: '',
      username: '',
      password: '',
      confirmPassword: ''
    };

    // Reset permissions
    this.permissions.forEach(perm => {
      perm.isReadable = false;
      perm.isWritable = false;
      perm.isDeletable = false;
    });

    this.error = '';
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  togglePermission(index: number, type: 'isReadable' | 'isWritable' | 'isDeletable') {
    this.permissions[index][type] = !this.permissions[index][type];
  }

  getRoleDisplayName(roleId: string): string {
    const role = this.roles.find(r => r.roleId === roleId);
    return role ? role.roleName : roleId;
  }

  getPasswordValidationMessage(): string {
    if (this.newUser.password && this.newUser.confirmPassword) {
      if (this.newUser.password !== this.newUser.confirmPassword) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  getValidationMessages(): string[] {
    const messages: string[] = [];
    
    if (this.newUser.userId && !this.newUser.userId.startsWith('USR')) {
      messages.push('User ID must start with "USR"');
    }
    
    if (this.newUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.email)) {
      messages.push('Please enter a valid email address');
    }
    
    if (this.permissions.length > 0 && !this.permissions.some(perm => 
      perm.isReadable || perm.isWritable || perm.isDeletable)) {
      messages.push('Please select at least one permission');
    }
    
    return messages;
  }
}
