// import { NgForOf, NgIf } from '@angular/common';
// import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { UserService, Role } from '../services/UserService';

// interface PermissionModule {
//   permissionId: string;
//   permissionName: string;
//   isReadable: boolean;
//   isWritable: boolean;
//   isDeletable: boolean;
// }

// @Component({
//   selector: 'app-add-user-modal',
//   imports: [FormsModule, NgIf, NgForOf],
//   templateUrl: './add-user-modal.component.html',
//   styleUrl: './add-user-modal.component.css',
//   providers: [UserService]
// })
// export class AddUserModalComponent implements OnInit, OnChanges {
//   @Input() show: boolean = false;
//   @Input() editMode: boolean = false;
//   @Input() userToEdit: any = null;
//   @Output() close = new EventEmitter<void>();
//   @Output() userAdded = new EventEmitter<any>();
//   @Output() userUpdated = new EventEmitter<any>();

//   newUser = {
//     userId: '',
//     firstName: '',
//     lastName: '',
//     email: '',
//     mobile: '',
//     roleType: '',
//     username: '',
//     password: '',
//     confirmPassword: ''
//   };

//   roles: Role[] = [];
//   permissions: PermissionModule[] = [];
//   loading: boolean = false;
//   error: string = '';

//   constructor(private userService: UserService) {}

//   ngOnInit() {
//     this.loadRoles();
//     this.loadPermissions();
//   }

//   ngOnChanges(changes: SimpleChanges) {
//     console.log('ngOnChanges called with:', changes);
    
//     if (changes['userToEdit'] || changes['editMode']) {
//       if (this.userToEdit && this.editMode && this.permissions.length > 0) {
//         console.log('Loading user for edit:', this.userToEdit);
//         this.loadUserForEdit();
//       }
//     }
    
//     if (changes['show'] && this.show && !this.editMode) {
//       this.resetForm();
//     }
//   }

//   loadUserForEdit() {
//     if (!this.userToEdit) {
//       console.log('No userToEdit provided');
//       return;
//     }

//     console.log('loadUserForEdit called with:', this.userToEdit);
    
//     this.loading = true;
//     this.error = '';
    
//     this.userService.getUserById(this.userToEdit.id).subscribe({
//       next: (response) => {
//         console.log('getUserById response:', response);
        
//         let userData = response;
//         if (response && response.data) {
//           userData = response.data;
//         }
        
//         this.populateFormWithUserData(userData);
//         this.loading = false;
//       },
//       error: (error) => {
//         console.error('Error loading user details:', error);
//         console.log('Falling back to basic user data');
        
//         this.populateFormWithBasicData();
//         this.loading = false;
//       }
//     });
//   }

//   private populateFormWithUserData(userData: any) {
//     console.log('populateFormWithUserData called with:', userData);
    
//     const user = userData.data || userData;
    
//     this.newUser = {
//       userId: user.id || '',
//       firstName: user.firstName || '',
//       lastName: user.lastName || '',
//       email: user.email || '',
//       mobile: user.phone || '',
//       roleType: user.roleId || (user.role ? user.role.roleId : ''),
//       username: user.username || '',
//       password: '',
//       confirmPassword: ''
//     };

//     console.log('Form populated with:', this.newUser);

//     if (user.permission && Array.isArray(user.permission)) {
//       console.log('Setting permissions:', user.permission);
      
//       this.permissions.forEach(perm => {
//         const userPerm = user.permission.find((p: any) => p.permissionId === perm.permissionId);
//         if (userPerm) {
//           perm.isReadable = userPerm.isReadable || false;
//           perm.isWritable = userPerm.isWritable || false;
//           perm.isDeletable = userPerm.isDeletable || false;
//         } else {
//           perm.isReadable = false;
//           perm.isWritable = false;
//           perm.isDeletable = false;
//         }
//       });
//     } else {
//       console.log('No permissions found in user data');
//     }
//   }

//   private populateFormWithBasicData() {
//     console.log('populateFormWithBasicData called with:', this.userToEdit);
    
