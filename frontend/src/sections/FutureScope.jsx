import React from 'react';
import { motion } from 'framer-motion';
import { Map, GitBranch, ShieldCheck } from 'lucide-react';

const FutureScope = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-primary font-semibold tracking-wide uppercase mb-2">Roadmap</h2>
        <h3 className="text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl mb-16">
          Future Scope & Integration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-surface border border-white/10 flex items-center justify-center mb-6">
              <Map className="w-8 h-8 text-secondary" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-white">Dynamic Map API</h4>
            <p className="text-gray-400">Integration with Google Maps or Mapbox to create live hazard overlays that update universally for all connected users.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-surface border border-white/10 flex items-center justify-center mb-6">
              <GitBranch className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-white">City Municipal Dashboards</h4>
            <p className="text-gray-400">Direct data pipelines to municipal authorities indicating areas that need urgent repair or animal control intervention.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-full bg-surface border border-white/10 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-accent" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-white">ADAS Integration</h4>
            <p className="text-gray-400">Directly interfacing with vehicle CAN buses to trigger automatic braking or steering assistance in extreme hazard scenarios.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FutureScope;
