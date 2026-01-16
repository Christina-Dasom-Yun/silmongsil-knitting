import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, Autocomplete } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '1.5rem'
};

const defaultCenter = {
  lat: 37.5665,  // 서울 중심
  lng: 126.9780
};

const libraries = ['places'];

// 사용 가능한 태그 목록
const availableTags = [
  { id: 'cafe', label: '카페', color: 'bg-pink-100 text-pink-800' },
  { id: 'yarn', label: '실가게', color: 'bg-orange-100 text-orange-800' }
];

// 커스텀 마커 컴포넌트
const CustomMarker = ({ authorName, onClick, isSelected }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: isSelected ? 1.2 : 1 }}
    whileHover={{ scale: 1.3 }}
    transition={{ type: "spring", stiffness: 300, damping: 15 }}
    onClick={onClick}
    className="cursor-pointer"
    style={{ transform: 'translate(-50%, -50%)' }}
  >
    <div className={`
      relative bg-gradient-to-br from-indie-pink to-soft-coral
      text-white font-bold text-xs rounded-full
      w-12 h-12 flex items-center justify-center
      shadow-lg border-4 border-white
      ${isSelected ? 'ring-4 ring-indie-pink/50' : ''}
    `}>
      {authorName?.charAt(0) || '?'}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white"></div>
    </div>
  </motion.div>
);

