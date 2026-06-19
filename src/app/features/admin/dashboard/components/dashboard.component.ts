import { Component, inject, OnInit, signal, computed, ElementRef, viewChild, afterNextRender } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { ServiceService } from '../../../../core/services/service.service';
import { Appointment, ServiceModel } from '../../../../core/models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner.component';

Chart.register(...registerables);

interface PeriodStats {
  total: number;
  completed: number;
  revenue: number;
  serviceCounts: Record<string, number>;
  serviceRevenue: Record<string, number>;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, LoadingSpinnerComponent],
  template: `
    <div class="p-4 md:p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-500 text-sm mt-1">Resumen de actividad de tu negocio</p>
        </div>
        <div class="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
          <button *ngFor="let p of periods" (click)="selectPeriod(p.value)"
            class="px-3 py-1.5 text-sm font-medium rounded-lg transition-all"
            [class.bg-indigo-600]="selectedPeriod() === p.value"
            [class.text-white]="selectedPeriod() === p.value"
            [class.text-gray-600]="selectedPeriod() !== p.value"
            [class.hover:bg-gray-100]="selectedPeriod() !== p.value">
            {{ p.label }}
          </button>
        </div>
      </div>

      <app-loading-spinner *ngIf="loading()" [loading]="true" text="Cargando dashboard..." />

      <ng-container *ngIf="!loading()">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center"><span class="text-xl">💰</span></div>
              <span class="text-xs font-medium text-gray-400">Ingresos</span>
            </div>
            <div class="text-2xl font-bold text-gray-900">\${{ stats().revenue | number:'1.0-0' }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ stats().completed }} servicios completados</div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><span class="text-xl">✅</span></div>
              <span class="text-xs font-medium text-gray-400">Completadas</span>
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ stats().completed }}</div>
            <div class="text-xs text-gray-400 mt-1">de {{ stats().total }} citas totales</div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><span class="text-xl">⏳</span></div>
              <span class="text-xs font-medium text-gray-400">Pendientes</span>
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ pendingCount() }}</div>
            <div class="text-xs text-gray-400 mt-1">por confirmar</div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center"><span class="text-xl">📈</span></div>
              <span class="text-xs font-medium text-gray-400">Valor promedio</span>
            </div>
            <div class="text-2xl font-bold text-gray-900">\${{ avgTicket() | number:'1.0-0':'es-CL' }}</div>
            <div class="text-xs text-gray-400 mt-1">\$ por cita</div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-500 mb-4">Ingresos mensuales</h3>
            <div class="relative h-64"><canvas #revenueChart></canvas></div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-500 mb-4">Servicios realizados</h3>
            <div class="relative h-64"><canvas #servicesChart></canvas></div>
            <div class="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-gray-100">
              <div *ngFor="let item of serviceLegend()" class="flex items-center gap-1.5 text-sm">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" [style.background]="item.color"></span>
                <span class="text-gray-600">{{ item.label }}</span>
                <span class="font-semibold text-gray-900">{{ item.count }}</span>
                <span class="text-gray-400 text-xs">({{ item.percent }}%)</span>
              </div>
              <div class="w-full flex justify-between text-sm pt-2 mt-1 border-t border-gray-50">
                <span class="text-gray-500 font-medium">Total servicios</span>
                <span class="font-bold text-gray-900">{{ totalServicesCount() }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Estado de citas</h3>
            <div class="relative h-56"><canvas #statusChart></canvas></div>
            <div class="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-4 border-t border-gray-100">
              <div *ngFor="let item of statusLegend()" class="flex items-center gap-1.5 text-sm">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" [style.background]="item.color"></span>
                <span class="text-gray-600">{{ item.label }}</span>
                <span class="font-semibold text-gray-900">{{ item.count }}</span>
                <span class="text-gray-400 text-xs">({{ item.percent }}%)</span>
              </div>
              <div class="w-full flex justify-between text-sm pt-2 mt-1 border-t border-gray-50">
                <span class="text-gray-500 font-medium">Total citas</span>
                <span class="font-bold text-gray-900">{{ totalAppointmentsCount() }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Últimas citas</h3>
              <span class="text-xs text-gray-400">hoy · {{ filteredTodayAppts().length }} citas</span>
            </div>

            <div class="flex flex-wrap gap-1.5 mb-4">
              <button (click)="todayFilter.set('ALL')"
                class="px-2.5 py-1 text-xs font-medium rounded-lg transition-all"
                [class.bg-indigo-600]="todayFilter() === 'ALL'" [class.text-white]="todayFilter() === 'ALL'"
                [class.bg-gray-100]="todayFilter() !== 'ALL'" [class.text-gray-600]="todayFilter() !== 'ALL'"
                [class.hover:bg-gray-200]="todayFilter() !== 'ALL'">Todas</button>
              <button (click)="todayFilter.set('PENDING')"
                class="px-2.5 py-1 text-xs font-medium rounded-lg transition-all"
                [class.bg-amber-500]="todayFilter() === 'PENDING'" [class.text-white]="todayFilter() === 'PENDING'"
                [class.bg-amber-50]="todayFilter() !== 'PENDING'" [class.text-amber-600]="todayFilter() !== 'PENDING'"
                [class.hover:bg-amber-100]="todayFilter() !== 'PENDING'">Pendiente</button>
              <button (click)="todayFilter.set('CONFIRMED')"
                class="px-2.5 py-1 text-xs font-medium rounded-lg transition-all"
                [class.bg-indigo-500]="todayFilter() === 'CONFIRMED'" [class.text-white]="todayFilter() === 'CONFIRMED'"
                [class.bg-indigo-50]="todayFilter() !== 'CONFIRMED'" [class.text-indigo-600]="todayFilter() !== 'CONFIRMED'"
                [class.hover:bg-indigo-100]="todayFilter() !== 'CONFIRMED'">Confirmada</button>
              <button (click)="todayFilter.set('COMPLETED')"
                class="px-2.5 py-1 text-xs font-medium rounded-lg transition-all"
                [class.bg-emerald-500]="todayFilter() === 'COMPLETED'" [class.text-white]="todayFilter() === 'COMPLETED'"
                [class.bg-emerald-50]="todayFilter() !== 'COMPLETED'" [class.text-emerald-600]="todayFilter() !== 'COMPLETED'"
                [class.hover:bg-emerald-100]="todayFilter() !== 'COMPLETED'">Completada</button>
              <button (click)="todayFilter.set('CANCELLED')"
                class="px-2.5 py-1 text-xs font-medium rounded-lg transition-all"
                [class.bg-rose-500]="todayFilter() === 'CANCELLED'" [class.text-white]="todayFilter() === 'CANCELLED'"
                [class.bg-rose-50]="todayFilter() !== 'CANCELLED'" [class.text-rose-600]="todayFilter() !== 'CANCELLED'"
                [class.hover:bg-rose-100]="todayFilter() !== 'CANCELLED'">Cancelada</button>
            </div>

            <div class="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              <div *ngFor="let apt of filteredTodayAppts()" class="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div class="flex flex-col items-center w-14 flex-shrink-0 pt-0.5">
                  <span class="text-xs font-bold text-gray-700 leading-tight">{{ formatTime(apt.startTime) }}</span>
                  <span class="text-[10px] text-gray-400 leading-tight">{{ formatDate(apt.startTime) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ apt.clientName }}</p>
                  <p class="text-xs text-gray-400 truncate">{{ apt.serviceName || getServiceName(apt.serviceId) }}</p>
                </div>
                <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-lg flex-shrink-0 mt-0.5"
                  [class.bg-indigo-50]="apt.status === 'CONFIRMED'" [class.text-indigo-600]="apt.status === 'CONFIRMED'"
                  [class.bg-emerald-50]="apt.status === 'COMPLETED'" [class.text-emerald-600]="apt.status === 'COMPLETED'"
                  [class.bg-amber-50]="apt.status === 'PENDING'" [class.text-amber-600]="apt.status === 'PENDING'"
                  [class.bg-rose-50]="apt.status === 'CANCELLED'" [class.text-rose-600]="apt.status === 'CANCELLED'">
                  {{ statusLabel(apt.status) }}
                </span>
              </div>
              <div *ngIf="filteredTodayAppts().length === 0" class="text-center py-6 text-gray-400 text-sm">No hay citas para este filtro</div>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private serviceService = inject(ServiceService);

  private services: ServiceModel[] = [];
  private allAppointments: Appointment[] = [];

  loading = signal(true);
  selectedPeriod = signal<'day' | 'month' | 'year'>('month');
  periods = [
    { label: 'Hoy', value: 'day' as const },
    { label: 'Mes', value: 'month' as const },
    { label: 'Año', value: 'year' as const },
  ];

  stats = signal<PeriodStats>({ total: 0, completed: 0, revenue: 0, serviceCounts: {}, serviceRevenue: {} });
  pendingCount = signal(0);
  avgTicket = signal(0);
  todayAppointments = signal<Appointment[]>([]);
  todayFilter = signal<string>('ALL');

  filteredTodayAppts = computed(() => {
    const filter = this.todayFilter();
    return filter === 'ALL' ? this.todayAppointments() : this.todayAppointments().filter((a) => a.status === filter);
  });

  private readonly chartColors = [
    'rgba(99,102,241,0.85)', 'rgba(16,185,129,0.85)', 'rgba(245,158,11,0.85)',
    'rgba(239,68,68,0.85)', 'rgba(59,130,246,0.85)', 'rgba(168,85,247,0.85)',
    'rgba(236,72,153,0.85)',
  ];

  readonly statusColors: Record<string, string> = {
    PENDING: 'rgba(245,158,11,0.85)',
    CONFIRMED: 'rgba(99,102,241,0.85)',
    COMPLETED: 'rgba(16,185,129,0.85)',
    CANCELLED: 'rgba(239,68,68,0.85)',
  };

  serviceLegend = computed(() => {
    const counts = this.stats().serviceCounts;
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    let i = 0;
    return Object.entries(counts).map(([id, count]) => {
      const name = this.services.find((s) => s.id === id)?.name || id;
      return { label: name, count, percent: total > 0 ? Math.round((count / total) * 100) : 0, color: this.chartColors[i++ % this.chartColors.length] };
    });
  });

  totalServicesCount = computed(() => Object.values(this.stats().serviceCounts).reduce((a, b) => a + b, 0));

  statusLegend = computed(() => {
    const all = this.allAppointments;
    const total = all.length;
    const items = [
      { label: 'Pendientes', key: 'PENDING' as const },
      { label: 'Confirmadas', key: 'CONFIRMED' as const },
      { label: 'Completadas', key: 'COMPLETED' as const },
      { label: 'Canceladas', key: 'CANCELLED' as const },
    ];
    return items.map((item) => {
      const count = all.filter((a) => a.status === item.key).length;
      return { label: item.label, count, percent: total > 0 ? Math.round((count / total) * 100) : 0, color: this.statusColors[item.key] };
    });
  });

  totalAppointmentsCount = computed(() => this.allAppointments.length);

  revenueChartRef = viewChild<ElementRef<HTMLCanvasElement>>('revenueChart');
  servicesChartRef = viewChild<ElementRef<HTMLCanvasElement>>('servicesChart');
  statusChartRef = viewChild<ElementRef<HTMLCanvasElement>>('statusChart');

  private revenueChart: Chart | null = null;
  private servicesChart: Chart | null = null;
  private statusChart: Chart | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  selectPeriod(p: 'day' | 'month' | 'year'): void {
    this.selectedPeriod.set(p);
    this.computeStats();
    this.updateCharts();
  }

  private loadData(): void {
    this.serviceService.getAll().subscribe((s) => {
      this.services = s;
    });
    this.appointmentService.getAll().subscribe((apps) => {
      this.allAppointments = apps;
      const todayStr = new Date().toISOString().split('T')[0];
      this.todayAppointments.set(apps.filter((a) => a.startTime.startsWith(todayStr)));
      this.computeStats();
      this.loading.set(false);
      setTimeout(() => this.initCharts());
    });
  }

  private computeStats(): void {
    const now = new Date();
    const period = this.selectedPeriod();

    const filtered = this.allAppointments.filter((a) => {
      const d = new Date(a.startTime);
      const completed = a.status === 'COMPLETED' || a.status === 'CONFIRMED';
      if (!completed) return false;
      if (period === 'day') return d.toDateString() === now.toDateString();
      if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      return d.getFullYear() === now.getFullYear();
    });

    const completed = filtered.filter((a) => a.status === 'COMPLETED');
    const confirmed = filtered.filter((a) => a.status === 'CONFIRMED');

    const counts: Record<string, number> = {};
    const revs: Record<string, number> = {};
    let totalRevenue = 0;

    for (const a of [...completed, ...confirmed]) {
      counts[a.serviceId] = (counts[a.serviceId] || 0) + 1;
      const price = this.services.find((s) => s.id === a.serviceId)?.priceCLP || 0;
      revs[a.serviceId] = (revs[a.serviceId] || 0) + price;
      totalRevenue += price;
    }

    this.stats.set({ total: filtered.length, completed: completed.length, revenue: totalRevenue, serviceCounts: counts, serviceRevenue: revs });
    this.pendingCount.set(this.allAppointments.filter((a) => a.status === 'PENDING').length);
    this.avgTicket.set(completed.length + confirmed.length > 0 ? Math.round(totalRevenue / (completed.length + confirmed.length)) : 0);
  }

  private initCharts(): void {
    this.createRevenueChart();
    this.createServicesChart();
    this.createStatusChart();
  }

  private updateCharts(): void {
    this.createRevenueChart();
    this.createServicesChart();
    this.createStatusChart();
  }

  private getMonthlyRevenue(): { labels: string[]; data: number[] } {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const revenue: number[] = Array(12).fill(0);
    for (const a of this.allAppointments) {
      if (a.status !== 'COMPLETED' && a.status !== 'CONFIRMED') continue;
      const d = new Date(a.startTime);
      if (d.getFullYear() !== new Date().getFullYear()) continue;
      const price = this.services.find((s) => s.id === a.serviceId)?.priceCLP || 0;
      revenue[d.getMonth()] += price;
    }
    return { labels: months, data: revenue };
  }

  private createRevenueChart(): void {
    const el = this.revenueChartRef()?.nativeElement;
    if (!el) return;
    this.revenueChart?.destroy();
    const { labels, data } = this.getMonthlyRevenue();
    this.revenueChart = new Chart(el, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Ingresos',
          data,
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => 'Ingresos: $' + Number(ctx.raw).toLocaleString('es-CL'),
            },
          },
        },
        scales: {
          y: { beginAtZero: true, ticks: { callback: (v) => '$' + Number(v).toLocaleString('es-CL') }, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  private createServicesChart(): void {
    const el = this.servicesChartRef()?.nativeElement;
    if (!el) return;
    this.servicesChart?.destroy();

    const stats = this.stats();
    const labels: string[] = [];
    const data: number[] = [];
    const colors = ['rgba(99,102,241,0.7)', 'rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)', 'rgba(239,68,68,0.7)', 'rgba(59,130,246,0.7)', 'rgba(168,85,247,0.7)', 'rgba(236,72,153,0.7)'];

    for (const [id, count] of Object.entries(stats.serviceCounts)) {
      const name = this.services.find((s) => s.id === id)?.name || id;
      labels.push(name);
      data.push(count);
    }

    this.servicesChart = new Chart(el, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderWidth: 0 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    });
  }

  private createStatusChart(): void {
    const el = this.statusChartRef()?.nativeElement;
    if (!el) return;
    this.statusChart?.destroy();

    const all = this.allAppointments;
    const pending = all.filter((a) => a.status === 'PENDING').length;
    const confirmed = all.filter((a) => a.status === 'CONFIRMED').length;
    const completed = all.filter((a) => a.status === 'COMPLETED').length;
    const cancelled = all.filter((a) => a.status === 'CANCELLED').length;

    this.statusChart = new Chart(el, {
      type: 'doughnut',
      data: {
        labels: ['Pendientes', 'Confirmadas', 'Completadas', 'Canceladas'],
        datasets: [{ data: [pending, confirmed, completed, cancelled], backgroundColor: ['rgba(245,158,11,0.7)', 'rgba(99,102,241,0.7)', 'rgba(16,185,129,0.7)', 'rgba(239,68,68,0.7)'], borderWidth: 0 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '65%',
        plugins: { legend: { display: false } },
      },
    });
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = { PENDING: 'Pendiente', CONFIRMED: 'Confirmada', COMPLETED: 'Completada', CANCELLED: 'Cancelada' };
    return map[s] || s;
  }

  formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  getServiceName(id: string): string {
    return this.services.find((s) => s.id === id)?.name || id;
  }
}
