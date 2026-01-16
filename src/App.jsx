import { motion } from 'framer-motion';
import Header from './components/Header';
import MemberCard from './components/MemberCard';
import MeetingCounter from './components/MeetingCounter';
import MapSection from './components/MapSection';
import MapSectionWithGoogle from './components/MapSectionWithGoogle';
import ArchiveGallery from './components/ArchiveGallery';
import UserSelectionModal from './components/UserSelectionModal';
import { useMembers } from './hooks/useMembers';
import { useLocations } from './hooks/useLocations';
import { usePhotos } from './hooks/usePhotos';
import { useUser } from './contexts/UserContext';

function App() {
  // Firebase hooks
  const { members, loading: membersLoading, updateMember } = useMembers();
  const { locations, addLocation, deleteLocation } = useLocations();
  const { photos, uploading, uploadPhoto, deletePhoto } = usePhotos();

  // User context
  const { currentUserId, selectUser, isLoading: userLoading } = useUser();

  // Check if Google Maps API key is available
  const hasGoogleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Show user selection modal if no user is selected and members are loaded
  const showUserSelection = !userLoading && !currentUserId && !membersLoading && members.length > 0;

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        {/* Members Grid Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 font-gowun">
              우리의 2026 뜨개 계획 🎨
            </h2>
            <p className="text-gray-600">
              {membersLoading ? '로딩 중...' : `${members.length}명의 멤버가 함께하는 뜨개 여정`}
            </p>
          </div>

          {/* Canvas-style grid with slight randomization */}
          {membersLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">멤버 정보를 불러오는 중...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">아직 등록된 멤버가 없습니다.</p>
              <p className="text-sm text-gray-400">
                Firebase Console에서 멤버를 추가해주세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {members.map((member, index) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  onUpdate={updateMember}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* Meeting Counter and Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <MeetingCounter />

          {/* Use Google Maps if API key is available, otherwise use mock map */}
          {hasGoogleMapsKey ? (
            <MapSectionWithGoogle
              locations={locations}
              onAddLocation={addLocation}
              onDeleteLocation={deleteLocation}
            />
          ) : (
            <MapSection />
          )}
        </div>
      </main>

      {/* Archive Gallery - Full Width */}
      <ArchiveGallery
        photos={photos}
        uploading={uploading}
        onUploadPhoto={uploadPhoto}
        onDeletePhoto={deletePhoto}
      />

      {/* Footer */}
      <footer className="bg-light-beige py-8 text-center">
        <p className="text-gray-600 text-sm">
          실몽실 뜨개모임 2026 - 함께 만드는 따뜻한 이야기
        </p>
        <p className="text-xs text-gray-400 mt-2">
          {!hasGoogleMapsKey && '* Google Maps API 키를 설정하면 실제 지도를 사용할 수 있습니다'}
        </p>
      </footer>

      {/* User Selection Modal */}
      {showUserSelection && (
        <UserSelectionModal
          members={members}
          onSelectUser={selectUser}
        />
      )}
    </div>
  );
}

export default App;
