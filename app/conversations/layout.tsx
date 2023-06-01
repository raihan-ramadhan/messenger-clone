import Sidebar from "../components/sidebar/Sidebar";
import getUsers from "../actions/getUsers";
import getConversations from "../actions/getConversation";
import ConversationList from "./components/ConversationList";

const LayoutUsers = async ({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> => {
  const conversation = await getConversations();
  const users = await getUsers();
  return (
    //@ts-expect-error Server Component
    <Sidebar>
      <ConversationList users={users} initialItems={conversation} />
      <div className="h-full">{children}</div>
    </Sidebar>
  );
};

export default LayoutUsers;
