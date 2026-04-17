import { Component, OnInit } from '@angular/core';
import { AccessLog, AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html'
})
export class LogsComponent implements OnInit {
  logs: AccessLog[] = [];
  isLoading = false;
  errorMsg = '';

  constructor(private readonly adminService: AdminService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.adminService.getAccessLogs(100).subscribe({
      next: (logs) => {
        this.logs = logs;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Impossible de charger les logs.';
        this.isLoading = false;
      }
    });
  }
}