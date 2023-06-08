import getCurrentUser from "@/app/actions/getCurrentUser";
import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    const body = await request.json();

    const { name, image } = body;

    if (!currentUser?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let updatedUser;

    if (image && name !== currentUser?.name) {
      // update image and name
      updatedUser = await prisma.user.update({
        where: { id: currentUser.id },
        data: { image, name },
      });
    } else if (image) {
      // just update image
      updatedUser = await prisma.user.update({
        where: { id: currentUser.id },
        data: { image },
      });
    } else {
      // just update name
      updatedUser = await prisma.user.update({
        where: { id: currentUser.id },
        data: { name },
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error(error, "ERROR_SETTINGS");
    return new NextResponse("Internal Error", { status: 500 });
  }
}
