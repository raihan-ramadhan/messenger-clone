"use client";

import cn from "clsx";
import Link from "next/link";

interface DesktopItemProps {
  icon: any;
  href: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const DesktopItem: React.FC<DesktopItemProps> = ({
  href,
  icon: Icon,
  label,
  active,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <li onClick={handleClick}>
      <Link
        href={href}
        className={cn(
          "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold text-gray-500 hover:text-black hover:bg-gray-100",
          active && "bg-gray-100 text-black"
        )}
      >
        <Icon className={"h-6 w-6 shrink-0"} />
        <span className="sr-only">{label}</span>
      </Link>
    </li>
  );
};

export default DesktopItem;
