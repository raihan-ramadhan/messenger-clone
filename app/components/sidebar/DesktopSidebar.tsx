"use client";

import { User } from "@prisma/client";
import { useState } from "react";

import Avatar from "../Avatar";
import useRoutes from "@/app/hooks/useRoutes";
import DesktopItem from "./DesktopItem";
import SettingsModal from "./SettingsModal";

interface DesktopSidebarProps {
  currentUser: User;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentUser }) => {
  const routes = useRoutes();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <SettingsModal
        currentUser={currentUser}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-20 xl:px-6 lg:overflow-y-auto lg:bg-white lg:border-r-[1px] lg:pb-4 lg:flex lg:flex-col justify-between">
        <nav className="mt-4 flex flex-col items-center justify-between flex-1">
          <ul role="list" className="flex flex-col items-center space-y-1">
            {routes.map(({ href, icon, label, active, onClick }) => (
              <DesktopItem
                key={label}
                href={href}
                icon={icon}
                label={label}
                active={active}
                onClick={onClick}
              />
            ))}
          </ul>
          <button
            onClick={() => setIsOpen(true)}
            className="cursor-pointer hover:opacity-75 transition"
          >
            <span className="sr-only">profile</span>
            <Avatar user={currentUser} />
          </button>
        </nav>
      </div>
    </>
  );
};

export default DesktopSidebar;
