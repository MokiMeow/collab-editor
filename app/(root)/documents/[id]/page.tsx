import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { clerkClient } from "@clerk/nextjs"; // Updated usage

const Document = async ({ params: { id } }: SearchParamProps) => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/sign-in');

  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  if (!room) redirect('/');

  const userIds = Object.keys(room.usersAccesses || {});
  const users = await getClerkUsers({ userIds });

  const usersData = users
    .filter((user: User) => user?.email)  // Ensure user has a valid email
    .map((user: User) => {
      const email = user.email;
      const userAccess = email && room.usersAccesses ? room.usersAccesses[email] : null;
      const userType = userAccess ? (userAccess.includes('room:write') ? 'editor' : 'viewer') : 'viewer';
      return {
        ...user,
        userType,
      };
    });

  const currentUserType = room.usersAccesses?.[clerkUser.emailAddresses[0].emailAddress]?.includes('room:write') ? 'editor' : 'viewer';

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  );
};

export default Document;
