import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    NgFor,
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule,
  ],
  template: `
    <mat-toolbar color="primary" class="toolbar">
      <button mat-icon-button (click)="sidenav.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="toolbar-title">{{ businessName }}</span>
      <span class="toolbar-spacer"></span>
      <button mat-icon-button (click)="logout()" matTooltip="Cerrar sesión">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>

    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
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

      <mat-sidenav-content class="sidenav-content">
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
    }
    .toolbar-title {
      margin-left: 1rem;
    }
    .toolbar-spacer {
      flex: 1;
    }
    .sidenav-container {
      height: calc(100vh - 64px);
      margin-top: 64px;
    }
    .sidenav {
      width: 250px;
      border-right: 1px solid #e5e7eb;
    }
    .sidenav-content {
      background: #f9fafb;
    }
    .content-wrapper {
      padding: 1.5rem;
      max-width: 1200px;
    }
    .active {
      background: #e8eaf6 !important;
      color: #3f51b5;
    }

    @media (max-width: 600px) {
      .sidenav { width: 200px; }
      .content-wrapper { padding: 1rem; }
      .sidenav-container { margin-top: 56px; height: calc(100vh - 56px); }
      .toolbar-title { font-size: 0.9rem; margin-left: 0.5rem; }
    }
  `],
})
export class AdminComponent {
  private auth: AuthService;
  private router: Router;

  businessName: string;

  constructor() {
    this.auth = inject(AuthService);
    this.router = inject(Router);
    this.businessName = this.auth.user()?.businessName || 'Panel Admin';
  }

  navItems: NavItem[] = [
    { path: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: 'agenda', icon: 'calendar_today', label: 'Agenda' },
    { path: 'servicios', icon: 'content_cut', label: 'Servicios' },
    { path: 'personal', icon: 'people', label: 'Personal' },
    { path: 'configuracion', icon: 'settings', label: 'Configuración' },
  ];

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/agendaclientes/login']);
  }
}
