import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from './components/Header';
import MemberCard from './components/MemberCard';
import MeetingAttendance from './components/MeetingAttendance';
import AdminMeetingStats from './components/AdminMeetingStats';
import MapSection from './components/MapSection';
import MapSectionWithGoogle from './components/MapSectionWithGoogle';
import ArchiveGallery from './components/ArchiveGallery';
import UserSelectionModal from './components/UserSelectionModal';
import MobileTabBar from './components/MobileTabBar';
import QuickNav from './components/QuickNav';
import { useMembers } from './hooks/useMembers';
import { useLocations } from './hooks/useLocations';
import { usePhotos } from './hooks/usePhotos';
import { useUser } from './contexts/UserContext';

function App() {
  // Firebase hooks
  const { members, loading: membersLoading, updateMember } = useMembers();
  const { locations, addLocation, deleteLocation, updateLocation } = useLocations();
  const { photos, uploading, uploadPhoto, deletePhoto, updatePhoto } = usePhotos();

  // User context
  const { currentUserId, selectUser, isLoading: userLoading } = useUser();

  // Mobile tab state
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('silmongsil_active_tab') || 'plans';
  });

  // Check if Google Maps API key is available
  const hasGoogleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Show user selection modal if no user is selected and members are loaded
  const showUserSelection = !userLoading && !currentUserId && !membersLoading && members.length > 0;

  // Sort members: current user first, then others
  const sortedMembers = [...members].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-8 pb-24 md:pb-8">
        {/* Members Grid Section */}
        <motion.section
          data-section="plans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 font-gowun">
              2026 뜨개계획 🎨
            </h2>
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
              {sortedMembers.map((member, index) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  onUpdate={updateMember}
                  currentUserId={currentUserId}
                  onUploadPhoto={uploadPhoto}
                  photos={photos}
                />
              ))}
            </div>
          )}
        </motion.section>

        {/* Meeting Attendance Section */}
        <motion.section
          data-section="attendance"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 font-gowun">
              모임 출석체크 ✓
            </h2>
            <p className="text-sm text-gray-600">오늘의 모임에 참석했나요?</p>
          </div>
          <MeetingAttendance />

          {/* 관리자 통계 (관리자만 보임) */}
          <div className="mt-8">
            <AdminMeetingStats />
          </div>
        </motion.section>

        {/* Map Section */}
        <motion.section
          data-section="location"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 font-gowun">
              같이가쟈
            </h2>

          </div>
          {/* Use Google Maps if API key is available, otherwise use mock map */}
          {hasGoogleMapsKey ? (
            <MapSectionWithGoogle
              locations={locations}
              onAddLocation={addLocation}
              onDeleteLocation={deleteLocation}
              onUpdateLocation={updateLocation}
              currentUserId={currentUserId}
              members={members}
            />
          ) : (
            <MapSection />
          )}
        </motion.section>
      </main>

      {/* Archive Gallery - Full Width */}
      <div data-section="gallery">
        <ArchiveGallery
        photos={photos}
        uploading={uploading}
        onUploadPhoto={uploadPhoto}
        onDeletePhoto={deletePhoto}
        onUpdatePhoto={updatePhoto}
        currentUserId={currentUserId}
        members={members}
      />
      </div>

      {/* Footer */}
      <footer className="bg-light-beige py-8 text-center">
        <p className="text-gray-600 text-sm">
          실몽실 뜨개모임 © 2026 All rights reserved.
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

      {/* Mobile Tab Bar */}
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Desktop Quick Navigation */}
      <QuickNav />
    </div>
  );
}

export default App;
