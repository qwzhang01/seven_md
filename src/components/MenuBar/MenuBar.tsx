import React from 'react';
import { FileMenu } from './FileMenu';
import { EditMenu } from './EditMenu';
import { ViewMenu } from './ViewMenu';
import { HelpMenu } from './HelpMenu';

export const MenuBar: React.FC = () => {
  return (
    <div 
      className="flex items-center h-full"
      role="menubar"
      aria-label="Application menu"
    >
      <FileMenu />
      <EditMenu />
      <ViewMenu />
      <HelpMenu />
    </div>
  );
};
