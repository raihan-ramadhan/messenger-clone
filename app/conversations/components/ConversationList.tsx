"use client";
import cn from "clsx";
import { find } from "lodash";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MdOutlineGroupAdd } from "react-icons/md";
import { useEffect, useMemo, useState } from "react";
import { Suspense } from "react";

import useConversation from "@/app/hooks/useConversation";
import ConversationBox from "./ConversationBox";
import GroupChatModal from "./GroupChatModal";
import { pusherClient } from "@/app/libs/pusher";
import { FullConversationType } from "@/app/types";

interface ConversationListProps {
  initialItems: FullConversationType[];
  users: User[];
}

const ConversationList: React.FC<ConversationListProps> = ({
  initialItems,
  users,
}) => {
  const session = useSession();
  const [items, setItems] = useState<FullConversationType[]>(initialItems);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const router = useRouter();

  const { conversationId, isOpen } = useConversation();

  const pusherKey = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

  useEffect(() => {
    if (!pusherKey) return;

    pusherClient.subscribe(pusherKey);

    const newHandler = (conversation: FullConversationType) => {
      setItems((prevItems) => {
        return find(prevItems, { id: conversation.id })
          ? prevItems
          : [conversation, ...prevItems];
      });
    };

    const updateHandler = (conversation: FullConversationType) => {
      setItems((prevItems) =>
        prevItems.map((current) => {
          return current.id == conversation.id
            ? { ...current, messages: conversation.messages }
            : current;
        })
      );
    };

    const removeHandler = (conversation: FullConversationType) => {
      setItems((prevItems) => [
        ...prevItems.filter((conv) => conv.id !== conversation.id),
      ]);

      if (conversationId === conversation.id) router.push("/conversations");
    };

    pusherClient.bind("conversation:new", newHandler);
    pusherClient.bind("conversation:update", updateHandler);
    pusherClient.bind("conversation:remove", removeHandler);

    return () => {
      pusherClient.unsubscribe(pusherKey);
      pusherClient.unbind("conversation:new", newHandler);
      pusherClient.unbind("conversation:update", updateHandler);
      pusherClient.unbind("conversation:remove", removeHandler);
    };
  }, [pusherKey, conversationId, router]);

  return (
    <>
      <GroupChatModal
        users={users}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200",
          isOpen ? "hidden" : "block w-full left-0"
        )}
      >
        <div className="px-5">
          <div className="flex justify-between mb-4 pt-4">
            <div className="text-2xl font-bold text-neutral-800">Messages</div>
            <div
              className="rounded-full p-2 bg-gray-100 text-gray-600 cursor-pointer hover:opacity-75 transition"
              onClick={() => setIsModalOpen(true)}
            >
              <MdOutlineGroupAdd size={20} />
            </div>
          </div>
          {items.map((item) => (
            <Suspense
              key={item.id}
              fallback={<p>Loading ConversationBox...</p>}
            >
              <ConversationBox
                data={item}
                selected={conversationId === item.id}
              />
            </Suspense>
          ))}
        </div>
      </aside>
    </>
  );
};

export default ConversationList;