//     this.newUser = {
//       userId: this.userToEdit.id || '',
//       firstName: this.userToEdit.name ? this.userToEdit.name.split(' ')[0] : '',
//       lastName: this.userToEdit.name ? this.userToEdit.name.split(' ').slice(1).join(' ') : '',
//       email: this.userToEdit.email || '',
//       mobile: '',
//       roleType: '',
//       username: this.userToEdit.email ? this.userToEdit.email.split('@')[0] : '',
//       password: '',
//       confirmPassword: ''
//     };

//     const role = this.roles.find(r => r.roleName === this.userToEdit.role);
//     if (role) {
//       this.newUser.roleType = role.roleId;
//     }
    
//     console.log('Form populated with basic data:', this.newUser);
    
//     this.permissions.forEach(perm => {
//       perm.isReadable = false;
//       perm.isWritable = false;
//       perm.isDeletable = false;
//     });
//   }

//   loadRoles() {
//     this.userService.getRoles().subscribe({
//       next: (response: any) => {
//         if (response && Array.isArray(response.data)) {
//           this.roles = response.data;
//         } else if (Array.isArray(response)) {
//           this.roles = response;
//         } else {
//           console.error('Invalid roles response format:', response);
//           this.roles = [];
//         }
//       },
//       error: (error) => {
//         console.error('Error loading roles:', error);
//         this.roles = [];
//       }
//     });
//   }

//   loadPermissions() {
//     this.userService.getPermissions().subscribe({
//       next: (response: any) => {
//         let permissionsData = [];
//         if (response && Array.isArray(response.data)) {
//           permissionsData = response.data;
//         } else if (Array.isArray(response)) {
//           permissionsData = response;
//         } else {
//           console.error('Invalid permissions response format:', response);
//           permissionsData = [];
//         }

//         this.permissions = permissionsData.map((perm: any) => ({
//           permissionId: perm.permissionId,
//           permissionName: perm.permissionName,
//           isReadable: false,
//           isWritable: false,
//           isDeletable: false
//         }));

//         console.log('Permissions loaded:', this.permissions);

//         if (this.editMode && this.userToEdit) {
//           console.log('Permissions loaded, now loading user for edit');
//           this.loadUserForEdit();
//         }
//       },
//       error: (error) => {
//         console.error('Error loading permissions:', error);
//         this.permissions = [];
//       }
//     });
//   }

//   onClose() {
//     this.resetForm();
//     this.close.emit();
//   }

//   onSubmit() {
//     if (this.isFormValid()) {
//       this.loading = true;
//       this.error = '';

//       const selectedPermissions = this.permissions
//         .filter(perm => perm.isReadable || perm.isWritable || perm.isDeletable)
//         .map(perm => ({
//           permissionId: perm.permissionId,
//           isReadable: perm.isReadable,
//           isWritable: perm.isWritable,
//           isDeletable: perm.isDeletable
//         }));

//       const userData = {
//         id: this.newUser.userId,
//         firstName: this.newUser.firstName,
//         lastName: this.newUser.lastName,
//         email: this.newUser.email,
//         phone: this.newUser.mobile || null,
//         roleId: this.newUser.roleType,
//         username: this.newUser.username,
//         password: this.newUser.password,
//         permission: selectedPermissions
//       };

//       console.log('Sending user data to API:', userData);

//       if (this.editMode) {
//         this.userService.updateUser(this.newUser.userId, userData).subscribe({
//           next: (response) => {
//             console.log('User updated successfully:', response);
            
//             this.userUpdated.emit({
//               success: true,
//               userData: userData,
//               message: 'User updated successfully!'
//             });
            
//             this.resetForm();
//             this.loading = false;
//           },
//           error: (error) => {
//             console.error('Error updating user:', error);
//             this.handleApiError(error);
//             this.loading = false;
//           }
//         });
//       } else {
//         this.userService.createUser(userData).subscribe({
//           next: (response) => {
//             console.log('User created successfully:', response);
            
//             this.userAdded.emit({
//               success: true,
//               userData: userData,
//               message: 'User created successfully!'
//             });
            
