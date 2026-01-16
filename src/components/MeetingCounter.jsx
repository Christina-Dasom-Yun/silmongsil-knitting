import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useMeetings } from '../hooks/useMeetings';
import { useMembers } from '../hooks/useMembers';

const MeetingCounter = () => {
  const [frequency, setFrequency] = useState(2);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);

  const { meetings, addMeeting, deleteMeeting } = useMeetings();
  const { members } = useMembers();

  // Calculate current month meetings
  const currentMonthMeetings = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      return meetingDate.getMonth() === currentMonth &&
             meetingDate.getFullYear() === currentYear;
    });
  }, [meetings]);

  const toggleAttendee = (memberId) => {
    setSelectedAttendees(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddMeeting = async () => {
    if (selectedAttendees.length === 0) {
      alert('참석자를 선택해주세요!');
      return;
    }

    try {
      await addMeeting({
        date: meetingDate,
        attendees: selectedAttendees
      });
      setSelectedAttendees([]);
      setMeetingDate(new Date().toISOString().split('T')[0]);
      setShowAttendanceModal(false);
    } catch (error) {
      console.error('Error adding meeting:', error);
      alert('모임 기록 추가에 실패했습니다.');
    }
  };

  const handleCancelMeeting = () => {
    setSelectedAttendees([]);
    setMeetingDate(new Date().toISOString().split('T')[0]);
    setShowAttendanceModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-gradient-to-br from-indie-pink/20 to-light-beige p-8 rounded-3xl card-shadow"
    >
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 font-gowun">모임 횟수</h3>
        <p className="text-sm text-gray-600">우리의 만남을 기록해요</p>
      </div>

      {/* 한 달에 N번 선택 */}
      <div className="mb-8">
        <p className="text-center text-gray-700 mb-4 font-medium">한 달에</p>
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4].map((num) => (
            <motion.button
              key={num}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFrequency(num)}
              className={`w-14 h-14 rounded-full font-bold text-lg transition-all ${
                frequency === num
                  ? 'bg-indie-pink text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {num}
            </motion.button>
          ))}
        </div>
        <p className="text-center text-gray-700 mt-4 font-medium">번 만나기</p>
      </div>

      {/* 카운터 */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl">
        <div className="text-center mb-4">
          <p className="text-gray-600 mb-2">이번 달 모임 횟수</p>
          <motion.div
            key={currentMonthMeetings.length}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-bold text-indie-pink"
          >
            {currentMonthMeetings.length}
          </motion.div>
          <p className="text-gray-500 text-sm mt-2">/ 목표 {frequency}번</p>
        </div>

        {/* 모임 기록 버튼 */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAttendanceModal(true)}
          className="w-full bg-indie-pink text-white font-semibold py-3 rounded-2xl hover:bg-indie-pink/80 transition-colors"
        >
          + 모임 기록하기
        </motion.button>

        {/* 통계 보기 버튼 */}
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full mt-3 text-sm text-gray-600 hover:text-indie-pink transition-colors font-medium"
        >
          {showStats ? '통계 숨기기 ▲' : '참석 통계 보기 ▼'}
        </button>
      </div>

      {/* 진행률 바 */}
      <div className="mt-6">
        <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((currentMonthMeetings.length / frequency) * 100, 100)}%` }}
            transition={{ duration: 0.5 }}
            className="bg-indie-pink h-full rounded-full"
          />
        </div>
      </div>

      {/* 참석 통계 */}
      <AnimatePresence>
        {showStats && (
          <AttendanceStats meetings={meetings} members={members} />
        )}
      </AnimatePresence>

      {/* 참석자 선택 모달 */}
      <AnimatePresence>
        {showAttendanceModal && (
          <AttendanceModal
            members={members}
            selectedAttendees={selectedAttendees}
            meetingDate={meetingDate}
            onToggleAttendee={toggleAttendee}
            onDateChange={setMeetingDate}
            onSave={handleAddMeeting}
            onCancel={handleCancelMeeting}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// 참석자 선택 모달 컴포넌트
const AttendanceModal = ({
  members,
  selectedAttendees,
  meetingDate,
  onToggleAttendee,
  onDateChange,
  onSave,
  onCancel
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-4 font-gowun">모임 기록하기</h3>

      {/* 날짜 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          모임 날짜
        </label>
        <input
          type="date"
          value={meetingDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indie-pink"
        />
      </div>

      {/* 참석자 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          참석자 선택 ({selectedAttendees.length}명)
        </label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {members.map((member) => (
            <motion.button
              key={member.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggleAttendee(member.id)}
              className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                selectedAttendees.includes(member.id)
                  ? 'border-indie-pink bg-indie-pink/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">{member.name}</span>
                {selectedAttendees.includes(member.id) && (
                  <svg className="w-5 h-5 text-indie-pink" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 버튼들 */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
        >
          취소
        </button>
        <button
          onClick={onSave}
          className="flex-1 bg-indie-pink text-white py-3 rounded-xl font-semibold hover:bg-indie-pink/80 transition-colors"
        >
          저장
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// 참석 통계 컴포넌트
const AttendanceStats = ({ meetings, members }) => {
  const attendanceStats = useMemo(() => {
    const stats = {};

    // 각 멤버별 참석 횟수 계산
    members.forEach(member => {
      stats[member.id] = {
        name: member.name,
        count: 0
      };
    });

    meetings.forEach(meeting => {
      meeting.attendees?.forEach(attendeeId => {
        if (stats[attendeeId]) {
          stats[attendeeId].count += 1;
        }
      });
    });

    // 참석 횟수로 정렬
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [meetings, members]);

  const maxCount = attendanceStats[0]?.count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-6 bg-white/80 backdrop-blur-sm p-6 rounded-2xl"
    >
      <h4 className="text-lg font-bold text-gray-800 mb-4 font-gowun">연간 참석 통계</h4>

      {attendanceStats.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          아직 기록된 모임이 없습니다.
        </p>
      ) : (
        <div className="space-y-3">
          {attendanceStats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {index === 0 && stat.count > 0 && (
                    <span className="text-lg">🏆</span>
                  )}
                  <span className="font-medium text-gray-800">{stat.name}</span>
                </div>
                <span className="text-sm font-bold text-indie-pink">
                  {stat.count}회
                </span>
              </div>
              <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: maxCount > 0 ? `${(stat.count / maxCount) * 100}%` : '0%' }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-gradient-to-r from-indie-pink to-soft-coral h-full rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MeetingCounter;
