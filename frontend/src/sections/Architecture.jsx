import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Cpu, Cloud, Smartphone, ArrowRight } from 'lucide-react';

const Architecture = () => {
  const steps = [
    { icon: <Camera className="w-8 h-8"/>, title: "Data Capture", desc: "Dashcam / Real-time feed" },
    { icon: <Cpu className="w-8 h-8"/>, title: "Edge Processing", desc: "OpenCV + YOLOv8 Inference" },
    { icon: <Cloud className="w-8 h-8"/>, title: "Data Sync", desc: "Geotagging & Cloud Upload" },
    { icon: <Smartphone className="w-8 h-8"/>, title: "Alerts", desc: "Map UI & Driver Notifications" },
  ];

  return (
    <section id="architecture" className="py-24 bg-surface/50 relative border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase">System Flow</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
            How It Works
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-0 mt-12 relative z-10">
          {/* Animated Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 -z-10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent w-1/2"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            />
          </div>

          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="w-full lg:w-64 glass-card rounded-2xl p-6 text-center transform hover:scale-105 transition-transform bg-background relative"
              >
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-4 border border-white/10 text-white">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </motion.div>

              {idx < steps.length - 1 && (
                <div className="lg:hidden text-primary/50 my-2">
                  <ArrowRight className="w-6 h-6 rotate-90 lg:rotate-0" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Architecture;
