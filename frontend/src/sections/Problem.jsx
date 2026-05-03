import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Car, Shield } from 'lucide-react';

const problems = [
  {
    icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
    title: "Unpredictable Hazards",
    description: "Indian roads feature unique, unpredictable elements like stray animals, sudden potholes, and impromptu barricades that standard driver assistance systems often miss."
  },
  {
    icon: <Car className="w-8 h-8 text-rose-500" />,
    title: "High Accident Rates",
    description: "Unexpected road anomalies contribute significantly to vehicular damage, traffic congestion, and fatal accidents every year."
  },
  {
    icon: <Shield className="w-8 h-8 text-primary" />,
    title: "Lack of Real-time Alerts",
    description: "Current static mapping systems fail to provide real-time updates regarding newly formed hazards, leaving drivers vulnerable."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const Problem = () => {
  return (
    <section id="problem" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase">The Challenge</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
            Why Indian Roads Need AI
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {problems.map((problem, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="glass-card rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="mb-6 inline-block p-4 rounded-xl bg-surface border border-white/5 shadow-inner">
                {problem.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{problem.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Problem;
