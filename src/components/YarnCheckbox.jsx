import { motion } from 'framer-motion';

const YarnCheckbox = ({ checked, onChange, label }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />

        {/* 실타래 체크박스 - 통통 튀는 애니메이션 강화 */}
        <motion.div
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.1 }}
          animate={{
            scale: checked ? [1, 1.2, 1] : 1,
          }}
          transition={{
            scale: {
              type: "spring",
              stiffness: 500,
              damping: 15,
              duration: 0.6
            }
          }}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
            checked
              ? 'bg-gradient-to-br from-indie-pink to-soft-coral border-indie-pink shadow-lg shadow-indie-pink/40'
              : 'bg-white border-gray-300 group-hover:border-indie-pink/60 group-hover:shadow-md'
          }`}
        >
          {/* 체크 시 실타래 아이콘 - 회전 애니메이션 추가 */}
          <motion.div
            initial={false}
            animate={{
              scale: checked ? 1 : 0,
              rotate: checked ? [0, -15, 15, -10, 0] : -45,
              opacity: checked ? 1 : 0
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 12,
              duration: 0.7
            }}
            className="text-white text-sm"
          >
            🧶
          </motion.div>
        </motion.div>

        {/* 통통 튀는 효과 - 다중 레이어 */}
        {checked && (
          <>
            <motion.div
              key="ripple1"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-indie-pink/40"
            />
            <motion.div
              key="ripple2"
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-soft-coral/30"
            />
          </>
        )}
      </div>

      {/* 라벨 - 체크 시 부드러운 강조 */}
      <motion.span
        animate={{
          color: checked ? 'rgb(244 63 94)' : 'rgb(75 85 99)',
          fontWeight: checked ? 600 : 400,
        }}
        transition={{ duration: 0.3 }}
        className="text-sm"
      >
        {label}
      </motion.span>
    </label>
  );
};

export default YarnCheckbox;