//             this.resetForm();
//             this.loading = false;
//           },
//           error: (error) => {
//             console.error('Error creating user:', error);
//             this.handleApiError(error);
//             this.loading = false;
//           }
//         });
//       }
//     }
//   }

//   private handleApiError(error: any) {
//     if (error.status === 400) {
//       this.error = 'Bad Request: Please check all required fields and try again.';
//     } else if (error.status === 409) {
//       this.error = 'User ID or email already exists. Please use different values.';
//     } else if (error.status === 404) {
//       this.error = 'User not found. Please refresh and try again.';
//     } else {
//       this.error = `Failed to ${this.editMode ? 'update' : 'create'} user. Please try again.`;
//     }
//   }

//   isFormValid(): boolean {
//     const passwordsMatch = this.newUser.password === this.newUser.confirmPassword;
//     const requiredFieldsFilled = !!(
//       this.newUser.userId &&
//       this.newUser.firstName &&
//       this.newUser.lastName &&
//       this.newUser.email &&
//       this.newUser.roleType &&
//       this.newUser.username &&
//       this.newUser.password &&
//       this.newUser.confirmPassword
//     );

//     const hasPermissions = this.permissions.some(perm => 
//       perm.isReadable || perm.isWritable || perm.isDeletable
//     );

//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const validEmail = emailPattern.test(this.newUser.email);

//     const validUserId = this.newUser.userId.startsWith('USR');

//     return requiredFieldsFilled && passwordsMatch && hasPermissions && validEmail && validUserId;
//   }

//   resetForm() {
//     this.newUser = {
//       userId: '',
//       firstName: '',
//       lastName: '',
//       email: '',
//       mobile: '',
//       roleType: '',
//       username: '',
//       password: '',
//       confirmPassword: ''
//     };

//     this.permissions.forEach(perm => {
//       perm.isReadable = false;
//       perm.isWritable = false;
//       perm.isDeletable = false;
//     });

//     this.error = '';
//   }

//   onBackdropClick(event: Event) {
//     if (event.target === event.currentTarget) {
//       this.onClose();
//     }
//   }

//   togglePermission(index: number, type: 'isReadable' | 'isWritable' | 'isDeletable') {
//     this.permissions[index][type] = !this.permissions[index][type];
//   }

//   getRoleDisplayName(roleId: string): string {
//     const role = this.roles.find(r => r.roleId === roleId);
//     return role ? role.roleName : roleId;
//   }

//   getPasswordValidationMessage(): string {
//     if (this.newUser.password && this.newUser.confirmPassword) {
//       if (this.newUser.password !== this.newUser.confirmPassword) {
//         return 'Passwords do not match';
//       }
//     }
//     return '';
//   }

//   getValidationMessages(): string[] {
//     const messages: string[] = [];
    
//     if (this.newUser.userId && !this.newUser.userId.startsWith('USR')) {
//       messages.push('User ID must start with "USR"');
//     }
    
//     if (this.newUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.email)) {
//       messages.push('Please enter a valid email address');
//     }
    
//     if (this.permissions.length > 0 && !this.permissions.some(perm => 
//       perm.isReadable || perm.isWritable || perm.isDeletable)) {
//       messages.push('Please select at least one permission');
//     }
    
//     return messages;
//   }

//   getModalTitle(): string {
//     return this.editMode ? 'Edit User' : 'Add User';
//   }

//   getSubmitButtonText(): string {
//     if (this.loading) {
//       return this.editMode ? 'Updating...' : 'Creating...';
//     }
//     return this.editMode ? 'Update User' : 'Add User';
//   }
// }
import { NgForOf, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService, Role } from '../services/UserService';
import { UserFormService } from '../services/user-form.service';
import { UserValidationService } from '../services/user-validation.service';
import { NewUser, PermissionModule, UserFormEvent } from '../services/types/user.types';

