export interface DaySchedule {
  isWorkingDay: boolean;
  openTime: string;
  closeTime: string;
}

export interface WeekSchedule {
  [dayOfWeek: number]: DaySchedule;
}
