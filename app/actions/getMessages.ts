import prisma from "../libs/prismadb";

const getMessages = async (conversationId: string) => {
  try {
    const message = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: true,
        seen: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return message;
  } catch (error: any) {
    return [];
  }
};

export default getMessages;
