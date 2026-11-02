export type UserRole = 'customer' | 'farmer' | 'admin' | 'agronomist';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface FarmPlot {
  id: number;
  farm_id: number;
  plot_number: string;
  name: string;
  area_sqft: number;
  area_sqm: number;
  soil_type: string;
  soil_ph: number;
  is_available: boolean;
  water_availability: string;
  monthly_rental_inr: number;
}

export interface Farm {
  id: number;
  name: string;
  description?: string;
  location_name: string;
  state: string;
  latitude: number;
  longitude: number;
  total_area_sqft: number;
  water_source: string;
  infrastructure_details?: string;
  owner_name?: string;
  image_url?: string;
  is_organic_certified: boolean;
  certification_body?: string;
  plots: FarmPlot[];
}

export interface Crop {
  id: number;
  crop_key: string;
  name: string;
  category: string;
  suitable_seasons: string;
  suitable_soils: string;
  min_ph: number;
  max_ph: number;
  water_level: string;
  growth_cycle_days: number;
  avg_yield_kg_per_sqm: number;
  max_potential_yield_kg_per_sqm: number;
  cost_per_sqm_inr: number;
  companion_crops?: string;
  incompatible_crops?: string;
  nutritional_highlights?: string;
  image_url?: string;
}

export interface CropEvaluation {
  crop_name: string;
  target_quantity_kg: number;
  required_area_sqm: number;
  estimated_yield_range_kg: {
    conservative_yield: number;
    expected_yield: number;
    max_potential_yield: number;
  };
  season_compatible: boolean;
  soil_compatible: boolean;
  water_demand_liters: number;
  estimated_cost_inr: number;
  status: string;
  notes: string[];
}

export interface FeasibilityAssessment {
  id: number;
  is_feasible: boolean;
  status: string;
  overall_score: number;
  available_area_sqm: number;
  total_required_area_sqm: number;
  area_utilization_percent: number;
  min_viable_budget_inr: number;
  reasons_json: string;
  modifications_json: string;
  warnings_json: string;
  recommendations_json: string;
  crop_evaluations_json: string;
  cost_breakdown_json: string;
  created_at: string;
}

export interface RequestedCrop {
  id?: number;
  crop_name: string;
  target_quantity_kg: number;
  preferred_variety?: string;
}

export interface FarmingRequest {
  id: number;
  customer_id: number;
  farm_id: number;
  plot_id: number;
  season: string;
  cultivation_preference: string;
  budget_inr: number;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
  farm?: Farm;
  plot?: FarmPlot;
  requested_crops: RequestedCrop[];
  feasibility?: FeasibilityAssessment;
}

export interface FarmingTask {
  id: number;
  project_id: number;
  farmer_id: number;
  title: string;
  description?: string;
  category: string;
  due_date?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  completed_at?: string;
  notes?: string;
  photo_url?: string;
}

export interface FarmingActivityLog {
  id: number;
  project_id: number;
  farmer_id: number;
  activity_type: string;
  title: string;
  description: string;
  photo_url?: string;
  created_at: string;
}

export interface FarmingInput {
  id: number;
  project_id: number;
  farmer_id: number;
  input_type: string;
  item_name: string;
  quantity: number;
  unit: string;
  is_organic_certified: boolean;
  certification_notes?: string;
  photo_url?: string;
  recorded_at: string;
}

export interface HarvestRecord {
  id: number;
  project_id: number;
  crop_name: string;
  requested_target_kg: number;
  estimated_yield_kg: number;
  actual_harvested_kg: number;
  delivered_kg: number;
  harvest_date: string;
  status: string;
  photo_url?: string;
  quality_grade: string;
  notes?: string;
}

export interface DeliveryRecord {
  id: number;
  project_id: number;
  recipient_name: string;
  delivery_address: string;
  contact_phone: string;
  scheduled_date?: string;
  delivered_date?: string;
  tracking_number?: string;
  status: string;
  delivery_notes?: string;
}

export interface FarmingProject {
  id: number;
  request_id: number;
  customer_id: number;
  farmer_id: number;
  farm_id: number;
  plot_id: number;
  project_code: string;
  current_stage: string;
  status: string;
  estimated_harvest_date?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  farm?: Farm;
  plot?: FarmPlot;
  farmer?: User;
  request?: FarmingRequest;
  tasks: FarmingTask[];
  activity_logs: FarmingActivityLog[];
  inputs: FarmingInput[];
  harvest_records: HarvestRecord[];
  delivery_records: DeliveryRecord[];
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  project_id?: number;
  created_at: string;
}
