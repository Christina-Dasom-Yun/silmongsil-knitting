import { motion } from 'framer-motion';
import { useState } from 'react';

const MapSection = () => {
  const [locations, setLocations] = useState([
    { id: 1, name: '홍대 수공예품점', top: '30%', left: '20%' },
    { id: 2, name: '이태원 원단가게', top: '50%', left: '60%' },
    { id: 3, name: '강남 카페', top: '70%', left: '40%' },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white p-8 rounded-3xl card-shadow"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 font-gowun">가고 싶은 장소 🗺️</h3>
        <p className="text-sm text-gray-600">함께 방문하고 싶은 곳을 표시해보세요</p>
      </div>

      {/* Mock Map Area */}
      <div className="relative w-full h-96 bg-gradient-to-br from-light-beige to-warm-cream rounded-2xl overflow-hidden">
        {/* Grid Background for Map-like feel */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {[...Array(64)].map((_, i) => (
              <div key={i} className="border border-gray-400"></div>
            ))}
          </div>
        </div>

        {/* Map Placeholder Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg
              className="w-20 h-20 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-sm">Google Maps API 연동 예정</p>
          </div>
        </div>

        {/* Location Markers */}
        {locations.map((location, index) => (
          <motion.div
            key={location.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
            whileHover={{ scale: 1.2, zIndex: 10 }}
            style={{
              position: 'absolute',
              top: location.top,
              left: location.left,
            }}
            className="cursor-pointer"
          >
            {/* Pin Icon */}
            <div className="relative">
              <motion.div
                whileHover={{ y: -5 }}
                className="w-8 h-8 bg-indie-pink rounded-full flex items-center justify-center shadow-lg"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>

              {/* Location Label */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap">
                <div className="bg-white px-3 py-1 rounded-full shadow-md text-xs font-medium text-gray-700">
                  {location.name}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Location Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-6 w-full bg-gradient-to-r from-indie-pink/80 to-soft-coral/80 text-white font-semibold py-3 rounded-2xl hover:shadow-lg transition-all"
      >
        + 장소 추가하기
      </motion.button>
    </motion.div>
  );
};

export default MapSection;
