export type SlotStatus = 'open' | 'held' | 'booked' | 'blocked';
export type BookingStatus = 'held' | 'confirmed' | 'cancelled' | 'attended' | 'no_show';
export type VisitType = 'first' | 'follow_up' | 'second_opinion';

export interface Location {
  id: string;
  name_ar: string;
  name_en: string;
  address_ar: string | null;
  address_en: string | null;
  map_url: string | null;
  active: boolean;
  sort: number;
}

export interface Slot {
  id: string;
  location_id: string;
  starts_at: string;
  ends_at: string;
  status?: SlotStatus;
}

export interface BookingInput {
  slot_id: string;
  name: string;
  phone: string;
  visit_type: VisitType;
  lang: 'ar' | 'en';
  consent: boolean;
  how_heard: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_path: string | null;
  referrer: string | null;
}

export interface BookingResult { ref: string; starts_at: string; location_id: string }

export interface Booking {
  id: string;
  ref: string;
  slot_id: string;
  location_id: string;
  starts_at: string;
  patient_name: string;
  phone: string;
  visit_type: VisitType;
  lang: 'ar' | 'en';
  how_heard: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_path: string | null;
  referrer: string | null;
  status: BookingStatus;
  staff_notes: string | null;
  created_at: string;
}

export interface GenerateInput {
  location_id: string;
  from: string;
  to: string;
  weekdays: number[];
  start: string;
  end: string;
  minutes: number;
}

export class BookingError extends Error {
  constructor(public code: string) { super(code); }
}

export interface PublicApi {
  demo: boolean;
  listLocations(): Promise<Location[]>;
  listOpenSlots(fromIso: string, toIso: string): Promise<Slot[]>;
  book(input: BookingInput): Promise<BookingResult>;
}

export interface AdminApi extends PublicApi {
  session(): Promise<{ email: string } | null>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  listAllLocations(): Promise<Location[]>;
  saveLocation(loc: Partial<Location> & { name_ar: string; name_en: string }): Promise<void>;
  listSlots(locationId: string, fromIso: string, toIso: string): Promise<Slot[]>;
  generateSlots(input: GenerateInput): Promise<number>;
  setSlotStatus(id: string, status: 'open' | 'blocked'): Promise<void>;
  deleteSlot(id: string): Promise<void>;
  listBookings(fromIso: string | null, toIso: string | null): Promise<Booking[]>;
  updateBooking(id: string, patch: { status?: BookingStatus; staff_notes?: string | null }): Promise<void>;
}

export const KNOWN_ERRORS = ['slot_unavailable', 'too_many_bookings', 'invalid_phone', 'invalid_name', 'consent_required', 'busy', 'not_staff', 'invalid_length', 'invalid_range', 'invalid_hours'];

export function toBookingError(message: string | undefined): BookingError {
  const code = KNOWN_ERRORS.find((k) => message?.includes(k));
  return new BookingError(code ?? 'network');
}
