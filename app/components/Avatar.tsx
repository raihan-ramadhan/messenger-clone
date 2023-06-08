"use client";
import Image from "next/image";
import { User } from "@prisma/client";

import useActiveList from "../hooks/useActiveList";

interface Avatarprops {
  user?: User;
}

const Avatar: React.FC<Avatarprops> = ({ user }) => {
  const { members } = useActiveList();

  const isActive = members.indexOf(user?.email!) !== -1;

  return (
    <figure className="relative h-9 w-9 md:h-11 md:w-11">
      <div className="relative inline-block rounded-full overflow-hidden h-full w-full">
        <Image
          alt="image"
          src={user?.image || "/images/placeholder.jpg"}
          fill
          className="object-cover"
        />
      </div>

      {isActive && user?.email && (
        <span className="absolute block rounded-full bg-green-500 ring-2 ring-white top-0 right-0 h-2 w-2 md:w-3 md:h-3" />
      )}
    </figure>
  );
};

export default Avatar;
