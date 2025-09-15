'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@zyra/ui/components/input';
import { Autocomplete, GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Button } from '@zyra/ui/components/button';

interface Location {
  lat: number;
  lng: number;
}

interface LocationData {
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
}

interface SalonLocationFormProps {
  onLocationSelect?: (locationData: LocationData) => void;
  countryCode?: string;
}

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  height: '400px',
  width: '100%'
};

const defaultCenter: Location = {
  lat: 4.0511, // Douala, Cameroon
  lng: 9.7679
};

export default function SalonLocationForm({ onLocationSelect, countryCode = 'cm' }: SalonLocationFormProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [mapCenter, setMapCenter] = useState<Location>(defaultCenter);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState('');
  
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Handle place selection from autocomplete
  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        setSelectedLocation(location);
        setSelectedAddress(place.formatted_address || place.name || '');
        setMapCenter(location);
        setError(''); // Clear error when location is selected
        
        // Pan the map to the selected location
        if (map) {
          map.panTo(location);
          map.setZoom(15);
        }
      }
    }
  };

  // Handle map click to place marker
  const onMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const location = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      
      setSelectedLocation(location);
      setMapCenter(location);
      setError(''); // Clear error when location is selected
      
      // Reverse geocoding to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          setSelectedAddress(results[0].formatted_address);
        }
      });
    }
  };

  // Extract city and district from address
  const extractLocationInfo = (address: string, coordinates: Location) => {
    // Simple extraction - you can make this more sophisticated
    const parts = address.split(',');
    let city = 'Douala'; // Default
    let district = '';
    
    if (parts.length >= 2) {
      city = parts[parts.length - 2].trim();
      district = parts[0].trim();
    }
    
    return {
      address,
      city,
      district,
      latitude: coordinates.lat,
      longitude: coordinates.lng
    };
  };

  const handleSave = () => {
    if (!selectedAddress || !selectedLocation) {
      setError('Veuillez sélectionner un emplacement pour votre salon avant de continuer.');
      return;
    }

    setError(''); // Clear any existing error
    const locationData = extractLocationInfo(selectedAddress, selectedLocation);
    console.log('Location data:', locationData);
    
    if (onLocationSelect) {
      onLocationSelect(locationData);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Localisation du salon</h2>
      
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
        libraries={libraries}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Section */}
          <div className="space-y-4">
            {/* Search Input with Autocomplete */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher l'adresse de votre salon
              </label>
              <Autocomplete
                onLoad={(autocomplete) => {
                  autocompleteRef.current = autocomplete;
                }}
                onPlaceChanged={onPlaceChanged}
                options={{
                  componentRestrictions: { country: countryCode }, // Use dynamic country code
                  fields: ['formatted_address', 'geometry', 'name'],
                }}
              >
                <Input
                  type="text"
                  placeholder="Ex: Rue de la République, Douala..."
                  className="w-full text-black focus:text-black"
                />
              </Autocomplete>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Selected Location Info */}
            {selectedLocation && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">Emplacement sélectionné :</h3>
                <p className="text-sm text-gray-700 mb-3">{selectedAddress}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Latitude :</span>
                    <span className="font-mono text-black ml-2">{selectedLocation.lat.toFixed(6)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Longitude :</span>
                    <span className="font-mono text-black ml-2">{selectedLocation.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={!selectedAddress || !selectedLocation}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirmer l'emplacement
              </Button>
            </div>
          </div>

          {/* Map Section */}
          <div className="space-y-4">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={13}
              onLoad={(map) => setMap(map)}
              onClick={onMapClick}
              options={{
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {selectedLocation && (
                <Marker position={selectedLocation} />
              )}
            </GoogleMap>
            {!selectedLocation && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 text-center">
                  Recherchez votre adresse ou cliquez sur la carte pour localiser votre salon
                </p>
              </div>
            )}
          </div>
        </div>
      </LoadScript>
    </div>
  );
}
