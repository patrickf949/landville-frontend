import { Coordinates } from "./Coordinates";
import { Address } from "./Address";

export interface PropertyOwner {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
}

export interface Amenity {
  id?: number;
  name?: string;
  group?: string;
  group_display?: string;
  icon?: string;
}

export interface NearbyFeature {
  id?: number;
  name?: string;
  icon?: string;
}

export interface Property {
  id?: number;
  price?: number;
  lot_size?: number;
  image_main?: string;
  image_others?: string[];
  address?: Address;
  coordinates?: Coordinates;
  created_at?: string;
  updated_at?: string;
  title?: string;
  listing_type?: string;
  property_type?: string;
  rent_period?: string;
  status?: string;
  description?: string;
  list_date?: string;
  is_published?: boolean;
  closed_at?: string;
  bedrooms?: number;
  bathrooms?: number;
  garages?: number;
  video?: string;
  view_count?: number;
  last_viewed?: string;
  slug?: string;
  owner?: PropertyOwner;
  amenities?: Amenity[];
  nearby?: NearbyFeature[];
  distance_to_main_road?: string;
  distance_to_city?: string;
  noise_level?: string;
}

export interface PropertiesResponse extends Property {
  data: {
    properties: {
      count: number;
      next: string;
      previous: string;
      results: Property[];
    };
  };
}
