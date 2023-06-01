"use client";

import useRoutes from "@/app/hooks/useRoutes";
import MobileItem from "./MobileItem";
import useConversation from "@/app/hooks/useConversation";

const MobileFooter = () => {
  const routes = useRoutes();
  const { isOpen } = useConversation();

  if (isOpen) return null;

  return (
    <div className="fixed justify-between w-full bottom-0 z-40 flex items-center bg-white border-t-[1px] lg:hidden">
      {routes.map(({ href, icon, label, active, onClick }) => (
        <MobileItem key={href} {...{ href, icon, label, active, onClick }} />
      ))}
    </div>
  );
};

export default MobileFooter;
