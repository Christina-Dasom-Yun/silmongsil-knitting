import { motion } from 'framer-motion';
import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem'
};

const defaultCenter = {
  lat: 37.5665,  // 서울 중심
  lng: 126.9780
};

const libraries = ['places'];

const MapSectionWithGoogle = ({ locations, onAddLocation, onDeleteLocation }) => {
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', lat: null, lng: null });
  const [autocomplete, setAutocomplete] = useState(null);
  const searchInputRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (e) => {
    if (isAddingLocation) {
      setNewLocation({
        ...newLocation,
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
    }
  };

  const handleAddLocationSubmit = () => {
    if (newLocation.name && newLocation.lat && newLocation.lng) {
      onAddLocation({
        name: newLocation.name,
        lat: newLocation.lat,
        lng: newLocation.lng
      });
      setNewLocation({ name: '', lat: null, lng: null });
      setIsAddingLocation(false);
    }
  };

  const handleCancel = () => {
    setNewLocation({ name: '', lat: null, lng: null });
    setIsAddingLocation(false);
  };

  const onAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceSelected = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const name = place.name || place.formatted_address || '';

        setNewLocation({ name, lat, lng });

        // Center map on selected location
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      }
    }
  };

  if (!isLoaded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white p-8 rounded-3xl card-shadow"
      >
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">가고 싶은 장소 🗺️</h3>
          <p className="text-sm text-gray-600">함께 방문하고 싶은 곳을 표시해보세요</p>
        </div>
        <div className="w-full h-96 bg-gradient-to-br from-light-beige to-warm-cream rounded-2xl flex items-center justify-center">
          <p className="text-gray-500">Google Maps를 로딩 중...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white p-8 rounded-3xl card-shadow"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">가고 싶은 장소 🗺️</h3>
        <p className="text-sm text-gray-600">함께 방문하고 싶은 곳을 표시해보세요</p>
      </div>

      {/* Search Input */}
      {isAddingLocation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4"
        >
          <p className="text-sm text-gray-600 mb-2">장소를 검색하거나 지도를 클릭하세요</p>
          <Autocomplete
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceSelected}
          >
            <input
              ref={searchInputRef}
              type="text"
              placeholder="장소 이름 또는 주소 검색..."
              className="w-full px-4 py-3 border-2 border-indie-pink/30 rounded-xl focus:outline-none focus:border-indie-pink transition-colors"
            />
          </Autocomplete>
        </motion.div>
      )}

      {/* Google Map */}
      <div className="rounded-2xl overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry',
                stylers: [{ saturation: -10 }]
              }
            ]
          }}
        >
          {/* Existing Location Markers */}
          {locations?.map((location) => (
            <Marker
              key={location.id}
              position={{ lat: location.lat, lng: location.lng }}
              onClick={() => setSelectedLocation(location)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#FFB6C1',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
              }}
            />
          ))}

          {/* New Location Marker (while adding) */}
          {isAddingLocation && newLocation.lat && newLocation.lng && (
            <Marker
              position={{ lat: newLocation.lat, lng: newLocation.lng }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#4CAF50',
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
              }}
            />
          )}

          {/* Info Window for Selected Location */}
          {selectedLocation && (
            <InfoWindow
              position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
              onCloseClick={() => setSelectedLocation(null)}
            >
              <div className="p-2">
                <h4 className="font-bold text-gray-800 mb-2">{selectedLocation.name}</h4>
                <button
                  onClick={() => {
                    onDeleteLocation(selectedLocation.id);
                    setSelectedLocation(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Add Location Form */}
      {isAddingLocation && newLocation.lat && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-light-beige rounded-2xl"
        >
          <p className="text-sm text-gray-600 mb-3">선택된 위치</p>
          <input
            type="text"
            value={newLocation.name}
            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
            placeholder="장소 이름을 입력하세요"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl mb-3"
          />
          <p className="text-xs text-gray-500 mb-3">
            위도: {newLocation.lat.toFixed(6)}, 경도: {newLocation.lng.toFixed(6)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleAddLocationSubmit}
              disabled={!newLocation.name}
              className="flex-1 bg-indie-pink text-white py-2 rounded-xl hover:bg-indie-pink/80 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              추가
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-xl hover:bg-gray-400 transition-colors"
            >
              취소
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Location Button */}
      {!isAddingLocation && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddingLocation(true)}
          className="mt-6 w-full bg-gradient-to-r from-indie-pink/80 to-soft-coral/80 text-white font-semibold py-3 rounded-2xl hover:shadow-lg transition-all"
        >
          + 장소 추가하기
        </motion.button>
      )}

      {/* Location List View */}
      {locations && locations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <h4 className="text-lg font-semibold text-gray-700 mb-3">저장된 장소 목록</h4>
          <div className="space-y-2">
            {locations.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-light-beige/50 rounded-xl hover:bg-light-beige transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-2 h-2 bg-indie-pink rounded-full"></div>
                  <button
                    onClick={() => {
                      if (map) {
                        map.panTo({ lat: location.lat, lng: location.lng });
                        map.setZoom(15);
                      }
                      setSelectedLocation(location);
                    }}
                    className="text-left flex-1 text-gray-800 hover:text-indie-pink transition-colors"
                  >
                    <p className="font-medium">{location.name}</p>
                    <p className="text-xs text-gray-500">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                  </button>
                </div>
                <button
                  onClick={() => onDeleteLocation(location.id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-2"
                  title="삭제"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MapSectionWithGoogle;
