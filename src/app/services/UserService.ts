
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: {
    roleId: string;
    roleName: string;
  };
  username: string;
  password?: string;
  createdAt: string; 
  updatedAt: string;
  permission: Permission[];
}

export interface Permission {
  permissionId: string;
  permissionName?: string;
  isReadable: boolean;
  isWritable: boolean;
  isDeletable: boolean;
}

export interface Role {
  roleId: string;
  roleName: string;
}

export interface DataTableRequest {
  orderBy: string;
  orderDirection: 'asc' | 'desc';
  pageNumber: string;
  pageSize: string;
  search: string;
}

export interface DataTableResponse {
  status: {
    code: string;
    description: string;
  };
  data: {
    users: User[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface RolesResponse {
  status: {
    code: number;
    description: string;
  };
  data: Role[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.status === 0) {
      // Client-side or network error
      errorMessage = 'Cannot connect to the server. Please check if the API server is running.';
    } else if (error.status === 404) {
      errorMessage = 'API endpoint not found.';
    } else if (error.status === 500) {
      errorMessage = 'Internal server error.';
    } else {
      errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
    }
    
    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Get users with pagination, search, and sorting
  getUsersDataTable(request: DataTableRequest): Observable<any> {
    console.log('Sending request:', request);
    return this.http.post<any>(`${this.apiUrl}/users/DataTable`, request, this.getHttpOptions())
      .pipe(
        tap(response => {
          console.log('Raw API Response:', response);
          console.log('Response type:', typeof response);
          console.log('Is array:', Array.isArray(response));
          if (response && typeof response === 'object') {
            console.log('Response keys:', Object.keys(response));
          }
        }),
        retry(2),
        catchError(this.handleError)
      );
  }

  // Get user by ID - updated with better logging
  getUserById(id: string): Observable<any> {
    console.log('Getting user by ID:', id);
    return this.http.get<any>(`${this.apiUrl}/users/${id}`)
      .pipe(
        tap(response => {
          console.log('getUserById raw response:', response);
        }),
        retry(2),
        catchError((error) => {
          console.error('getUserById error:', error);
          return this.handleError(error);
        })
      );
  }

  // Create new user - updated to handle new format with better logging
  createUser(user: any): Observable<any> {
    console.log('Creating user with data:', user);
    return this.http.post<any>(`${this.apiUrl}/users`, user, this.getHttpOptions())
      .pipe(
        tap(response => {
          console.log('Create user response:', response);
        }),
        catchError((error) => {
          console.error('Create user error details:', error);
          if (error.error) {
            console.error('Error response body:', error.error);
          }
          return this.handleError(error);
        })
      );
  }

  // Update user - updated to handle new format
  updateUser(id: string, user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${id}`, user, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  // Delete user
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get all roles
  getRoles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/roles`)
      .pipe(
        tap(response => {
          console.log('Roles API Response:', response);
          console.log('Roles response type:', typeof response);
          console.log('Roles is array:', Array.isArray(response));
        }),
        retry(2),
        catchError(this.handleError)
      );
  }

  // Get all permissions
  getPermissions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/permissions`)
      .pipe(
        tap(response => {
          console.log('Permissions API Response:', response);
          console.log('Permissions response type:', typeof response);
          console.log('Permissions is array:', Array.isArray(response));
        }),
        retry(2),
        catchError(this.handleError)
      );
  }

  // Utility method to format date for display
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  // Utility method to format datetime for display
  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return '';
    }
  }
}
