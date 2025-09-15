"use client";
import Image from 'next/image';

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  image?: string | null;
}

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="flex items-center justify-between">
      {/* User Profile */}
      <div className="flex items-center space-x-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || user.username || "User"}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full border-2 border-white/20"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
            {(user.name || user.username || "U").charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hi, {user.name || user.username}! 👋
          </h1>
        </div>
      </div>
    </header>
  );
}
