export interface PermissionModule {
  permissionId: string;
  permissionName: string;
  isReadable: boolean;
  isWritable: boolean;
  isDeletable: boolean;
}

export interface NewUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  roleType: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  roleId: string;
  username: string;
  password: string;
  permission: SelectedPermission[];
}

export interface SelectedPermission {
  permissionId: string;
  isReadable: boolean;
  isWritable: boolean;
  isDeletable: boolean;
}

export interface UserFormEvent {
  success: boolean;
  userData: UserData;
  message: string;
}
