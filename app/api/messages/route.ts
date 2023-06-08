import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "../../libs/prismadb";
import { NextResponse } from "next/server";
import { pusherServer } from "@/app/libs/pusher";

export async function POST(request: Request) {
  try {
    const currentUSer = await getCurrentUser();
    const body = await request.json();
    const { message, image, conversationId } = body;

    if (!currentUSer?.id || !currentUSer?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const newMessage = await prisma.message.create({
      data: {
        body: message,
        image: image,
        conversation: {
          connect: { id: conversationId },
        },
        sender: {
          connect: { id: currentUSer.id },
        },
        seen: {
          connect: { id: currentUSer.id },
        },
      },
      include: { seen: true, sender: true },
    });

    const updatedConversation = await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: {
            id: newMessage.id,
          },
        },
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true,
          },
        },
      },
    });

    await pusherServer.trigger(conversationId, "messages:new", newMessage);

    const lastMessages =
      updatedConversation.messages[updatedConversation.messages.length - 1];

    updatedConversation.users.map((user) => {
      pusherServer.trigger(user.email!, "conversation:update", {
        id: conversationId,
        messages: [lastMessages],
      });
    });

    return NextResponse.json(newMessage);
  } catch (error: any) {
    console.error(error, "ERROR_MESSAGE");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
