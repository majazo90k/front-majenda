import { WeekSchedule } from './schedule.model';

export interface Staff {
  id: string;
  name: string;
  services: string[];
  schedule: WeekSchedule;
}
