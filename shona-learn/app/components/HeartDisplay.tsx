import { FaHeart } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function HeartDisplay({ hearts }: { hearts: number }) {
  return (
    <div className="flex items-center space-x-1 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-2 rounded-full shadow-soft border border-red-200">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: i * 0.1,
            type: "spring",
            stiffness: 200
          }}
          whileHover={{ 
            scale: 1.2,
            transition: { duration: 0.2 }
          }}
        >
          <FaHeart
            data-testid="heart"
            className={`text-xl ${i < hearts ? 'text-red-500' : 'text-gray-300'}`}
          />
        </motion.div>
      ))}
      <span className="ml-2 text-sm font-semibold text-gray-600">
        {hearts}/5
      </span>
    </div>
  )
} 