@Component({
  selector: 'app-add-user-modal',
  imports: [FormsModule, NgIf, NgForOf],
  templateUrl: './add-user-modal.component.html',
  styleUrl: './add-user-modal.component.css',
  providers: [UserService]
})
export class AddUserModalComponent implements OnInit, OnChanges {
  @Input() show: boolean = false;
  @Input() editMode: boolean = false;
  @Input() userToEdit: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() userAdded = new EventEmitter<UserFormEvent>();
  @Output() userUpdated = new EventEmitter<UserFormEvent>();

  newUser: NewUser = {
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

  constructor(
    private userService: UserService,
    private userFormService: UserFormService,
    private validationService: UserValidationService
  ) {}

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['userToEdit'] || changes['editMode']) {
      if (this.userToEdit && this.editMode && this.permissions.length > 0) {
        this.loadUserForEdit();
      }
    }
    
    if (changes['show'] && this.show && !this.editMode) {
      this.resetForm();
    }
  }

  loadUserForEdit() {
    if (!this.userToEdit) return;
    
    this.loading = true;
    this.error = '';
    
    this.userService.getUserById(this.userToEdit.id).subscribe({
      next: (response) => {
        this.newUser = this.userFormService.populateUserForm(response, this.permissions);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user details:', error);
        this.newUser = this.userFormService.populateBasicUserForm(this.userToEdit, this.roles);
        this.userFormService.resetPermissions(this.permissions);
        this.loading = false;
      }
    });
  }

  loadRoles() {
    this.userService.getRoles().subscribe({
      next: (response: any) => {
        this.roles = this.extractDataArray(response);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.roles = [];
      }
    });
  }

  loadPermissions() {
    this.userService.getPermissions().subscribe({
      next: (response: any) => {
        const permissionsData = this.extractDataArray(response);
        this.permissions = permissionsData.map((perm: any) => ({
          permissionId: perm.permissionId,
          permissionName: perm.permissionName,
          isReadable: false,
          isWritable: false,
          isDeletable: false
        }));

        if (this.editMode && this.userToEdit) {
          this.loadUserForEdit();
        }
      },
      error: (error) => {
        console.error('Error loading permissions:', error);
        this.permissions = [];
      }
    });
  }

  private extractDataArray(response: any): any[] {
    if (response && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }
    console.error('Invalid response format:', response);
    return [];
  }

  onSubmit() {
    if (!this.isFormValid()) return;
    
    this.loading = true;
    this.error = '';

    const userData = this.userFormService.createUserData(this.newUser, this.permissions);
    const apiCall = this.editMode 
      ? this.userService.updateUser(this.newUser.userId, userData)
      : this.userService.createUser(userData);

    apiCall.subscribe({
      next: (response) => {
        const event: UserFormEvent = {
          success: true,
          userData: userData,
          message: `User ${this.editMode ? 'updated' : 'created'} successfully!`
        };
        
        this.editMode ? this.userUpdated.emit(event) : this.userAdded.emit(event);
        this.resetForm();
        this.loading = false;
      },
      error: (error) => {
        console.error(`Error ${this.editMode ? 'updating' : 'creating'} user:`, error);
        this.error = this.validationService.getApiErrorMessage(error, this.editMode);
        this.loading = false;
      }
    });
  }

  onClose() {
    this.resetForm();
    this.close.emit();
  }

  resetForm() {
    this.newUser = this.userFormService.createInitialUser();
    this.userFormService.resetPermissions(this.permissions);
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

  // UI Helper Methods
  isFormValid(): boolean {
    return this.validationService.isFormValid(this.newUser, this.permissions);
  }

  getRoleDisplayName(roleId: string): string {
    const role = this.roles.find(r => r.roleId === roleId);
    return role ? role.roleName : roleId;
  }

  getPasswordValidationMessage(): string {
    return this.validationService.getPasswordValidationMessage(this.newUser);
  }

  getValidationMessages(): string[] {
    return this.validationService.getValidationMessages(this.newUser, this.permissions);
  }

  getModalTitle(): string {
    return this.editMode ? 'Edit User' : 'Add User';
  }

  getSubmitButtonText(): string {
    if (this.loading) {
      return this.editMode ? 'Updating...' : 'Creating...';
    }
    return this.editMode ? 'Update User' : 'Add User';
  }
}
