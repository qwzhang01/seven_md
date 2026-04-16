import React from 'react';
import { Modal } from '../Modal';
import { BookOpen, Github, Heart } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About Seven MD">
      <div className="space-y-4">
        {/* App Logo and Name */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">7</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Seven MD</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Version 0.1.0</p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          A modern Markdown reader built with Tauri, React, and CodeMirror.
          Designed for simplicity and efficiency.
        </p>

        {/* Links */}
        <div className="space-y-2">
          <a
            href="https://github.com/avinzhang/seven-md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Github className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">GitHub Repository</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">View source code and report issues</div>
            </div>
          </a>

          <a
            href="https://github.com/avinzhang/seven-md#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Documentation</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Learn how to use Seven MD</div>
            </div>
          </a>
        </div>

        {/* License */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500" /> by avinzhang
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Licensed under MIT License
          </p>
        </div>
      </div>
    </Modal>
  );
};
