"use client";
import Image from 'next/image';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
  userNumber?: number | null;
}

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="flex items-center justify-between w-full">
      {/* User Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || user.username || "User"}
            width={40}
            height={40}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/20 object-cover"
          />
        ) : (
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl">
            {(user.name || user.username || "U").charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate max-w-[150px] sm:max-w-xs">
            Hi, {user.name || user.username}! 👋
          </h1>
        </div>
      </div>
      
      {/* User Number Badge */}
      {user.userNumber && (
        <div className="bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full w-8 h-8 flex items-center justify-center text-white text-xs font-bold">
          #{user.userNumber}
        </div>
      )}
    </header>
  );
}