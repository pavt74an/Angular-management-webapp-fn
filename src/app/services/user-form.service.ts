import { Injectable } from '@angular/core';
import { NewUser, PermissionModule, UserData, SelectedPermission } from '../services/types/user.types';

@Injectable({
  providedIn: 'root'
})
export class UserFormService {
  
  createInitialUser(): NewUser {
    return {
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
  }

  populateUserForm(userData: any, permissions: PermissionModule[]): NewUser {
    const user = userData.data || userData;
    
    const formData: NewUser = {
      userId: user.id || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      mobile: user.phone || '',
      roleType: user.roleId || (user.role ? user.role.roleId : ''),
      username: user.username || '',
      password: '',
      confirmPassword: ''
    };

    this.updatePermissions(user.permission, permissions);
    return formData;
  }

  populateBasicUserForm(userToEdit: any, roles: any[]): NewUser {
    const formData: NewUser = {
      userId: userToEdit.id || '',
      firstName: userToEdit.name ? userToEdit.name.split(' ')[0] : '',
      lastName: userToEdit.name ? userToEdit.name.split(' ').slice(1).join(' ') : '',
      email: userToEdit.email || '',
      mobile: '',
      roleType: '',
      username: userToEdit.email ? userToEdit.email.split('@')[0] : '',
      password: '',
      confirmPassword: ''
    };

    const role = roles.find(r => r.roleName === userToEdit.role);
    if (role) {
      formData.roleType = role.roleId;
    }

    return formData;
  }

  private updatePermissions(userPermissions: any[], permissions: PermissionModule[]): void {
    if (userPermissions && Array.isArray(userPermissions)) {
      permissions.forEach(perm => {
        const userPerm = userPermissions.find((p: any) => p.permissionId === perm.permissionId);
        if (userPerm) {
          perm.isReadable = userPerm.isReadable || false;
          perm.isWritable = userPerm.isWritable || false;
          perm.isDeletable = userPerm.isDeletable || false;
        } else {
          this.resetPermission(perm);
        }
      });
    }
  }

  resetPermissions(permissions: PermissionModule[]): void {
    permissions.forEach(perm => this.resetPermission(perm));
  }

  private resetPermission(permission: PermissionModule): void {
    permission.isReadable = false;
    permission.isWritable = false;
    permission.isDeletable = false;
  }

  createUserData(user: NewUser, permissions: PermissionModule[]): UserData {
    const selectedPermissions: SelectedPermission[] = permissions
      .filter(perm => perm.isReadable || perm.isWritable || perm.isDeletable)
      .map(perm => ({
        permissionId: perm.permissionId,
        isReadable: perm.isReadable,
        isWritable: perm.isWritable,
        isDeletable: perm.isDeletable
      }));

    return {
      id: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.mobile || null,
      roleId: user.roleType,
      username: user.username,
      password: user.password,
      permission: selectedPermissions
    };
  }
}
