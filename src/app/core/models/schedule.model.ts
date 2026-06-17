export interface DaySchedule {
  isWorkingDay: boolean;
  openTime: string;
  closeTime: string;
}

export interface WeekSchedule {
  [dayOfWeek: number]: DaySchedule;
}

export interface BlockedRange {
  id: string;
  start: string;
  end: string;
  reason: string;
}

export interface Holiday {
  id: string;
  date: string;
  description: string;
}