// 커스텀 인포 카드
const CustomInfoCard = ({ location, onClose, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: -20, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.9 }}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-50"
    style={{ width: '300px' }}
  >
    <div className="bg-white rounded-3xl shadow-2xl p-5 relative border-4 border-white">
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute -top-2 -right-2 w-8 h-8 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 작성자 정보 */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indie-pink to-soft-coral text-white font-bold flex items-center justify-center text-sm shadow-md">
          {location.authorName?.charAt(0) || '?'}
        </div>
        <div>
          <p className="font-bold text-gray-800 text-sm">{location.authorName || '익명'}</p>
          <p className="text-xs text-gray-500">가고싶은곳</p>
        </div>
      </div>

      {/* 장소명 */}
      <h4 className="font-bold text-gray-800 mb-2 text-base">{location.name}</h4>

      {/* 추천 이유 */}
      {location.description && (
        <div className="bg-gradient-to-br from-light-beige/30 to-warm-cream/30 rounded-2xl p-3 mb-3">
          <p className="text-xs text-gray-500 font-semibold mb-1">💭 설명</p>
          <p className="text-sm text-gray-700 leading-relaxed">{location.description}</p>
        </div>
      )}

      {/* 태그 */}
      {location.tags && location.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {location.tags.map(tagId => {
            const tag = availableTags.find(t => t.id === tagId);
            return tag ? (
              <span
                key={tagId}
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${tag.color}`}
              >
                #{tag.label}
              </span>
            ) : null;
          })}
        </div>
      )}

      {/* 삭제 버튼 */}
      <button
        onClick={onDelete}
        className="w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded-xl transition-colors font-medium"
      >
        삭제하기
      </button>

      {/* 말풍선 꼬리 */}
      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-white"></div>
    </div>
  </motion.div>
);

const MapSectionWithGoogle = ({ locations, onAddLocation, onDeleteLocation, currentUserId, members }) => {
  const [map, setMap] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: '',
    description: '',
    lat: null,
    lng: null,
    tags: []
  });
  const [autocomplete, setAutocomplete] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const searchInputRef = useRef(null);

  // 현재 사용자의 이름 찾기
  const currentUser = members?.find(m => m.id === currentUserId);
  const currentUserName = currentUser?.name || '익명';

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

  const handleAddLocationSubmit = async () => {
    if (newLocation.name && newLocation.lat && newLocation.lng) {
      await onAddLocation(
        {
          name: newLocation.name,
          description: newLocation.description,
          lat: newLocation.lat,
          lng: newLocation.lng,
          tags: newLocation.tags
        },
        currentUserId,
        currentUserName
      );
      setNewLocation({ name: '', description: '', lat: null, lng: null, tags: [] });
      setIsAddingLocation(false);
    }
  };

  const handleCancel = () => {
    setNewLocation({ name: '', description: '', lat: null, lng: null, tags: [] });
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

        setNewLocation({ ...newLocation, name, lat, lng });

        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      }
    }
  };

  const toggleTag = (tagId) => {
    setNewLocation(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const toggleFilter = (tagId) => {
    setSelectedFilters(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  // 필터링된 장소 목록
  const filteredLocations = selectedFilters.length > 0
    ? locations?.filter(location =>
        location.tags?.some(tag => selectedFilters.includes(tag))
      ) || []
    : locations || [];

  // 장소 리스트에서 장소 클릭 시 지도로 이동
  const handleLocationClick = (location) => {
    if (!showMap) {
      setShowMap(true);
    }
    setSelectedLocation(location);

    // 지도가 로드된 후 이동
    setTimeout(() => {
      if (map) {
        map.panTo({ lat: location.lat, lng: location.lng });
        map.setZoom(16);
      }
    }, showMap ? 100 : 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white p-8 rounded-3xl card-shadow"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 font-gowun">가보고 싶은 곳 🗺️</h3>
      </div>

      {/* 태그 필터 */}
      {locations && locations.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-gray-600 font-medium mb-3">태그로 필터링</p>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => {
              const isActive = selectedFilters.includes(tag.id);
              return (
                <motion.button
                  key={tag.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFilter(tag.id)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? tag.color + ' ring-2 ring-offset-2 ring-indie-pink shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  #{tag.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* 장소 리스트 - 간결한 그리드 */}
      {filteredLocations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">
              가고싶은곳
              {selectedFilters.length > 0 && (
                <span className="text-indie-pink ml-1">
                  ({filteredLocations.length}개)
                </span>
              )}
            </h4>
            {filteredLocations.length > 8 && (
              <button
                onClick={() => setShowAllLocations(!showAllLocations)}
                className="text-xs text-indie-pink font-semibold hover:text-indie-pink/80 transition-colors"
              >
                {showAllLocations ? '접기 ▲' : `더보기 (${filteredLocations.length}) ▼`}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {(showAllLocations ? filteredLocations : filteredLocations.slice(0, 8)).map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleLocationClick(location)}
                className="group relative bg-gradient-to-br from-light-beige/40 to-warm-cream/40 p-3 rounded-2xl hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-indie-pink/30"
              >
                {/* 장소명 */}
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indie-pink to-soft-coral text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
                    {location.authorName?.charAt(0) || '?'}
                  </div>
                  <p className="font-semibold text-gray-800 text-sm line-clamp-2 flex-1">
                    {location.name}
                  </p>
                </div>

                {/* 태그 */}
                {location.tags && location.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {location.tags.map(tagId => {
                      const tag = availableTags.find(t => t.id === tagId);
                      return tag ? (
                        <span
                          key={tagId}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${tag.color}`}
                        >
                          #{tag.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                {/* 삭제 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLocation(location.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 p-1 bg-white rounded-full shadow-sm"
                  title="삭제"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 지도 보기 버튼 또는 지도 */}
      <AnimatePresence mode="wait">
        {!showMap ? (
          <motion.button
            key="show-map-btn"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowMap(true)}
            className="w-full bg-gradient-to-r from-indie-pink/80 to-soft-coral/80 text-white font-semibold py-4 rounded-3xl hover:shadow-lg transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            지도 보기
          </motion.button>
        ) : !isLoaded ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-96 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-3xl flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl mb-4"
            >
              🧶
            </motion.div>
            <p className="text-gray-600 font-medium">지도를 불러오고 있어요...</p>
            <p className="text-xs text-gray-500 mt-2">잠시만 기다려주세요 ✨</p>
          </motion.div>
        ) : (
          <motion.div
            key="map"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
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
                    className="w-full px-4 py-3 border-2 border-indie-pink/30 rounded-2xl focus:outline-none focus:border-indie-pink transition-colors"
                  />
                </Autocomplete>
              </motion.div>
            )}

            {/* Google Map */}
            <div className="rounded-3xl overflow-hidden shadow-xl relative">
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
                  ],
                  disableDefaultUI: false,
                  zoomControl: true,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: true
                }}
              >
                {/* Custom Markers with OverlayView */}
                {filteredLocations?.map((location) => (
                  <OverlayView
                    key={location.id}
                    position={{ lat: location.lat, lng: location.lng }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <CustomMarker
                      authorName={location.authorName}
                      onClick={() => setSelectedLocation(location)}
                      isSelected={selectedLocation?.id === location.id}
                    />
                  </OverlayView>
                ))}

                {/* New Location Marker (while adding) */}
                {isAddingLocation && newLocation.lat && newLocation.lng && (
                  <OverlayView
                    position={{ lat: newLocation.lat, lng: newLocation.lng }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="transform -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-4 border-white shadow-lg flex items-center justify-center text-white font-bold animate-pulse">
                        +
                      </div>
                    </motion.div>
                  </OverlayView>
                )}

                {/* Custom Info Card */}
                {selectedLocation && (
                  <OverlayView
                    position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <CustomInfoCard
                      location={selectedLocation}
                      onClose={() => setSelectedLocation(null)}
                      onDelete={() => {
                        onDeleteLocation(selectedLocation.id);
                        setSelectedLocation(null);
                      }}
                    />
                  </OverlayView>
                )}
              </GoogleMap>
            </div>

            {/* Add Location Form */}
            {isAddingLocation && newLocation.lat && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-5 bg-gradient-to-br from-light-beige/50 to-warm-cream/50 rounded-3xl"
              >
                <p className="text-sm text-gray-600 mb-3 font-semibold">선택된 위치</p>

                {/* 장소명 */}
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  placeholder="장소 이름을 입력하세요"
                  className="w-full px-4 py-3 border-0 bg-white rounded-2xl mb-3 focus:outline-none focus:ring-2 focus:ring-indie-pink/50 shadow-sm"
                />

                {/* 추천 이유 */}
                <textarea
                  value={newLocation.description}
                  onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                  placeholder="여기는 어떤곳인가요?"
                  className="w-full px-4 py-3 border-0 bg-white rounded-2xl mb-3 focus:outline-none focus:ring-2 focus:ring-indie-pink/50 shadow-sm resize-none"
                  rows="3"
                />

                {/* Tag Selection */}
                <p className="text-xs text-gray-600 font-medium mb-2">태그 선택 (여러 개 가능)</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {availableTags.map(tag => {
                    const isSelected = newLocation.tags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isSelected
                            ? tag.color + ' ring-2 ring-offset-2 ring-indie-pink'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        #{tag.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddLocationSubmit}
                    disabled={!newLocation.name}
                    className="flex-1 bg-indie-pink text-white py-3 rounded-2xl hover:bg-indie-pink/80 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
                  >
                    추가
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-white text-gray-700 py-3 rounded-2xl hover:bg-gray-100 transition-colors font-semibold shadow-sm"
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
                className="mt-4 w-full bg-gradient-to-r from-indie-pink/80 to-soft-coral/80 text-white font-semibold py-3 rounded-3xl hover:shadow-lg transition-all"
              >
                + 장소 추가하기
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MapSectionWithGoogle;
