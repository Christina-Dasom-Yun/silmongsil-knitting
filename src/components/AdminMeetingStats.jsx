import { motion } from 'framer-motion';
import { useMeetings } from '../hooks/useMeetings';
import { useMembers } from '../hooks/useMembers';
import { isAdmin } from '../utils/adminUtils';
import { useUser } from '../contexts/UserContext';

const AdminMeetingStats = () => {
  const { meetings, getAllStats } = useMeetings();
  const { members } = useMembers();
  const { currentUserId } = useUser();

  // 관리자 권한 확인
  const isUserAdmin = isAdmin(members, currentUserId);

  if (!isUserAdmin) {
    return null; // 관리자가 아니면 아무것도 표시하지 않음
  }

  const stats = getAllStats();

  // 멤버 ID로 이름 찾기
  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member?.name || '알 수 없음';
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 shadow-xl border-2 border-amber-200"
    >
      {/* 관리자 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">👑</span>
        <div>
          <h3 className="text-xl font-bold text-gray-800">관리자 통계</h3>
          <p className="text-xs text-gray-600">모임 출석 현황 (관리자만 보임)</p>
        </div>
      </div>

      {/* 전체 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-indie-pink">{meetings.length}</p>
          <p className="text-xs text-gray-600 mt-1">총 모임 수</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-soft-coral">
            {stats.reduce((sum, s) => sum + s.totalAttendees, 0)}
          </p>
          <p className="text-xs text-gray-600 mt-1">총 참석 횟수</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-purple-600">
            {stats.length > 0
              ? Math.round(stats.reduce((sum, s) => sum + s.totalAttendees, 0) / stats.length)
              : 0}
          </p>
          <p className="text-xs text-gray-600 mt-1">평균 참석자</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{members.length}</p>
          <p className="text-xs text-gray-600 mt-1">총 멤버 수</p>
        </div>
      </div>

      {/* 모임별 상세 통계 */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-700 text-sm mb-3">모임별 참석 현황</h4>
        {stats.length === 0 ? (
          <div className="bg-white/50 rounded-2xl p-6 text-center">
            <p className="text-gray-500 text-sm">아직 모임 데이터가 없습니다</p>
          </div>
        ) : (
          stats.map((stat, index) => {
            const meeting = meetings.find(m => m.id === stat.id);
            const attendeeNames = meeting?.attendees?.map(id => getMemberName(id)) || [];

            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📅</span>
                      <p className="text-xs text-gray-500">{formatDate(stat.date)}</p>
                    </div>
                    <p className="font-semibold text-gray-800">{stat.title}</p>
                  </div>
                  <div className="bg-indie-pink/10 px-3 py-1 rounded-full">
                    <p className="text-sm font-bold text-indie-pink">
                      {stat.totalAttendees}명
                    </p>
                  </div>
                </div>

                {/* 참석자 목록 */}
                {attendeeNames.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">참석자:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {attendeeNames.map((name, idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-indie-pink/20 to-soft-coral/20 text-gray-700 text-xs px-2.5 py-1 rounded-full"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* 멤버별 참석 현황 */}
      <div className="mt-6 pt-6 border-t-2 border-amber-200">
        <h4 className="font-semibold text-gray-700 text-sm mb-3">멤버별 참석 현황</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {members.map((member) => {
            // 각 멤버의 총 참석 횟수 계산
            const attendanceCount = meetings.filter(meeting =>
              meeting.attendees?.includes(member.id)
            ).length;

            const attendanceRate = meetings.length > 0
              ? Math.round((attendanceCount / meetings.length) * 100)
              : 0;

            return (
              <div
                key={member.id}
                className="bg-white rounded-xl p-3 shadow-sm"
              >
                <p className="font-semibold text-gray-800 text-sm truncate mb-1">
                  {member.name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {attendanceCount}/{meetings.length}회
                  </span>
                  <span className={`text-xs font-bold ${
                    attendanceRate >= 80 ? 'text-green-600' :
                    attendanceRate >= 50 ? 'text-yellow-600' :
                    'text-gray-400'
                  }`}>
                    {attendanceRate}%
                  </span>
                </div>
                {/* 진행률 바 */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      attendanceRate >= 80 ? 'bg-green-500' :
                      attendanceRate >= 50 ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminMeetingStats;
