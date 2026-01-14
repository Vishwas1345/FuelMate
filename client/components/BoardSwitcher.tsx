import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Building2, 
  User, 
  ChevronDown
} from 'lucide-react';

const BoardSwitcher = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const boards = [
    {
        name: 'Customer Board',
        path: '/customer',
        icon: <User className="h-4 w-4" />
    },
    {
      name: 'Station Board',
      path: '/station',
      icon: <Building2 className="h-4 w-4" />
    },
    
  ];

  const getCurrentBoard = () => {
    const currentPath = location.pathname;
    return boards.find(board => currentPath.startsWith(board.path)) || boards[0];
  };

  const currentBoard = getCurrentBoard();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-10 px-4 bg-slate-900 border-slate-800 text-white hover:bg-slate-800"
        >
          <div className="flex items-center gap-2">
            {currentBoard.icon}
            <span>{currentBoard.name}</span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-[200px] bg-slate-900 border-slate-800"
      >
        {boards.map((board) => (
          <DropdownMenuItem
            key={board.path}
            onClick={() => navigate(board.path)}
            className={`flex items-center gap-2 cursor-pointer ${
              currentBoard.path === board.path 
                ? 'bg-slate-800 text-white' 
                : 'text-gray-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {board.icon}
            <span>{board.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BoardSwitcher; 