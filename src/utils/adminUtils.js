// 관리자 권한 유틸리티

/**
 * 현재 사용자가 관리자인지 확인
 * @param {Array} members - 전체 멤버 배열
 * @param {string} userId - 확인할 사용자 ID
 * @returns {boolean} 관리자 여부
 */
export const isAdmin = (members, userId) => {
  if (!userId || !members || members.length === 0) return false;

  const user = members.find(m => m.id === userId);
  return user?.role === 'admin';
};

/**
 * 관리자 전용 기능 접근 가능 여부 확인
 * @param {Array} members - 전체 멤버 배열
 * @param {string} userId - 확인할 사용자 ID
 * @returns {boolean} 접근 가능 여부
 */
export const canAccessAdminFeatures = (members, userId) => {
  return isAdmin(members, userId);
};

/**
 * 현재 사용자가 특정 리소스를 수정/삭제할 권한이 있는지 확인
 * @param {Array} members - 전체 멤버 배열
 * @param {string} userId - 확인할 사용자 ID
 * @param {string} resourceOwnerId - 리소스 소유자 ID (optional)
 * @returns {boolean} 수정/삭제 가능 여부
 */
export const canModifyResource = (members, userId, resourceOwnerId = null) => {
  // 관리자는 모든 리소스 수정 가능
  if (isAdmin(members, userId)) return true;

  // 본인 리소스는 수정 가능
  if (resourceOwnerId && userId === resourceOwnerId) return true;

  return false;
};

/**
 * 전체 관리자 목록 가져오기
 * @param {Array} members - 전체 멤버 배열
 * @returns {Array} 관리자 멤버 배열
 */
export const getAdmins = (members) => {
  if (!members || members.length === 0) return [];
  return members.filter(m => m.role === 'admin');
};
