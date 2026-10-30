import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from './services/storage.service';
import { ToastService } from './services/toast.service';
import { NavbarComponent } from './components/navbar/navbar';
import { DashboardComponent } from './components/dashboard/dashboard';
import { WorkTrackerComponent } from './components/work-tracker/work-tracker';
import { ReadingSchedulerComponent } from './components/reading-scheduler/reading-scheduler';
import { BirthdayCircleComponent } from './components/birthday-circle/birthday-circle';
import { CareerGoalsComponent } from './components/career-goals/career-goals';
import { DocGeneratorModalComponent } from './components/doc-generator-modal/doc-generator-modal';
import { DataBackupModalComponent } from './components/data-backup-modal/data-backup-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    DashboardComponent,
    WorkTrackerComponent,
    ReadingSchedulerComponent,
    BirthdayCircleComponent,
    CareerGoalsComponent,
    DocGeneratorModalComponent,
    DataBackupModalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  public readonly storage = inject(StorageService);
  public readonly toast = inject(ToastService);

  @ViewChild(WorkTrackerComponent)
  public workTrackerRef?: WorkTrackerComponent;

  // Global Modal Controllers
  public readonly showDocGeneratorModal = signal(false);
  public readonly showBackupModal = signal(false);

  public handleOpenAddWork(): void {
    this.storage.setActiveTab('work-log');
    setTimeout(() => {
      this.workTrackerRef?.openCreateModal();
    }, 50);
  }
}
