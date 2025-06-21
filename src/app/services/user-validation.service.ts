import { Injectable } from '@angular/core';
import { NewUser, PermissionModule } from '../services/types/user.types';

@Injectable({
  providedIn: 'root'
})
export class UserValidationService {

  isFormValid(user: NewUser, permissions: PermissionModule[]): boolean {
    return this.arePasswordsMatching(user) &&
           this.areRequiredFieldsFilled(user) &&
           this.hasPermissions(permissions) &&
           this.isValidEmail(user.email) &&
           this.isValidUserId(user.userId);
  }

  arePasswordsMatching(user: NewUser): boolean {
    return user.password === user.confirmPassword;
  }

  areRequiredFieldsFilled(user: NewUser): boolean {
    return !!(
      user.userId &&
      user.firstName &&
      user.lastName &&
      user.email &&
      user.roleType &&
      user.username &&
      user.password &&
      user.confirmPassword
    );
  }

  hasPermissions(permissions: PermissionModule[]): boolean {
    return permissions.some(perm => 
      perm.isReadable || perm.isWritable || perm.isDeletable
    );
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  isValidUserId(userId: string): boolean {
    return userId.startsWith('USR');
  }

  getPasswordValidationMessage(user: NewUser): string {
    if (user.password && user.confirmPassword) {
      if (!this.arePasswordsMatching(user)) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  getValidationMessages(user: NewUser, permissions: PermissionModule[]): string[] {
    const messages: string[] = [];
    
    if (user.userId && !this.isValidUserId(user.userId)) {
      messages.push('User ID must start with "USR"');
    }
    
    if (user.email && !this.isValidEmail(user.email)) {
      messages.push('Please enter a valid email address');
    }
    
    if (permissions.length > 0 && !this.hasPermissions(permissions)) {
      messages.push('Please select at least one permission');
    }
    
    return messages;
  }

  getApiErrorMessage(error: any, editMode: boolean): string {
    switch (error.status) {
      case 400:
        return 'Bad Request: Please check all required fields and try again.';
      case 409:
        return 'User ID or email already exists. Please use different values.';
      case 404:
        return 'User not found. Please refresh and try again.';
      default:
        return `Failed to ${editMode ? 'update' : 'create'} user. Please try again.`;
    }
  }
}
