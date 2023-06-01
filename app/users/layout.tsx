import getUsers from "../actions/getUsers";
import Sidebar from "../components/sidebar/Sidebar";
import UserList from "./components/UserList";

const LayoutUsers = async ({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> => {
  const users = await getUsers();

  return (
    //@ts-expect-error Server Component
    <Sidebar>
      <div className="h-full">
        <UserList items={users} />
        {children}
      </div>
    </Sidebar>
  );
};

export default LayoutUsers;
