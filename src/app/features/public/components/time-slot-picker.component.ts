import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { TimeSlot } from '../../../core/models';

interface SlotGroup {
  label: string;
  icon: string;
  slots: TimeSlot[];
}

@Component({
  selector: 'app-time-slot-picker',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe],
  template: `
    <div class="slot-wrap">

      <div *ngIf="slots.length === 0" class="empty-slots">
        <p>Selecciona un día para ver los horarios disponibles.</p>
      </div>

      <ng-container *ngIf="slots.length > 0">
        <div *ngFor="let group of groups" class="slot-group">
          <div class="group-header">
            <span class="group-icon">{{ group.icon }}</span>
            <span class="group-label">{{ group.label }}</span>
            <span class="group-count">{{ group.slots.length }} bloques</span>
          </div>
          <div class="slot-grid">
            <button *ngFor="let slot of group.slots" class="slot-btn"
              [class.avail]="slot.isAvailable && !slot.isBlocked"
              [class.taken]="!slot.isAvailable && !slot.isBlocked"
              [class.blocked]="slot.isBlocked"
              [class.active]="selectedSlot === slot"
              [disabled]="!slot.isAvailable || slot.isBlocked"
              (click)="selectSlot(slot)">
              {{ slot.start | date:'HH:mm' }}
            </button>
          </div>
        </div>

        <div class="legend">
          <span><span class="dot avail"></span> Disponible</span>
          <span><span class="dot taken"></span> Ocupado</span>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .slot-wrap { padding: 0.5rem 0; }
    .slot-group { margin-bottom: 1.25rem; }
    .group-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.6rem;
      padding-bottom: 0.4rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .group-icon { font-size: 1.1rem; }
    .group-label { font-weight: 600; color: #334155; font-size: 0.95rem; }
    .group-count { margin-left: auto; font-size: 0.8rem; color: #94a3b8; }
    .slot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 0.45rem; }
    .slot-btn { padding: 0.65rem 0.4rem; border: 1.5px solid #e2e8f0; border-radius: 8px; background: #fff; cursor: pointer; font-size: 0.85rem; transition: all 0.15s; font-weight: 500; }
    .slot-btn.avail { color: #1e293b; }
    .slot-btn.avail:hover { border-color: #6366f1; background: #eef2ff; }
    .slot-btn.taken { background: #fef2f2; color: #ef4444; text-decoration: line-through; cursor: not-allowed; opacity: 0.45; }
    .slot-btn.blocked { background: #f8fafc; color: #94a3b8; cursor: not-allowed; opacity: 0.4; }
    .slot-btn.active { border-color: #6366f1; background: #6366f1; color: #fff; font-weight: 700; }
    .empty-slots { text-align: center; padding: 2rem; color: #64748b; }
    .legend { display: flex; gap: 1.5rem; justify-content: center; margin-top: 0.75rem; font-size: 0.8rem; }
    .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 0.3rem; vertical-align: middle; }
    .dot.avail { background: #eef2ff; border: 1px solid #6366f1; }
    .dot.taken { background: #fef2f2; border: 1px solid #ef4444; }

    @media (max-width: 600px) {
      .slot-grid { grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 0.35rem; }
      .slot-btn { padding: 0.5rem 0.3rem; font-size: 0.8rem; }
    }
  `],
})
export class TimeSlotPickerComponent {
  @Input({ required: true }) slots: TimeSlot[] = [];
  @Input() selectedSlot: TimeSlot | null = null;
  @Output() slotSelected = new EventEmitter<TimeSlot>();

  get groups(): SlotGroup[] {
    const parseDate = (s: string) => new Date(s.endsWith('Z') ? s : s + 'Z');
    const h = (slot: TimeSlot) => parseDate(slot.start).getHours();
    const morning = this.slots.filter((s) => h(s) < 12);
    const afternoon = this.slots.filter((s) => h(s) >= 12 && h(s) < 18);
    const evening = this.slots.filter((s) => h(s) >= 18);

    const result: SlotGroup[] = [];
    if (morning.length) result.push({ label: 'Mañana', icon: '🌅', slots: morning });
    if (afternoon.length) result.push({ label: 'Tarde', icon: '☀️', slots: afternoon });
    if (evening.length) result.push({ label: 'Noche', icon: '🌙', slots: evening });
    return result;
  }

  selectSlot(slot: TimeSlot): void {
    this.slotSelected.emit(slot);
  }
}
