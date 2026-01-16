/**
 * 이미지를 리사이징하고 압축하는 유틸리티 함수
 * @param {File} file - 원본 이미지 파일
 * @param {number} maxWidth - 최대 너비 (기본값: 1200px)
 * @param {number} maxHeight - 최대 높이 (기본값: 1200px)
 * @param {number} quality - JPEG 품질 (0-1, 기본값: 0.85)
 * @returns {Promise<File>} - 리사이징된 이미지 파일
 */
export const resizeImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    // 이미지가 아닌 경우 원본 반환
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // 원본 크기
        let width = img.width;
        let height = img.height;

        // 리사이징이 필요한지 확인
        if (width <= maxWidth && height <= maxHeight) {
          // 리사이징 불필요, 원본 반환
          resolve(file);
          return;
        }

        // 비율 유지하면서 크기 계산
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }

        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        // Canvas에 이미지 그리기
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Canvas를 Blob으로 변환
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지 변환 실패'));
              return;
            }

            // Blob을 File로 변환
            const resizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            console.log(`이미지 리사이징 완료: ${(file.size / 1024).toFixed(2)}KB → ${(resizedFile.size / 1024).toFixed(2)}KB`);
            resolve(resizedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('이미지 로드 실패'));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'));
    };

    reader.readAsDataURL(file);
  });
};