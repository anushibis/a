export interface FlatData {
  row_index: number;
  flat_number: string;
  subscribed_plates_day1: number;
  served_plates_day1: number;
  subscribed_plates_day2: number;
  served_plates_day2: number;
  name?: string;
  phone_number?: string;
  amount_paid?: number;
}

export type DistributionDay = 'day1' | 'day2';