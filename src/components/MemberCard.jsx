import { motion } from 'framer-motion';
import { useState } from 'react';

const MemberCard = ({ member, index, onUpdate, currentUserId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetail, setIsViewingDetail] = useState(false);
  const [editedMember, setEditedMember] = useState({
    name: member.name || '',
    projects: member.projects || ['', '', '', '', ''],
    events: member.events || [],
    goal: member.goal || '',
    favoriteYarnColor: member.favoriteYarnColor || ''
  });

  // Check if this is the current user's card
  const isOwnCard = currentUserId === member.id;

  // 포스트잇 색상 배열 (따뜻한 톤)
  const colors = [
    'bg-yellow-100',
    'bg-indie-pink/30',
    'bg-light-beige',
    'bg-soft-coral/40',
    'bg-purple-100',
    'bg-blue-100',
  ];

  const bgColor = colors[index % colors.length];

  const handleProjectChange = (idx, value) => {
    const newProjects = [...editedMember.projects];
    newProjects[idx] = value;
    setEditedMember({ ...editedMember, projects: newProjects });
  };

  const handleAddProject = () => {
    setEditedMember({
      ...editedMember,
      projects: [...editedMember.projects, '']
    });
  };

  const handleRemoveProject = (idx) => {
    const newProjects = editedMember.projects.filter((_, i) => i !== idx);
    setEditedMember({ ...editedMember, projects: newProjects });
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(member.id, editedMember);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMember({
      name: member.name || '',
      projects: member.projects || ['', '', '', '', ''],
      events: member.events || [],
      goal: member.goal || '',
      favoriteYarnColor: member.favoriteYarnColor || ''
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <>
        {/* 편집 모달 오버레이 */}
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-0 md:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${bgColor} p-6 md:p-8 md:rounded-3xl card-shadow w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto`}
          >
            {/* 닫기 버튼 (모바일에만 표시) */}
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h2 className="text-xl font-bold text-gray-800 font-gowun">카드 편집</h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 이름 편집 */}
            <div className="mb-4">
              <input
                type="text"
                value={editedMember.name}
                onChange={(e) => setEditedMember({ ...editedMember, name: e.target.value })}
                className="text-xl font-bold bg-white/70 backdrop-blur-sm border-0 px-4 py-3 w-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-indie-pink/50 shadow-sm transition-all placeholder:text-gray-400"
                placeholder="이름"
              />
            </div>

            {/* 작품 편집 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-600">올해 뜨고 싶은 작품 🧶</h4>
                <button
                  onClick={handleAddProject}
                  className="flex items-center gap-1 px-3 py-1 bg-indie-pink/80 hover:bg-indie-pink text-white rounded-full text-xs font-semibold transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  추가
                </button>
              </div>
              <div className="space-y-2">
                {editedMember.projects.map((project, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={project}
                      onChange={(e) => handleProjectChange(idx, e.target.value)}
                      className="text-sm bg-white/70 backdrop-blur-sm border-0 px-4 py-2.5 flex-1 rounded-xl focus:outline-none focus:ring-2 focus:ring-indie-pink/50 shadow-sm transition-all placeholder:text-gray-400"
                      placeholder={`작품 ${idx + 1}`}
                    />
                    {editedMember.projects.length > 1 && (
                      <button
                        onClick={() => handleRemoveProject(idx)}
                        className="p-2 bg-gray-300/70 hover:bg-red-400 hover:text-white rounded-xl transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 좋아하는 실 색 편집 */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">올해 가장 떠보고 싶은 실 색은? 🎨</h4>
              <input
                type="text"
                value={editedMember.favoriteYarnColor}
                onChange={(e) => setEditedMember({ ...editedMember, favoriteYarnColor: e.target.value })}
                className="text-sm bg-white/70 backdrop-blur-sm border-0 px-4 py-2.5 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-indie-pink/50 shadow-sm transition-all placeholder:text-gray-400"
                placeholder="예: 파스텔 핑크, 진한 네이비, 머스타드 옐로우"
              />
            </div>

            {/* 목표 편집 */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">올해의 뜨개 목표 🎯</h4>
              <textarea
                value={editedMember.goal}
                onChange={(e) => setEditedMember({ ...editedMember, goal: e.target.value })}
                className="text-sm bg-white/70 backdrop-blur-sm border-0 px-4 py-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-indie-pink/50 shadow-sm transition-all placeholder:text-gray-400 resize-none"
                rows="3"
                placeholder="목표를 입력하세요"
              />
            </div>            

            {/* 이벤트 편집 */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">열렸으면 좋을것 같은 이벤트 ✨</h4>
              <input
                type="text"
                value={editedMember.events.join(', ')}
                onChange={(e) => setEditedMember({ ...editedMember, events: e.target.value.split(',').map(s => s.trim()) })}
                className="text-sm bg-white/70 backdrop-blur-sm border-0 px-4 py-2.5 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-indie-pink/50 shadow-sm transition-all placeholder:text-gray-400"
                placeholder="쉼표로 구분 (예: 뜨개상영회, 기차뜨개여행)"
              />
            </div>





            {/* 저장/취소 버튼 */}
            <div className="flex gap-3 sticky bottom-0 bg-inherit pt-4 pb-2 -mx-6 px-6 md:mx-0 md:px-0 md:static md:pb-0">
              <button
                onClick={handleSave}
                className="flex-1 bg-indie-pink text-white py-3 md:py-3 rounded-xl hover:bg-indie-pink/80 transition-colors font-semibold shadow-lg"
              >
                저장
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-3 md:py-3 rounded-xl hover:bg-gray-400 transition-colors font-semibold hidden md:block"
              >
                취소
              </button>
            </div>
          </motion.div>
        </div>

        {/* 원래 카드 자리 유지용 플레이스홀더 (데스크톱만) */}
        <div className={`${bgColor} p-6 rounded-3xl card-shadow opacity-50 hidden md:block`}>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
            <div className="w-12 h-1 bg-indie-pink rounded-full mt-2"></div>
          </div>
          <p className="text-sm text-gray-500 text-center py-8">편집 중...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.05,
          type: "spring",
          stiffness: 100
        }}
        whileHover={{
          scale: 1.05,
          rotate: isHovered ? 2 : 0,
          zIndex: 10
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => setIsViewingDetail(true)}
        className={`${bgColor} p-6 rounded-3xl card-shadow transition-all relative cursor-pointer ${
          isOwnCard ? 'ring-2 ring-indie-pink ring-offset-2' : ''
        }`}
        style={{ maxHeight: '400px' }}
      >
        {/* 편집 버튼 - 자기 카드에만 표시 */}
        {isOwnCard && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="absolute top-4 right-4 bg-indie-pink text-white hover:bg-indie-pink/80 p-2 rounded-full transition-colors shadow-lg z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}

        {/* 카드 내용 - 고정 높이로 제한 */}
        <div className="overflow-hidden" style={{ maxHeight: '340px' }}>
          {/* 멤버 이름 */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 font-gowun">{member.name}</h3>
            <div className="w-12 h-1 bg-indie-pink rounded-full mt-2"></div>
          </div>

          {/* 올해 뜨고 싶은 작품 */}
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">올해 뜨고 싶은 작품 🧶</h4>
            {member.projects && member.projects.some(p => p) && (
              <ul className="space-y-1">
                {member.projects?.slice(0, 3).map((project, idx) => (
                  project && (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span className="line-clamp-1">{project}</span>
                    </li>
                  )
                ))}
              </ul>
            )}
          </div>

            {/* 좋아하는 실 색 */}
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">가장 떠보고 싶은 실 색 🎨</h4>
            {member.favoriteYarnColor && (
              <p className="text-sm text-gray-700 line-clamp-1">{member.favoriteYarnColor}</p>
            )}
          </div>
        

          {/* 올해의 목표 */}
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">올해의 목표 🎯</h4>
            {member.goal && (
              <p className="text-sm text-gray-700 italic line-clamp-2">"{member.goal}"</p>
            )}
          </div>


          {/* 참가 희망 이벤트 */}
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">열렸으면 좋을것 같은 이벤트 ✨</h4>
            {member.events && member.events.some(e => e) && (
              <div className="flex flex-wrap gap-2">
                {member.events?.slice(0, 3).map((event, idx) => (
                  event && (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-white/60 rounded-full text-xs text-gray-700"
                    >
                      {event}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>


        </div>

        {/* 확장 아이콘 */}
        <div className="absolute bottom-3 right-3 p-2 bg-white/80 rounded-full shadow-sm">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>
      </motion.div>

      {/* 상세보기 모달 */}
      {isViewingDetail && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setIsViewingDetail(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`${bgColor} p-6 md:p-8 rounded-3xl card-shadow w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
          >
            {/* 닫기 버튼 */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 font-gowun">{member.name}님의 카드</h2>
              <button
                onClick={() => setIsViewingDetail(false)}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 올해 뜨고 싶은 작품 */}
            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-600 mb-3">올해 뜨고 싶은 작품 🧶</h4>
              {member.projects && member.projects.some(p => p) ? (
                <ul className="space-y-2">
                  {member.projects?.map((project, idx) => (
                    project && (
                      <li key={idx} className="text-sm text-gray-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{project}</span>
                      </li>
                    )
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">아직 등록된 작품이 없습니다</p>
              )}
            </div>

                        {/* 좋아하는 실 색 */}
            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-600 mb-3">가장 떠보고 싶은 실 색 🎨</h4>
              {member.favoriteYarnColor ? (
                <p className="text-sm text-gray-700">{member.favoriteYarnColor}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">아직 등록된 색상이 없습니다</p>
              )}
            </div>

            {/* 올해의 목표 */}
            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-600 mb-3">올해의 목표 🎯</h4>
              {member.goal ? (
                <p className="text-sm text-gray-700 italic">"{member.goal}"</p>
              ) : (
                <p className="text-sm text-gray-400 italic">아직 등록된 목표가 없습니다</p>
              )}
            </div>

            {/* 참가 희망 이벤트 */}
            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-600 mb-3">열렸으면 좋을것 같은 이벤트 ✨</h4>
              {member.events && member.events.some(e => e) ? (
                <div className="flex flex-wrap gap-2">
                  {member.events?.map((event, idx) => (
                    event && (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white/60 rounded-full text-sm text-gray-700"
                      >
                        {event}
                      </span>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">아직 등록된 이벤트가 없습니다</p>
              )}
            </div>



            {/* 편집 버튼 - 자기 카드인 경우 */}
            {isOwnCard && (
              <button
                onClick={() => {
                  setIsViewingDetail(false);
                  setIsEditing(true);
                }}
                className="w-full mt-6 bg-indie-pink text-white py-3 rounded-xl hover:bg-indie-pink/80 transition-colors font-semibold"
              >
                편집하기
              </button>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
};

export default MemberCard;
