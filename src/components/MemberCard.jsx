import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import YarnCheckbox from './YarnCheckbox';
import { getBadge, getCompletedCount } from '../utils/badgeUtils';

const MemberCard = ({ member, index, onUpdate, currentUserId, onUploadPhoto, photos = [] }) => {
  const isOwnCard = currentUserId === member.id;
  const [isExpanded, setIsExpanded] = useState(isOwnCard);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [selectedProjectForPhoto, setSelectedProjectForPhoto] = useState(null);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const [justCompletedProject, setJustCompletedProject] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [addingProject, setAddingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const editInputRef = useRef(null);
  const addInputRef = useRef(null);

  // Convert legacy string array to object array with completion status
  const normalizeProjects = (projects) => {
    if (!projects || projects.length === 0) return [];
    if (typeof projects[0] === 'object' && projects[0] !== null && 'title' in projects[0] && 'completed' in projects[0]) {
      return projects.map(p => ({
        title: p.title || '',
        completed: p.title ? (p.completed || false) : false
      }));
    }
    return projects.map(p => ({
      title: typeof p === 'string' ? p : (p?.title || ''),
      completed: p?.completed || false
    }));
  };

  const projects = normalizeProjects(member.projects).filter(p => p.title);
  const completedCount = getCompletedCount(member);
  const totalCount = projects.length;
  const badge = getBadge(completedCount);

  // Focus input when editing
  useEffect(() => {
    if (editingIdx !== null && editInputRef.current) editInputRef.current.focus();
  }, [editingIdx]);
  useEffect(() => {
    if (addingProject && addInputRef.current) addInputRef.current.focus();
  }, [addingProject]);

  const getPhotoForProject = (projectTitle) => {
    return photos.find(
      photo => photo.authorId === member.id && photo.projectTitle === projectTitle
    );
  };

  // Progress dots
  const renderProgress = () => {
    if (totalCount === 0) return <span className="text-xs text-gray-400">작품 없음</span>;
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
          {projects.map((p, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                p.completed
                  ? 'bg-gradient-to-br from-indie-pink to-soft-coral shadow-sm'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-1">
          {completedCount}/{totalCount}
        </span>
      </div>
    );
  };

  const handleProjectToggle = async (idx) => {
    const allProjects = normalizeProjects(member.projects);
    // Find the actual index in the full array (including empty ones)
    const projectsWithTitle = [];
    const actualIndices = [];
    allProjects.forEach((p, i) => {
      if (p.title) {
        projectsWithTitle.push(p);
        actualIndices.push(i);
      }
    });
    const actualIdx = actualIndices[idx];
    if (actualIdx === undefined) return;

    const newProjects = [...allProjects];
    const wasCompleted = newProjects[actualIdx].completed;
    newProjects[actualIdx] = { ...newProjects[actualIdx], completed: !wasCompleted };

    const justCompleted = !wasCompleted;

    const completedTitles = newProjects
      .filter(p => p.completed && p.title)
      .map(p => p.title)
      .join(', ');

    if (onUpdate) {
      onUpdate(member.id, {
        projects: newProjects,
        review: { ...(member.review || {}), completed: completedTitles }
      }).catch(err => console.error('Failed to update project:', err));
    }

    if (justCompleted && isOwnCard && newProjects[actualIdx].title) {
      const hasPhoto = photos.some(
        photo => photo.authorId === member.id && photo.projectTitle === newProjects[actualIdx].title
      );
      if (!hasPhoto) {
        setJustCompletedProject(newProjects[actualIdx]);
        setShowUploadPrompt(true);
      }
    }
  };

  // Inline edit: start
  const startEditing = (idx) => {
    if (!isOwnCard) return;
    setEditingIdx(idx);
    setEditingValue(projects[idx].title);
  };

  // Inline edit: save
  const saveEdit = () => {
    if (editingIdx === null) return;
    const allProjects = normalizeProjects(member.projects);
    const projectsWithTitle = [];
    const actualIndices = [];
    allProjects.forEach((p, i) => {
      if (p.title) {
        projectsWithTitle.push(p);
        actualIndices.push(i);
      }
    });
    const actualIdx = actualIndices[editingIdx];
    if (actualIdx === undefined) return;

    const newProjects = [...allProjects];
    const trimmed = editingValue.trim();

    if (trimmed === '') {
      // Delete project if empty (but not completed ones)
      if (newProjects[actualIdx].completed) {
        setEditingIdx(null);
        return;
      }
      newProjects.splice(actualIdx, 1);
    } else {
      newProjects[actualIdx] = { ...newProjects[actualIdx], title: trimmed };
    }

    const completedTitles = newProjects
      .filter(p => p.completed && p.title)
      .map(p => p.title)
      .join(', ');

    if (onUpdate) {
      onUpdate(member.id, {
        projects: newProjects,
        review: { ...(member.review || {}), completed: completedTitles }
      });
    }
    setEditingIdx(null);
  };

  // Add new project
  const addProject = () => {
    const trimmed = newProjectTitle.trim();
    if (!trimmed) {
      setAddingProject(false);
      return;
    }
    const allProjects = normalizeProjects(member.projects);
    const newProjects = [...allProjects, { title: trimmed, completed: false }];

    if (onUpdate) {
      onUpdate(member.id, { projects: newProjects });
    }
    setNewProjectTitle('');
    setAddingProject(false);
  };

  // Pastel colors for the left accent
  const accentColors = [
    'from-yellow-300 to-yellow-400',
    'from-pink-300 to-pink-400',
    'from-orange-300 to-orange-400',
    'from-purple-300 to-purple-400',
    'from-blue-300 to-blue-400',
    'from-green-300 to-green-400',
  ];
  const accent = accentColors[index % accentColors.length];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
        className={`bg-white/80 backdrop-blur-sm rounded-2xl card-shadow transition-all break-inside-avoid ${
          isOwnCard ? 'ring-2 ring-indie-pink/30 shadow-lg shadow-indie-pink/10' : ''
        }`}
      >
        {/* Collapsed header - always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/50 transition-colors text-left rounded-2xl"
        >
          {/* Left accent bar */}
          <div className={`w-1 h-10 rounded-full bg-gradient-to-b ${accent} flex-shrink-0`} />

          {/* Badge icon */}
          <span className="text-xl flex-shrink-0">{badge.icon}</span>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800 truncate">{member.name}</h3>
              {isOwnCard && (
                <span className="text-[10px] bg-indie-pink/10 text-indie-pink px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                  나
                </span>
              )}
            </div>
            <div className="mt-1">{renderProgress()}</div>
          </div>

          {/* Expand/collapse arrow */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>

        {/* Expanded content - pushes grid down */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-1 border-t border-gray-100">
                {/* Project list */}
                {projects.length > 0 ? (
                  <ul className="space-y-2 mt-3">
                    {projects.map((project, idx) => {
                      const projectPhoto = getPhotoForProject(project.title);
                      const isEditingThis = editingIdx === idx;

                      return (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="flex items-center gap-2 group"
                        >
                          {isOwnCard ? (
                            // Own card: interactive checkbox + inline edit
                            <>
                              <YarnCheckbox
                                checked={project.completed}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleProjectToggle(idx);
                                }}
                                label=""
                              />
                              {isEditingThis ? (
                                <input
                                  ref={editInputRef}
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  onBlur={saveEdit}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') setEditingIdx(null);
                                  }}
                                  className="flex-1 text-sm bg-indie-pink/5 border border-indie-pink/30 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indie-pink/40"
                                />
                              ) : (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(idx);
                                  }}
                                  className={`flex-1 text-sm cursor-text hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors ${
                                    project.completed
                                      ? 'font-semibold text-indie-pink'
                                      : 'text-gray-700'
                                  }`}
                                >
                                  {project.title}
                                </span>
                              )}
                              {/* Photo thumbnail or upload button */}
                              {project.completed && projectPhoto && (
                                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-indie-pink/30">
                                  <img src={projectPhoto.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                              {project.completed && !projectPhoto && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProjectForPhoto(project);
                                    setShowPhotoUploadModal(true);
                                  }}
                                  className="text-xs text-indie-pink/60 hover:text-indie-pink transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                                  title="사진 올리기"
                                >
                                  📸
                                </button>
                              )}
                            </>
                          ) : (
                            // Other's card: read-only
                            <>
                              <span className="text-base flex-shrink-0">
                                {project.completed ? '🧶' : '○'}
                              </span>
                              <span className={`flex-1 text-sm ${
                                project.completed ? 'font-semibold text-indie-pink' : 'text-gray-700'
                              }`}>
                                {project.title}
                              </span>
                              {project.completed && projectPhoto && (
                                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-indie-pink/30">
                                  <img src={projectPhoto.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                            </>
                          )}
                        </motion.li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic mt-3">아직 등록된 작품이 없습니다</p>
                )}

                {/* Add project (own card only) */}
                {isOwnCard && (
                  <div className="mt-3">
                    {addingProject ? (
                      <div className="flex items-center gap-2">
                        <input
                          ref={addInputRef}
                          value={newProjectTitle}
                          onChange={(e) => setNewProjectTitle(e.target.value)}
                          onBlur={addProject}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addProject();
                            if (e.key === 'Escape') { setAddingProject(false); setNewProjectTitle(''); }
                          }}
                          placeholder="작품 이름 입력..."
                          className="flex-1 text-sm bg-indie-pink/5 border border-indie-pink/30 px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indie-pink/40 placeholder:text-gray-400"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingProject(true)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indie-pink transition-colors mt-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        작품 추가
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Photo upload modal */}
      <AnimatePresence>
        {showPhotoUploadModal && (
          <PhotoUploadModal
            member={member}
            completedProjects={normalizeProjects(member.projects).filter(p => p.completed && p.title).filter(project => !photos.some(photo => photo.authorId === member.id && photo.projectTitle === project.title))}
            selectedProject={selectedProjectForPhoto}
            onClose={() => { setShowPhotoUploadModal(false); setSelectedProjectForPhoto(null); }}
            onSelectProject={setSelectedProjectForPhoto}
            onUploadPhoto={onUploadPhoto}
          />
        )}
      </AnimatePresence>

      {/* Upload prompt toast */}
      <AnimatePresence>
        {showUploadPrompt && justCompletedProject && (
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
              <p className="text-white/90 text-sm mb-4">지금 사진을 올릴까요?</p>
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
                  onClick={() => { setShowUploadPrompt(false); setJustCompletedProject(null); }}
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

// Photo upload modal (kept from original)
const PhotoUploadModal = ({ member, completedProjects, selectedProject, onClose, onSelectProject, onUploadPhoto }) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [yarn, setYarn] = useState('');
  const [pattern, setPattern] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!photoFile || !selectedProject || !onUploadPhoto) return;
    setUploading(true);
    try {
      await onUploadPhoto(photoFile, {
        authorId: member.id,
        authorName: member.name,
        projectTitle: selectedProject.title,
        caption: caption || '',
        yarn: yarn || '',
        pattern: pattern || '',
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 font-gowun">완성작 기록하기 🧶</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {completedProjects.length > 1 && !selectedProject && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">어떤 작품을 기록하시겠어요?</h4>
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
                    <button onClick={() => onSelectProject(null)} className="ml-auto text-xs text-indie-pink hover:underline">변경</button>
                  )}
                </div>
              </div>

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
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                ) : (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="w-full h-64 object-cover rounded-2xl" />
                    <button
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">사용한 실</h4>
                <input type="text" value={yarn} onChange={(e) => setYarn(e.target.value)} placeholder="예: 람스울 울실, 로완 코튼..." className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indie-pink focus:outline-none" />
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">도안</h4>
                <input type="text" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="예: 펫블랑카 레시피북, 자체제작..." className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indie-pink focus:outline-none" />
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">소감</h4>
                <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="이 작품에 대한 소감을 남겨보세요..." className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indie-pink focus:outline-none resize-none" rows={3} />
              </div>

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
                ) : '기록 완료하기'}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MemberCard;
