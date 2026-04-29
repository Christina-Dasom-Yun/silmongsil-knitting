import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Header from './components/Header';
import MemberCard from './components/MemberCard';
import MeetingAttendance from './components/MeetingAttendance';
import AdminMeetingStats from './components/AdminMeetingStats';
import PlaceList from './components/PlaceList';
import HamtteuCalendar from './components/HamtteuCalendar';
import ArchiveGallery from './components/ArchiveGallery';
import UserSelectionModal from './components/UserSelectionModal';
import TopTabBar from './components/TopTabBar';
import { useMembers } from './hooks/useMembers';
import { useLocations } from './hooks/useLocations';
import { usePhotos } from './hooks/usePhotos';
import { useMemoryPhotos } from './hooks/useMemoryPhotos';
import { useHamtteu } from './hooks/useHamtteu';
import { useUser } from './contexts/UserContext';

function App() {
  // Firebase hooks
  const { members, loading: membersLoading, updateMember } = useMembers();
  const { locations, addLocation, deleteLocation, updateLocation } = useLocations();
  const { photos, uploading, uploadPhoto, deletePhoto, updatePhoto } = usePhotos();
  const { memoryPhotos, uploading: memoryUploading, uploadMemoryPhoto, deleteMemoryPhoto } = useMemoryPhotos();
  const { hamtteus, addHamtteu, updateHamtteu, deleteHamtteu } = useHamtteu();

  // User context
  const { currentUserId, selectUser, isLoading: userLoading } = useUser();

  // Tab state with migration from old tab IDs
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('silmongsil_active_tab');
    const migrationMap = { records: 'plans', meeting: 'attendance' };
    const migrated = migrationMap[saved] || saved;
    const validTabs = ['plans', 'attendance', 'location', 'hamtteu', 'gallery'];
    return validTabs.includes(migrated) ? migrated : 'plans';
  });

  // Show user selection modal if no user is selected and members are loaded
  const showUserSelection = !userLoading && !currentUserId && !membersLoading && members.length > 0;

  // Sort members: current user first, then others
  const sortedMembers = [...members].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return 0;
  });

  // Tab transition animation
  const tabVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'plans':
        return (
          <motion.div
            key="plans"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 font-gowun">
                  2026 뜨케쥴 🎨
                </h2>
              </div>
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
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
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
            </main>
          </motion.div>
        );

      case 'attendance':
        return (
          <motion.div
            key="attendance"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 font-gowun">
                  모임 출석체크 ✓
                </h2>
                <p className="text-sm text-gray-600">오늘의 모임에 참석했나요?</p>
              </div>
              <MeetingAttendance />
              <div className="mt-8">
                <AdminMeetingStats />
              </div>
            </main>
          </motion.div>
        );

      case 'location':
        return (
          <motion.div
            key="location"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <main className="max-w-7xl mx-auto px-6 md:px-12 py-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 font-gowun">
                  같이가쟈
                </h2>
                <p className="text-sm text-gray-600">가고 싶은 곳을 공유하고 ♥ 눌러주세요</p>
              </div>
              <PlaceList
                locations={locations}
                onAddLocation={addLocation}
                onDeleteLocation={deleteLocation}
                onUpdateLocation={updateLocation}
                currentUserId={currentUserId}
                members={members}
              />
            </main>
          </motion.div>
        );

      case 'hamtteu':
        return (
          <motion.div
            key="hamtteu"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <HamtteuCalendar
              hamtteus={hamtteus}
              onAdd={addHamtteu}
              onUpdate={updateHamtteu}
              onDelete={deleteHamtteu}
              currentUserId={currentUserId}
              members={members}
            />
          </motion.div>
        );

      case 'gallery':
        return (
          <motion.div
            key="gallery"
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <ArchiveGallery
              photos={photos}
              uploading={uploading}
              onUploadPhoto={uploadPhoto}
              onDeletePhoto={deletePhoto}
              onUpdatePhoto={updatePhoto}
              memoryPhotos={memoryPhotos}
              memoryUploading={memoryUploading}
              onUploadMemoryPhoto={uploadMemoryPhoto}
              onDeleteMemoryPhoto={deleteMemoryPhoto}
              currentUserId={currentUserId}
              members={members}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Header - scrolls normally */}
      <Header />

      {/* Tab Bar - fixed at top */}
      <div className="sticky top-0 z-30">
        <TopTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {renderTabContent()}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-light-beige py-8 text-center">
        <p className="text-gray-600 text-sm">
          실몽실 뜨개모임 © 2026 All rights reserved.
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
