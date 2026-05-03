import React from 'react';
import { Github, Linkedin, Mail, ShieldAlert } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-12">
          
          <div className="text-center md:text-left max-w-sm">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <ShieldAlert className="text-primary w-6 h-6" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                RoadAI
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Making Indian roads safer through advanced Computer Vision and Edge AI technologies.
            </p>
          </div>

          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-background border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-background border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-background border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-white">
              <Mail className="w-5 h-5" />
            </a>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} Dynamic Road Hazard Detection.</p>
          <p>Built with React & Ultralytics YOLOv8</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
