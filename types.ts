export interface FlatData {
  row_index: number;
  building_name: string;
  flat_number: string;
  subscribed_plates_day1: number;
  served_plates_day1: number;
  subscribed_plates_day2: number;
  served_plates_day2: number;
  name?: string;
  phone_number?: string;
}

export type DistributionDay = 'day1' | 'day2';

export interface NewFlatData {
    building_name: string;
    flat_number: string;
    subscribed_plates: number;
    name?: string;
    phone_number?: string;
}