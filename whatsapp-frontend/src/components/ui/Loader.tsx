import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const Loader = ({ message = "Cargando...", showTips = true }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [dots, setDots] = useState("");

  const tips = [
    "Preparando tu contenido...",
    "Casi listo...",
    "Últimos detalles...",
    "¡Ya casi terminamos!",
  ];

  // Rotar tips cada 2 segundos
  useEffect(() => {
    if (!showTips) return;

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 2000);

    return () => clearInterval(tipInterval);
  }, [showTips, tips.length]);

  // Animación de puntos para el texto principal
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-purple-50"
    >
      {/* Spinner principal */}
      <motion.div
        className="relative mb-8"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Anillo exterior */}
        <motion.div
          className="w-16 h-16 border-4 border-purple-200 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Anillo giratorio con gradiente */}
        <motion.div
          className="absolute inset-0 w-16 h-16 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 270deg, #3b82f6 360deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Centro con pulso */}
        <motion.div
          className="absolute inset-3 bg-white rounded-full shadow-sm flex items-center justify-center"
          animate={{
            scale: [0.8, 1, 0.8],
            boxShadow: [
              "0 4px 20px rgba(59, 130, 246, 0.15)",
              "0 8px 40px rgba(59, 130, 246, 0.25)",
              "0 4px 20px rgba(59, 130, 246, 0.15)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
        </motion.div>
      </motion.div>

      {/* Texto principal con animación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          {message}
          {dots}
        </h2>

        {showTips && (
          <motion.p
            key={currentTip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-gray-600 text-sm"
          >
            {tips[currentTip]}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Loader;
