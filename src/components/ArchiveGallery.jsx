import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { resizeImage } from '../utils/imageUtils';

const ArchiveGallery = ({ photos, uploading, onUploadPhoto, onDeletePhoto }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ title: '', author: '', file: null });
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewPhoto({ ...newPhoto, file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (newPhoto.title && newPhoto.author && newPhoto.file) {
      setIsUploading(true);
      try {
        // 이미지 리사이징 (최대 1200x1200, 품질 85%)
        console.log('원본 이미지 크기:', (newPhoto.file.size / 1024).toFixed(2), 'KB');
        const resizedFile = await resizeImage(newPhoto.file, 1200, 1200, 0.85);
        console.log('리사이징된 이미지 크기:', (resizedFile.size / 1024).toFixed(2), 'KB');

        await onUploadPhoto(resizedFile, {
          title: newPhoto.title,
          author: newPhoto.author,
          date: new Date().toISOString().split('T')[0].replace(/-/g, '.')
        });
        setNewPhoto({ title: '', author: '', file: null });
        setPreviewUrl(null);
        setIsUploading(false);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('사진 업로드에 실패했습니다. 다시 시도해주세요.');
        setIsUploading(false);
      }
    }
  };

  const handleCancel = () => {
    setNewPhoto({ title: '', author: '', file: null });
    setPreviewUrl(null);
    setIsUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="w-full py-12 px-6 md:px-12 bg-gradient-to-b from-warm-cream to-light-beige"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 font-gowun">
            작품 아카이브 📸
          </h2>
          <p className="text-gray-600">우리가 함께 만든 소중한 작품들</p>
        </div>

        {/* Polaroid Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 30, rotate: -3 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{
                scale: 1.05,
                rotate: index % 2 === 0 ? 3 : -3,
                zIndex: 10
              }}
              className="group"
            >
              {/* Polaroid Container */}
              <div className="bg-white p-4 pb-16 rounded-xl polaroid-shadow transform transition-all hover:shadow-2xl relative">
                {/* Delete Button */}
                {onDeletePhoto && (
                  <button
                    onClick={() => onDeletePhoto(photo.id, photo.storagePath)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Photo */}
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <img
                    src={photo.imageUrl || photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Caption Area */}
                <div className="text-center">
                  <h4 className="font-semibold text-gray-800 mb-1">{photo.title}</h4>
                  <p className="text-sm text-gray-500">{photo.author}</p>
                  <p className="text-xs text-gray-400 mt-1">{photo.date}</p>
                </div>

                {/* Decorative Tape */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-yellow-100/50 rotate-0 rounded-sm opacity-70"></div>
              </div>
            </motion.div>
          ))}

          {/* Add Photo Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: (photos?.length || 0) * 0.1,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            className="bg-white p-4 pb-16 rounded-xl polaroid-shadow"
          >
            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-gradient-to-br from-indie-pink/20 to-light-beige rounded-lg flex items-center justify-center mb-4 cursor-pointer hover:bg-indie-pink/30 transition-colors"
              >
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <p className="text-gray-500 font-medium">사진 추가</p>
                </div>
              </div>
            ) : (
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {previewUrl ? (
              <div className="text-center space-y-3">
                <input
                  type="text"
                  value={newPhoto.title}
                  onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  placeholder="작품 제목"
                  className="w-full px-4 py-2.5 text-sm border-0 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indie-pink/50 focus:bg-white shadow-sm transition-all placeholder:text-gray-400"
                />
                <input
                  type="text"
                  value={newPhoto.author}
                  onChange={(e) => setNewPhoto({ ...newPhoto, author: e.target.value })}
                  placeholder="작성자"
                  className="w-full px-4 py-2.5 text-sm border-0 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indie-pink/50 focus:bg-white shadow-sm transition-all placeholder:text-gray-400"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUploadSubmit}
                    disabled={isUploading || uploading}
                    className="flex-1 bg-indie-pink text-white py-1 text-sm rounded hover:bg-indie-pink/80 transition-colors disabled:bg-gray-300"
                  >
                    {isUploading || uploading ? '업로드 중...' : '업로드'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-300 text-gray-700 py-1 text-sm rounded hover:bg-gray-400 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h4 className="font-semibold text-gray-600">새 작품 등록</h4>
                <p className="text-sm text-gray-400 mt-1">클릭하여 사진 선택</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ArchiveGallery;
