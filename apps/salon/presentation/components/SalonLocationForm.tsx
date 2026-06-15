'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@zyra/ui/components/input';
import { Autocomplete, GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Button } from '@zyra/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@zyra/ui/components/dialog';
import { X, MapPin, Navigation } from 'lucide-react';
import { editDocument } from '@zyra/conf/lib/query';
import { useSalon } from '@/hooks/useSalon';
import { toast } from 'sonner';

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
  isOpen: boolean;
  onClose: () => void;
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

export default function SalonLocationForm({ 
  isOpen, 
  onClose, 
  onLocationSelect, 
  countryCode = 'cm' 
}: SalonLocationFormProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [mapCenter, setMapCenter] = useState<Location>(defaultCenter);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const { salon, refetch } = useSalon();
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
        setError(''); 
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

  const handleSave = async () => {
    if (!selectedAddress || !selectedLocation) {
      setError('Veuillez sélectionner un emplacement pour votre salon avant de continuer.');
      return;
    }
    if (!salon?.id) {
      setError('Erreur: Salon non trouvé.');
      return;
    }
    setIsUpdating(true);
    setError(''); // Clear any existing error
    try {
      const locationData = extractLocationInfo(selectedAddress, selectedLocation);
      // Mettre à jour le salon avec les informations de localisation et passer à 80%
      await editDocument("salons", salon.id, {
        address: locationData.address,
        city: locationData.city,
        location_lat: locationData.latitude,
        location_lng: locationData.longitude,
        progress: 80 // Passer le pourcentage à 80%
      });
      // Rafraîchir les données du salon
      await refetch();
      toast.success('Emplacement du salon mis à jour avec succès !');
      if (onLocationSelect) {
        onLocationSelect(locationData);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.');
      toast.error('Erreur lors de la mise à jour de l\'emplacement');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setSelectedLocation(location);
        setMapCenter(location);
        setError('');
        if (map) {
          map.panTo(location);
          map.setZoom(15);
        }
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            setSelectedAddress(results[0].formatted_address);
          }
          setIsLocating(false);
        });
      },
      () => {
        setError('Impossible d\'obtenir votre position. Vérifiez les permissions du navigateur.');
        setIsLocating(false);
      }
    );
  };

  const handleCancel = () => {
    // Reset form data
    setSelectedLocation(null);
    setSelectedAddress('');
    setMapCenter(defaultCenter);
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen}  onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] lg:max-w-5xl xl:max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-6 w-6 text-blue-600" />
            Localisation du salon
          </DialogTitle>
          <DialogDescription>
            Recherchez et sélectionnez l'emplacement exact de votre salon sur la carte
          </DialogDescription>
        </DialogHeader>

        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
          libraries={libraries}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Search Section */}
            <div className="space-y-4">
              {/* Search Input with Autocomplete */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Rechercher l'adresse de votre salon
                </label>
                <Autocomplete
                  onLoad={(autocomplete) => {
                    autocompleteRef.current = autocomplete;
                  }}
                  onPlaceChanged={onPlaceChanged}
                  options={{
                    componentRestrictions: { country: countryCode },
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

              <Button
                type="button"
                variant="outline"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="w-full flex items-center gap-2"
              >
                {isLocating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Navigation className="h-4 w-4 text-blue-500" />
                )}
                {isLocating ? 'Localisation en cours...' : 'Utiliser ma position actuelle'}
              </Button>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Selected Location Info */}
              {selectedLocation && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Emplacement sélectionné :</h3>
                  <p className="text-sm text-gray-700 dark:text-slate-300 mb-3">{selectedAddress}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-slate-400">Latitude :</span>
                      <span className="font-mono text-black ml-2">{selectedLocation.lat.toFixed(6)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-slate-400">Longitude :</span>
                      <span className="font-mono text-black ml-2">{selectedLocation.lng.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              )}
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
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-slate-400 text-center">
                    Recherchez votre adresse ou cliquez sur la carte pour localiser votre salon
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedAddress || !selectedLocation || isUpdating}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-slate-600"
            >
              {isUpdating ? 'Enregistrement...' : 'Confirmer l\'emplacement'}
            </Button>
          </div>
        </LoadScript>
      </DialogContent>
    </Dialog>
  );
}
