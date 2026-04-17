import { Component, OnInit } from '@angular/core';
import { AccessLog, AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.css']
})
export class AuditLogsComponent implements OnInit {
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

    this.adminService.getAccessLogs(200).subscribe({
      next: (logs) => {
        this.logs = logs;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Impossible de charger les audits.';
        this.isLoading = false;
      }
    });
  }

}
