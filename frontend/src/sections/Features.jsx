import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Sun, CloudRain, BellRing, Database, Smartphone } from 'lucide-react';

const featureList = [
  { icon: <Zap/>, title: "Ultra Low Latency", desc: "Edge-optimized inference runs under 20ms on adequate hardware, enabling instant detection." },
  { icon: <Sun/>, title: "Day/Night Vision", desc: "Robust models trained to detect hazards in poor lighting conditions and severe glare." },
  { icon: <CloudRain/>, title: "All-Weather Reliability", desc: "Performs consistently through rain, fog, and dust – typical challenges on Indian roads." },
  { icon: <BellRing/>, title: "Real-Time Alerts", desc: "Instant acoustic and visual alerts to the driver via mobile app integration." },
  { icon: <Database/>, title: "Dynamic Updating", desc: "Hazards act as data nodes, updating city databases for municipal awareness." },
  { icon: <Smartphone/>, title: "Mobile Integration", desc: "Lightweight companion app acting as an interface dashboard." },
];

const Features = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-primary font-semibold tracking-wide uppercase">Capabilities</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
            Designed for the Real World
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-6 rounded-2xl hover:bg-white/10 transition-colors border border-white/5"
            >
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-lg flex items-center justify-center mb-6">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-gray-400">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
