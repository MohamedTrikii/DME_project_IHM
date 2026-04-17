import { Component, OnInit } from '@angular/core';
import { AdminService, User } from '../../core/services/admin.service';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.css']
})
export class ArchiveComponent implements OnInit {
  archivedUsers: User[] = [];
  isLoading = false;
  errorMsg = '';

  constructor(private readonly adminService: AdminService) {}

  ngOnInit(): void {
    this.loadArchivedUsers();
  }

  loadArchivedUsers(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.adminService.getArchivedData().subscribe({
      next: (users) => {
        this.archivedUsers = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Impossible de charger les archives.';
        this.isLoading = false;
      }
    });
  }

}
