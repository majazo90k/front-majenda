import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { LogoutDialogComponent } from './components/logout-dialog.component';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    NgIf, NgFor,
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule, MatProgressSpinnerModule,
    LogoutDialogComponent,
  ],
  template: `
    <ng-container *ngIf="!loading(); else loadingScreen">
      <mat-toolbar color="primary" class="toolbar">
        <button mat-icon-button (click)="sidenav.toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="toolbar-title">{{ businessName }}</span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button (click)="confirmLogout()" matTooltip="Cerrar sesión">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container" (backdropClick)="sidenav.toggle()">
        <mat-sidenav #sidenav [mode]="isMobile() ? 'over' : 'side'" [opened]="!isMobile()" class="sidenav">
          <mat-nav-list>
            <a
              *ngFor="let item of navItems"
              mat-list-item
              [routerLink]="item.path"
              routerLinkActive
              #rla="routerLinkActive"
              [class.active]="rla.isActive"
            >
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </ng-container>

    <ng-template #loadingScreen>
      <div class="loading-screen">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Cerrando sesión...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .toolbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; }
    .toolbar-spacer { flex: 1; }
    .toolbar-title { font-size: 1rem; margin-left: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sidenav-container { margin-top: 64px; height: calc(100vh - 64px); }
    .sidenav { width: 220px; }
    .content { padding: 1.5rem; }
    .active { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
    .loading-screen {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 100vh; gap: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; font-size: 1.1rem;
    }
    @media (max-width: 768px) {
      .sidenav { width: 240px; }
      .content { padding: 1rem; }
      .sidenav-container { margin-top: 56px; height: calc(100vh - 56px); }
      .toolbar { min-height: 56px; }
    }
    @media (max-width: 600px) {
      .toolbar-title { font-size: 0.85rem; max-width: 140px; }
      .content { padding: 0.75rem; }
    }
  `],
})
export class AdminComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  loading = signal(false);
  businessName: string;
  isMobile = signal(window.innerWidth < 768);

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  navItems: NavItem[] = [
    { path: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: 'agenda', icon: 'calendar_today', label: 'Agenda' },
    { path: 'servicios', icon: 'content_cut', label: 'Servicios' },
    { path: 'personal', icon: 'people', label: 'Equipo' },
    { path: 'configuracion', icon: 'settings', label: 'Configuración' },
  ];

  constructor() {
    this.businessName = this.auth.user()?.businessName || 'Panel Admin';
  }

  confirmLogout(): void {
    const ref = this.dialog.open(LogoutDialogComponent);
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.loading.set(true);
      this.auth.logout();
      setTimeout(() => this.router.navigate(['/agendaclientes/login']), 600);
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/agendaclientes/login']);
  }
}
