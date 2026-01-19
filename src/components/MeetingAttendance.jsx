import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useMeetings } from '../hooks/useMeetings';
import { useMembers } from '../hooks/useMembers';
import { useUser } from '../contexts/UserContext';
import { isAdmin } from '../utils/adminUtils';

const MeetingAttendance = () => {
  const { meetings, loading, addMeeting, deleteMeeting, toggleAttendance } = useMeetings();
  const { members } = useMembers();
  const { currentUserId } = useUser();
  const [showAddModal, setShowAddModal] = useState(false);

  const isUserAdmin = isAdmin(members, currentUserId);

  // 오늘 또는 미래의 모임만 필터링
  const upcomingMeetings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 00:00:00으로 설정

    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      meetingDate.setHours(0, 0, 0, 0);
      return meetingDate >= today; // 오늘 포함, 미래 모임만
    });
  }, [meetings]);

  const handleToggle = async (meetingId, type) => {
    if (!currentUserId) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      await toggleAttendance(meetingId, currentUserId, type);
    } catch (error) {
      console.error('출석 체크 오류:', error);
      alert('출석 체크에 실패했습니다');
    }
  };

  const handleDelete = async (meetingId) => {
    if (!confirm('이 모임을 삭제하시겠습니까?')) return;

    try {
      await deleteMeeting(meetingId);
    } catch (error) {
      console.error('모임 삭제 오류:', error);
      alert('모임 삭제에 실패했습니다');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indie-pink"></div>
      </div>
    );
  }

  return (
    <>
      {/* 관리자 전용: 모임 추가 버튼 */}
      {isUserAdmin && (
        <div className="mb-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-indie-pink to-soft-coral text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 모임 만들기
          </motion.button>
        </div>
      )}

      {/* 모임 목록 (오늘 이후만 표시) */}
      {upcomingMeetings.length === 0 ? (
        <div className="text-center py-12 bg-white/50 rounded-3xl">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-gray-500 mb-2">예정된 모임이 없습니다</p>
          {isUserAdmin && (
            <p className="text-sm text-gray-400">새 모임을 만들어보세요!</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingMeetings.map((meeting, index) => {
            const isAttending = meeting.attendees?.includes(currentUserId);
            const isNotAttending = meeting.notAttending?.includes(currentUserId);

            return (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 card-shadow hover:shadow-xl transition-shadow relative"
              >
                {/* 관리자 전용: 삭제 버튼 */}
                {isUserAdmin && (
                  <button
                    onClick={() => handleDelete(meeting.id)}
                    className="absolute top-4 right-4 p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors group"
                    title="모임 삭제"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}

                {/* 날짜 및 시간 */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📅</span>
                    <p className="text-sm text-gray-600 font-medium">
                      {formatDate(meeting.date)}
                    </p>
                  </div>
                  {meeting.time && (
                    <div className="flex items-center gap-2 mb-2 ml-8">
                      <span className="text-lg">🕐</span>
                      <p className="text-sm text-gray-600">
                        {meeting.time}
                      </p>
                    </div>
                  )}
                  {meeting.title && (
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {meeting.title}
                    </h3>
                  )}
                  {meeting.location && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">📍</span>
                      <p className="text-sm text-gray-600">
                        {meeting.location}
                      </p>
                    </div>
                  )}
                </div>

                {/* 참석/불참 버튼 */}
                <div className="flex gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggle(meeting.id, 'attend')}
                    disabled={!currentUserId}
                    className={`
                      flex-1 py-3 px-4 rounded-2xl font-semibold text-sm
                      transition-all duration-300 ease-out
                      ${isAttending
                        ? 'bg-gradient-to-r from-indie-pink to-soft-coral text-white shadow-lg shadow-indie-pink/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                      ${!currentUserId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {isAttending ? '✓ 참석' : '참석'}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleToggle(meeting.id, 'notAttend')}
                    disabled={!currentUserId}
                    className={`
                      flex-1 py-3 px-4 rounded-2xl font-semibold text-sm
                      transition-all duration-300 ease-out
                      ${isNotAttending
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-400/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                      ${!currentUserId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {isNotAttending ? '✗ 불참' : '불참'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 모임 추가 모달 */}
      <AnimatePresence>
        {showAddModal && (
          <AddMeetingModal
            onClose={() => setShowAddModal(false)}
            onAdd={addMeeting}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// 모임 추가 모달 컴포넌트
const AddMeetingModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '',
    title: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.date) {
      alert('날짜를 선택해주세요');
      return;
    }

    setIsSubmitting(true);

    try {
      await onAdd({
        date: formData.date,
        time: formData.time,
        title: formData.title || '실몽실 모임',
        location: formData.location,
        attendees: [],
        notAttending: []
      });
      onClose();
    } catch (error) {
      console.error('모임 추가 오류:', error);
      alert('모임 추가에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800 font-gowun">새 모임 만들기</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 날짜 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              날짜 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink transition-colors"
              required
            />
          </div>

          {/* 시간 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              시간 (선택)
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink transition-colors"
            />
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              모임 이름 (선택)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="예: 실몽실 모임"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink transition-colors"
            />
          </div>

          {/* 장소 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              장소 (선택)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="예: 홍대 카페"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink transition-colors"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-indie-pink to-soft-coral text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '추가 중...' : '모임 추가'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default MeetingAttendance;
