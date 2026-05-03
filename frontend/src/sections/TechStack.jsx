import React from 'react';
import { motion } from 'framer-motion';

const techStack = [
  { category: "Computer Vision", items: ["Ultralytics YOLOv8", "OpenCV", "Python"] },
  { category: "Platform & Data", items: ["Roboflow", "Roboflow Inference", "Custom Dataset (15k+ images)"] },
  { category: "Frontend Interface", items: ["React.js", "Tailwind CSS", "Framer Motion", "Vite"] },
  { category: "Edge Hardware (Target)", items: ["NVIDIA Jetson Nano", "Raspberry Pi 4", "Standard Dashcams"] }
];

const TechStack = () => {
  return (
    <section className="py-24 bg-surface/50 border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase">Under the Hood</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
            Technology Stack
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((stack, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-background rounded-xl border border-white/10 hover:border-primary/50 transition-colors"
            >
              <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">{stack.category}</h3>
              <ul className="space-y-3">
                {stack.items.map((item, i) => (
                  <li key={i} className="text-gray-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
