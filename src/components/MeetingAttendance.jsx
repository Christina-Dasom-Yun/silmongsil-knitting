import { motion } from 'framer-motion';
import { useMeetings } from '../hooks/useMeetings';
import { useUser } from '../contexts/UserContext';

const MeetingAttendance = () => {
  const { meetings, loading, toggleAttendance } = useMeetings();
  const { currentUserId } = useUser();

  const handleToggle = async (meetingId) => {
    if (!currentUserId) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      await toggleAttendance(meetingId, currentUserId);
    } catch (error) {
      console.error('출석 체크 오류:', error);
      alert('출석 체크에 실패했습니다');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indie-pink"></div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">📅</div>
        <p className="text-gray-500">아직 등록된 모임이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {meetings.map((meeting, index) => {
        const isAttending = meeting.attendees?.includes(currentUserId);

        return (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 card-shadow hover:shadow-xl transition-shadow"
          >
            {/* 날짜 및 제목 */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📅</span>
                <p className="text-sm text-gray-600 font-medium">
                  {formatDate(meeting.date)}
                </p>
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {meeting.title}
              </h3>
            </div>

            {/* 출석 버튼 */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggle(meeting.id)}
              disabled={!currentUserId}
              className={`
                w-full py-4 px-6 rounded-2xl font-semibold text-base
                transition-all duration-300 ease-out
                ${isAttending
                  ? 'bg-gradient-to-r from-indie-pink to-soft-coral text-white shadow-lg shadow-indie-pink/30'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
                ${!currentUserId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {isAttending ? '✓ 참석 완료' : '참석 체크'}
            </motion.button>

            {/* 참석자 수 (숨김 처리 - 관리자용 데이터만 유지) */}
            {/* <div className="mt-3 text-center text-xs text-gray-400">
              {meeting.attendees?.length || 0}명 참석
            </div> */}
          </motion.div>
        );
      })}
    </div>
  );
};

export default MeetingAttendance;
