"use client";

import cn from "clsx";
import Link from "next/link";

interface MobileItemProps {
  icon: any;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const MobileItem: React.FC<MobileItemProps> = ({
  icon: Icon,
  onClick,
  active,
  href,
}) => {
  const handleClick = () => {
    if (onClick) {
      return onClick();
    }
  };

  return (
    <Link
      onClick={handleClick}
      href={href}
      className={cn(
        "group flex gap-x-3 text-sm leading-6 font-semibold w-full justify-center p-4 text-gray-500 hover:text-black hover:bg-gray-100",
        active && "bg-gray-100 text-black"
      )}
    >
      <Icon className={"h-6 w-6 shrink-0"} />
    </Link>
  );
};

export default MobileItem;
