import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, User } from '../../core/services/admin.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = false;
  errorMsg = '';

  // Search and filters
  searchQuery = '';
  selectedRole = '';
  roles = ['admin', 'medecin', 'patient', 'infirmier', 'laboratoire'];

  // Pagination
  pageIndex = 0;
  pageSize = 10;
  totalUsers = 0;

  constructor(
    private readonly adminService: AdminService,
    private readonly router: Router,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Impossible de charger les utilisateurs.';
        this.notificationService.error(this.errorMsg);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.nom?.toLowerCase().includes(query) ||
        u.prenom?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (this.selectedRole) {
      filtered = filtered.filter(u => u.role === this.selectedRole);
    }

    this.totalUsers = filtered.length;

    // Apply pagination
    const start = this.pageIndex * this.pageSize;
    this.filteredUsers = filtered.slice(start, start + this.pageSize);
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  onRoleFilter(): void {
    this.pageIndex = 0;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedRole = '';
    this.pageIndex = 0;
    this.applyFilters();
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.applyFilters();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageIndex = 0;
    this.applyFilters();
  }

  openCreate(): void {
    this.router.navigate(['/admin/add-user']);
  }

  editUser(id?: string): void {
    if (!id) return;
    this.router.navigate(['/admin/edit-user', id]);
  }

  archiveUser(id?: string): void {
    if (!id) return;

    if (!confirm('Êtes-vous sûr de vouloir archiver cet utilisateur ?')) return;

    this.adminService.archiveUser(id).subscribe({
      next: () => {
        this.notificationService.success('Utilisateur archivé avec succès');
        this.loadUsers();
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Archivage impossible.';
        this.notificationService.error(this.errorMsg);
      }
    });
  }

  deleteUser(id?: string): void {
    if (!id) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) return;

    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.notificationService.success('Utilisateur supprimé avec succès');
        this.loadUsers();
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Suppression impossible.';
        this.notificationService.error(this.errorMsg);
      }
    });
  }

  roleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      admin: 'badge-warning',
      medecin: 'badge-primary',
      patient: 'badge-success',
      infirmier: 'badge-info',
      laboratoire: 'badge-violet'
    };
    return classes[role] || 'badge-info';
  }

  retry(): void {
    this.loadUsers();
  }
}
