import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import YarnCheckbox from './YarnCheckbox';

const MemberCard = ({ member, index, onUpdate, currentUserId, onUploadPhoto, photos = [] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingDetail, setIsViewingDetail] = useState(false);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [selectedProjectForPhoto, setSelectedProjectForPhoto] = useState(null);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const [justCompletedProject, setJustCompletedProject] = useState(null);

  // Convert legacy string array to object array with completion status
  const normalizeProjects = (projects) => {
    if (!projects || projects.length === 0) {
      return [{ title: '', completed: false }, { title: '', completed: false }, { title: '', completed: false }, { title: '', completed: false }, { title: '', completed: false }];
    }
    // If it's already an object array with proper structure, return as is
    if (typeof projects[0] === 'object' && projects[0] !== null && 'title' in projects[0] && 'completed' in projects[0]) {
      return projects;
    }
    // Convert string array to object array
    return projects.map(p => ({
      title: typeof p === 'string' ? p : (p?.title || ''),
      completed: p?.completed || false
    }));
  };

  const [editedMember, setEditedMember] = useState({
    name: member.name || '',
    projects: normalizeProjects(member.projects),
    events: member.events || [],
    goal: member.goal || '',
    favoriteYarnColor: member.favoriteYarnColor || ''
  });

  // Check if this is the current user's card
  const isOwnCard = currentUserId === member.id;

  // 완성된 프로젝트 중 사진이 업로드되지 않은 프로젝트 찾기
  const getProjectsWithoutPhotos = () => {
    const completed = normalizeProjects(member.projects).filter(p => p.completed && p.title);
    return completed.filter(project => {
      // 해당 프로젝트 제목과 작성자로 업로드된 사진이 있는지 확인
      const hasPhoto = photos.some(
        photo => photo.authorId === member.id && photo.projectTitle === project.title
      );
      return !hasPhoto;
    });
  };

  // 프로젝트별 사진 정보 가져오기
  const getPhotoForProject = (projectTitle) => {
    return photos.find(
      photo => photo.authorId === member.id && photo.projectTitle === projectTitle
    );
  };

  const projectsWithoutPhotos = getProjectsWithoutPhotos();

  // 이름 길이에 따른 폰트 크기 계산
  const getNameFontSize = (name) => {
    const length = name?.length || 0;
    if (length <= 5) return 'text-xl'; // 짧은 이름
    if (length <= 8) return 'text-lg'; // 중간 이름
    if (length <= 12) return 'text-base'; // 긴 이름
    return 'text-sm'; // 매우 긴 이름
  };

  // 포스트잇 색상 배열 (따뜻한 톤)
  const colors = [
    'bg-yellow-100',
    'bg-pink-100',
    'bg-light-beige',
    'bg-orange-100',
    'bg-purple-100',
    'bg-blue-100',
  ];

  const bgColor = colors[index % colors.length];

  const handleProjectChange = (idx, value) => {
    const newProjects = [...editedMember.projects];
    newProjects[idx] = { ...newProjects[idx], title: value };
    setEditedMember({ ...editedMember, projects: newProjects });
  };

  const handleProjectToggle = async (idx) => {
    // 낙관적 업데이트: 즉시 로컬 상태 변경
    const newProjects = [...normalizeProjects(member.projects)];
    const wasCompleted = newProjects[idx].completed;
    newProjects[idx] = { ...newProjects[idx], completed: !newProjects[idx].completed };

    // 완성 체크를 했을 때 (false → true)
    const justCompleted = !wasCompleted && newProjects[idx].completed;

    // Get completed project titles
    const completedTitles = newProjects
      .filter(p => p.completed && p.title)
      .map(p => p.title)
      .join(', ');

    // 백그라운드에서 Firebase 업데이트 (await 없이 비동기 실행)
    if (onUpdate) {
      // Firebase는 onSnapshot으로 실시간 동기화되므로
      // 업데이트 후 자동으로 모든 클라이언트에 반영됨
      onUpdate(member.id, {
        projects: newProjects,
        review: {
          ...(member.review || {}),
          completed: completedTitles
        }
      }).catch(err => {
        console.error('Failed to update project:', err);
        // 에러 발생 시 사용자에게 알림 (선택적)
      });
    }

    // 완성 체크 시 사진 업로드 제안
    if (justCompleted && isOwnCard && newProjects[idx].title) {
      // 해당 프로젝트에 이미 사진이 있는지 확인
      const hasPhoto = photos.some(
        photo => photo.authorId === member.id && photo.projectTitle === newProjects[idx].title
      );

      if (!hasPhoto) {
        setJustCompletedProject(newProjects[idx]);
        setShowUploadPrompt(true);
      }
    }
  };

  const handleAddProject = () => {
    setEditedMember({
      ...editedMember,
      projects: [...editedMember.projects, { title: '', completed: false }]
    });
  };

  const handleRemoveProject = (idx) => {
    const projectToRemove = editedMember.projects[idx];

    // 완성된 프로젝트는 삭제 불가
    if (projectToRemove.completed) {
      alert('완성된 작품은 삭제할 수 없습니다. 체크를 해제한 후 삭제해주세요.');
      return;
    }

    const newProjects = editedMember.projects.filter((_, i) => i !== idx);

    // review.completed 업데이트
    const completedTitles = newProjects
      .filter(p => p.completed && p.title)
      .map(p => p.title)
      .join(', ');

    setEditedMember({
      ...editedMember,
      projects: newProjects,
      review: {
        ...(editedMember.review || {}),
        completed: completedTitles
      }
    });
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
      projects: normalizeProjects(member.projects),
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
                      value={project.title}
                      onChange={(e) => handleProjectChange(idx, e.target.value)}
                      className="text-sm bg-white/70 backdrop-blur-sm border-0 px-4 py-2.5 flex-1 rounded-xl focus:outline-none focus:ring-2 focus:ring-indie-pink/50 shadow-sm transition-all placeholder:text-gray-400"
                      placeholder={`작품 ${idx + 1}`}
                    />
                    {editedMember.projects.length > 1 && (
                      <button
                        onClick={() => handleRemoveProject(idx)}
                        disabled={project.completed}
                        className={`p-2 rounded-xl transition-colors ${
                          project.completed
                            ? 'bg-gray-200/70 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-300/70 hover:bg-red-400 hover:text-white'
                        }`}
                        title={project.completed ? '완성된 작품은 삭제할 수 없습니다' : '삭제'}
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
        animate={{
          opacity: 1,
          scale: 1,
          rotate: 0,
          y: isOwnCard ? -8 : 0
        }}
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
          isOwnCard
            ? 'ring-4 ring-indie-pink shadow-[0_0_30px_rgba(255,182,193,0.4)] ring-offset-2'
            : ''
        }`}
        style={{ maxHeight: '400px' }}
      >
        {/* 편집 버튼 - 자기 카드에만 표시 */}
        {isOwnCard && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              // 편집 모드 진입 시 최신 member 데이터로 초기화
              setEditedMember({
                name: member.name || '',
                projects: normalizeProjects(member.projects),
                events: member.events || [],
                goal: member.goal || '',
                favoriteYarnColor: member.favoriteYarnColor || ''
              });
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
            <h3 className={`${getNameFontSize(member.name)} font-bold text-gray-800 font-gowun truncate`}>
              {member.name}
            </h3>
            <div className="w-12 h-1 bg-indie-pink rounded-full mt-2"></div>
          </div>

          {/* 올해 뜨고 싶은 작품 */}
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">올해 뜨고 싶은 작품 🧶</h4>
            {normalizeProjects(member.projects).some(p => p.title) && (
              <ul className="space-y-1.5">
                {normalizeProjects(member.projects)?.slice(0, 3).map((project, idx) => {
                  const projectPhoto = getPhotoForProject(project.title);
                  return (
                    project.title && (
                      <motion.li
                        key={idx}
                        className={`text-sm flex items-center gap-2 ${
                          project.completed && !projectPhoto && isOwnCard
                            ? 'cursor-pointer hover:bg-white/50 rounded-lg p-1 -m-1 transition-colors'
                            : ''
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={(e) => {
                          // 자기 카드이고, 완성되었으며, 사진이 없는 프로젝트만 클릭 가능
                          if (project.completed && !projectPhoto && isOwnCard) {
                            e.stopPropagation();
                            setSelectedProjectForPhoto(project);
                            setShowPhotoUploadModal(true);
                          }
                        }}
                      >
                        {/* 그리드 모드: 완성 시 실타래 또는 사진 썸네일 표시 */}
                        {project.completed && (
                          projectPhoto ? (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 12
                              }}
                              className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-indie-pink/30"
                            >
                              <img
                                src={projectPhoto.imageUrl}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            </motion.div>
                          ) : (
                            <motion.span
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 12
                              }}
                              className="text-base flex-shrink-0"
                            >
                              🧶
                            </motion.span>
                          )
                        )}
                        <span className={`line-clamp-1 transition-all flex-1 ${
                          project.completed
                            ? 'font-semibold text-indie-pink'
                            : 'text-gray-700'
                        }`}>
                          {project.title}
                        </span>
                      </motion.li>
                    )
                  );
                })}
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

      {/* 사진 업로드 모달 */}
      <AnimatePresence>
        {showPhotoUploadModal && (
          <PhotoUploadModal
            member={member}
            completedProjects={projectsWithoutPhotos}
            selectedProject={selectedProjectForPhoto}
            onClose={() => {
              setShowPhotoUploadModal(false);
              setSelectedProjectForPhoto(null);
            }}
            onSelectProject={setSelectedProjectForPhoto}
            onUploadPhoto={onUploadPhoto}
          />
        )}
      </AnimatePresence>

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
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 font-gowun truncate pr-2">
                {member.name}님의 카드
              </h2>
              <button
                onClick={() => setIsViewingDetail(false)}
                className="p-2 hover:bg-white/50 rounded-full transition-colors flex-shrink-0"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 올해 뜨고 싶은 작품 */}
            <div className="mb-6">
              <h4 className="text-base font-semibold text-gray-600 mb-3">
                올해 뜨고 싶은 작품 🧶
              </h4>
              {normalizeProjects(member.projects).some(p => p.title) ? (
                <ul className="space-y-2">
                  {normalizeProjects(member.projects)?.map((project, idx) => {
                    const projectPhoto = getPhotoForProject(project.title);
                    return (
                      project.title && (
                        <motion.li
                          key={idx}
                          className={`text-sm text-gray-700 flex items-center gap-2 ${
                            project.completed && !projectPhoto && isOwnCard
                              ? 'cursor-pointer hover:bg-white/50 rounded-lg p-2 -m-2 transition-colors'
                              : ''
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={(e) => {
                            // 자기 카드이고, 완성되었으며, 사진이 없는 프로젝트만 클릭 가능
                            if (project.completed && !projectPhoto && isOwnCard) {
                              e.stopPropagation();
                              setSelectedProjectForPhoto(project);
                              setShowPhotoUploadModal(true);
                              setIsViewingDetail(false);
                            }
                          }}
                          title={
                            project.completed && !projectPhoto && isOwnCard
                              ? '클릭하여 사진 업로드'
                              : ''
                          }
                        >
                          {isOwnCard ? (
                            /* 본인 카드: 클릭 가능한 체크박스 */
                            <div className="flex items-center gap-2 w-full">
                              <YarnCheckbox
                                checked={project.completed}
                                onChange={() => handleProjectToggle(idx)}
                                label={project.title}
                              />
                              {/* 완성되었고 사진이 있으면 썸네일 표시 */}
                              {project.completed && projectPhoto && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 12
                                  }}
                                  className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-indie-pink/30 ml-auto"
                                    >
                                  <img
                                    src={projectPhoto.imageUrl}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                  />
                                </motion.div>
                              )}
                            </div>
                          ) : (
                            /* 다른 사람 카드: 읽기 전용, 체크 상태만 표시 */
                            <>
                              <motion.span
                                className="text-base"
                                animate={{
                                  scale: project.completed ? [1, 1.2, 1] : 1,
                                  rotate: project.completed ? [0, -10, 10, 0] : 0
                                }}
                                transition={{
                                  duration: 0.5,
                                  type: "spring",
                                  stiffness: 300
                                }}
                              >
                                {project.completed ? '🧶' : '○'}
                              </motion.span>
                              <span className={project.completed ? 'font-semibold text-indie-pink' : ''}>
                                {project.title}
                              </span>
                              {/* 완성되었고 사진이 있으면 썸네일 표시 */}
                              {project.completed && projectPhoto && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 12
                                  }}
                                  className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-indie-pink/30 ml-auto"
                                    >
                                  <img
                                    src={projectPhoto.imageUrl}
                                    alt={project.title}
                                    className="w-full h-full object-cover"
                                  />
                                </motion.div>
                              )}
                            </>
                          )}
                        </motion.li>
                      )
                    );
                  })}
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
                  // 편집 모드 진입 시 최신 member 데이터로 초기화
                  setEditedMember({
                    name: member.name || '',
                    projects: normalizeProjects(member.projects),
                    events: member.events || [],
                    goal: member.goal || '',
                    favoriteYarnColor: member.favoriteYarnColor || ''
                  });
                  setIsViewingDetail(false);
                  setIsEditing(true);
                }}
                className="w-full mt-6 bg-indie-pink text-white py-3 rounded-xl hover:bg-indie-pink/80 transition-colors font-semibold"
              >
                편집하기
              </button>
            )}
          </motion.div>

          {/* 사진 업로드 제안 토스트 (상세 모달 안에서) */}
          <AnimatePresence>
            {showUploadPrompt && justCompletedProject && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[60] w-[90%] max-w-md"
              >
                <div className="bg-gradient-to-r from-indie-pink to-soft-coral p-6 rounded-3xl shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">🎉</span>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">완성 축하해요!</h3>
                      <p className="text-white/90 text-sm">"{justCompletedProject.title}"</p>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm mb-4">
                    지금 사진을 올릴까요?
                  </p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowUploadPrompt(false);
                        setSelectedProjectForPhoto(justCompletedProject);
                        setShowPhotoUploadModal(true);
                        setIsViewingDetail(false);
                      }}
                      className="flex-1 bg-white text-indie-pink font-semibold py-3 px-4 rounded-full hover:bg-white/90 transition-all"
                    >
                      지금 올리기 📸
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowUploadPrompt(false);
                        setJustCompletedProject(null);
                      }}
                      className="flex-1 bg-white/20 text-white font-medium py-3 px-4 rounded-full hover:bg-white/30 transition-all"
                    >
                      나중에
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 사진 업로드 제안 토스트 (그리드 카드에서) */}
      <AnimatePresence>
        {showUploadPrompt && justCompletedProject && !isViewingDetail && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-gradient-to-r from-indie-pink to-soft-coral p-6 rounded-3xl shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎉</span>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">완성 축하해요!</h3>
                  <p className="text-white/90 text-sm">"{justCompletedProject.title}"</p>
                </div>
              </div>
              <p className="text-white/90 text-sm mb-4">
                지금 사진을 올릴까요?
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowUploadPrompt(false);
                    setSelectedProjectForPhoto(justCompletedProject);
                    setShowPhotoUploadModal(true);
                  }}
                  className="flex-1 bg-white text-indie-pink font-semibold py-3 px-4 rounded-full hover:bg-white/90 transition-all"
                >
                  지금 올리기 📸
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowUploadPrompt(false);
                    setJustCompletedProject(null);
                  }}
                  className="flex-1 bg-white/20 text-white font-medium py-3 px-4 rounded-full hover:bg-white/30 transition-all"
                >
                  나중에
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// 사진 업로드 모달 컴포넌트
const PhotoUploadModal = ({ member, completedProjects, selectedProject, onClose, onSelectProject, onUploadPhoto }) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!photoFile || !selectedProject || !onUploadPhoto) return;

    setUploading(true);
    try {
      // Upload photo to Firebase Storage and Firestore
      await onUploadPhoto(photoFile, {
        authorId: member.id,
        authorName: member.name,
        projectTitle: selectedProject.title,
        caption: caption || '',
        date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
        tags: ['완성작']
      });

      alert('사진이 갤러리에 업로드되었습니다! 🎉');
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
    }
  };

  // 모바일 감지
  const isMobile = window.innerWidth < 768;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-end md:items-center justify-center z-50 p-0 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
        animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
        exit={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full md:max-w-lg md:rounded-3xl ${
          isMobile ? 'rounded-t-3xl max-h-[85vh]' : 'max-h-[90vh]'
        } overflow-y-auto`}
      >
        <div className="p-6 md:p-8">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 font-gowun">
              완성작 기록하기 🧶
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 작품 선택 (완성된 작품이 여러 개일 때) */}
          {completedProjects.length > 1 && !selectedProject && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                어떤 작품을 기록하시겠어요?
              </h4>
              <div className="space-y-2">
                {completedProjects.map((project, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectProject(project)}
                    className="w-full p-4 bg-gradient-to-r from-indie-pink/10 to-soft-coral/10 hover:from-indie-pink/20 hover:to-soft-coral/20 rounded-2xl text-left transition-all border-2 border-transparent hover:border-indie-pink/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🧶</span>
                      <span className="font-semibold text-gray-800">{project.title}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* 선택된 작품 표시 */}
          {selectedProject && (
            <>
              <div className="mb-6 p-4 bg-gradient-to-r from-indie-pink/10 to-soft-coral/10 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧶</span>
                  <div>
                    <p className="text-xs text-gray-600">선택된 작품</p>
                    <p className="font-semibold text-gray-800">{selectedProject.title}</p>
                  </div>
                  {completedProjects.length > 1 && (
                    <button
                      onClick={() => onSelectProject(null)}
                      className="ml-auto text-xs text-indie-pink hover:underline"
                    >
                      변경
                    </button>
                  )}
                </div>
              </div>

              {/* 사진 업로드 */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">사진 업로드</h4>

                {!photoPreview ? (
                  <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl hover:border-indie-pink transition-colors cursor-pointer">
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                      <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="text-sm">사진을 선택하거나 드래그하세요</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-2xl"
                    />
                    <button
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* 설명 */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">한줄 소감 (선택)</h4>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="이 작품에 대한 소감을 남겨보세요..."
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:border-indie-pink focus:outline-none resize-none"
                  rows={3}
                />
              </div>

              {/* 업로드 버튼 */}
              <motion.button
                whileHover={{ scale: photoFile ? 1.02 : 1 }}
                whileTap={{ scale: photoFile ? 0.98 : 1 }}
                onClick={handleUpload}
                disabled={!photoFile || uploading}
                className={`w-full py-4 rounded-full font-semibold text-white transition-all ${
                  photoFile && !uploading
                    ? 'bg-gradient-to-r from-indie-pink to-soft-coral hover:shadow-lg'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    업로드 중...
                  </span>
                ) : (
                  '기록 완료하기'
                )}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MemberCard;
