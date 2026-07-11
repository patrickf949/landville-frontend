import { Address } from './Address';
import { Coordinates } from './Coordinates'
import {
  Amenity, NearbyFeature, PropertyOwner
} from 'src/app/models/Property';

export interface PropertyDetail {
    data: {
        property: {
            id: number,
            price: number,
            lot_size: number,
            image_main: string,
            image_others: string[],
            address: Address,
            coordinates: Coordinates,
            created_at: string,
            updated_at: string,
            title: string,
            listing_type: string,
            property_type: string,
            rent_period: string,
            status: string,
            description: string,
            list_date: string,
            is_published: boolean,
            closed_at: string,
            bedrooms: number,
            bathrooms: number,
            garages: number,
            video: string,
            view_count: number,
            last_viewed: string,
            slug: string,
            owner: PropertyOwner,
            amenities: Amenity[],
            nearby: NearbyFeature[],
            distance_to_main_road: string,
            distance_to_city: string,
            noise_level: string
        }
    }
}
