import getCurrentUser from "@/app/actions/getCurrentUser";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { link } = body;

    const currentUser = await getCurrentUser();

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await axios.get(link, {
      responseType: "arraybuffer",
    });

    const imageBuffer = response.data;
    const contentType = response.headers["content-type"] || "";

    if (!contentType.startsWith("image/")) {
      throw new Error("The link you embedded does not point to an image");
    }

    const filename = link.substring(link.lastIndexOf("/") + 1); // Extract the filename from the URL

    return NextResponse.json(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error(error, "ERROR_BLOB");
    if (error.response && error.response.status) {
      // Error from axios response (e.g., failed request)
      const { status, statusText } = error.response;
      return new NextResponse(statusText, { status });
    } else {
      // Other errors (e.g., network issues, invalid URL)
      return new NextResponse(error?.message || "Something wrong", {
        status: 400,
      });
    }
  }
}
