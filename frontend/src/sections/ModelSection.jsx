import React from 'react';
import { motion } from 'framer-motion';
import { Box, Target, Zap, Server } from 'lucide-react';

const ModelSection = () => {
  const stats = [
    { label: "Model Used", value: "YOLOv8s", icon: <Box className="w-5 h-5"/> },
    { label: "Mean Average Precision", value: "94.2%", icon: <Target className="w-5 h-5"/> },
    { label: "Inference Speed", value: "12ms", icon: <Zap className="w-5 h-5"/> },
    { label: "Platform", value: "Roboflow", icon: <Server className="w-5 h-5"/> },
  ];

  return (
    <section id="model" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-primary font-semibold tracking-wide uppercase mb-2">The Brain</h2>
            <h3 className="text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl mb-6">
              Powered by Advanced Computer Vision
            </h3>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              We leverage Ultralytics YOLOv8 for rapid, accurate, and real-time object detection perfectly tuned for edge devices. Hosted and managed seamlessly on <span className="text-white font-semibold">Roboflow</span>.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="glass-card p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-gray-400 mb-1 text-sm">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>

            <a 
              href="https://app.roboflow.com/brij-u4fbf/dynamic-road-hazard-detection-v8uha/models" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-secondary hover:bg-secondary/80 shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all"
            >
              👉 Explore Model on Roboflow
            </a>
          </motion.div>

          {/* Abstract Model Visual representation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[400px] w-full rounded-2xl border border-white/10 bg-surface/50 overflow-hidden flex items-center justify-center group"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]"></div>
            
            {/* Mock Neural Network / Graph effect */}
            <div className="relative z-10 grid grid-cols-3 gap-8">
              {[...Array(9)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ 
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3, 
                    delay: i * 0.2 
                  }}
                  className="w-12 h-12 rounded-lg border border-primary/40 bg-primary/10 flex items-center justify-center backdrop-blur-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                </motion.div>
              ))}
            </div>
            
            <div className="absolute flex justify-between w-full px-8 pointer-events-none">
                <div className="h-px bg-white/10 w-full absolute top-1/2 left-0"></div>
                <div className="w-px bg-white/10 h-full absolute left-1/3 top-0"></div>
                <div className="w-px bg-white/10 h-full absolute right-1/3 top-0"></div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ModelSection;
