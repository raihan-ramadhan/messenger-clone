"use client";

import axios from "axios";
import { HiPaperAirplane, HiPhoto, HiTrash } from "react-icons/hi2";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import cn from "clsx";

import useConversation from "@/app/hooks/useConversation";
import MessageInput from "./MessageInput";
import UploadModal from "@/app/components/UploadModal";
import { useCallback, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

const Form = () => {
  const { status } = useSession();
  const { conversationId } = useConversation();
  const [isOpenUpload, setIsOpenUpload] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [link, setLink] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      message: "",
      image: null,
    },
  });

  const image = watch("image");

  const handleReset = useCallback(
    (time?: number) => {
      URL.revokeObjectURL(imageSrc!);
      function reset() {
        setValue("image", null, { shouldValidate: true });
        setValue("message", "", { shouldValidate: true });
        setImageSrc(null);
      }

      time ? setTimeout(() => reset(), time) : reset();
    },
    [imageSrc, setValue]
  );

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { message, image } = data;
    if (status !== "authenticated" || (!message && !image)) return;
    try {
      setIsLoading(true);
      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", "wif9z1i9");

        const opt = { headers: { "Content-Type": "multipart/form-data" } };
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

        const response = await axios.post(cloudinaryUrl, formData, opt);
        const imageUrl: string = response.data.secure_url;
        axios.post("/api/messages", {
          message,
          image: imageUrl,
          conversationId: conversationId,
        });
      } else if (message) {
        axios.post("/api/messages", {
          message,
          conversationId: conversationId,
        });
      }
      setLink("");
      handleReset();
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error, "ERROR_SETTINGS_MODAL");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <UploadModal
        link={link}
        setLink={setLink}
        image={image}
        isOpen={isOpenUpload}
        imageSrc={imageSrc}
        register={register}
        setValue={setValue}
        setImageSrc={setImageSrc}
        handleReset={handleReset}
        setIsOpenUpload={setIsOpenUpload}
        className="bg-gray-500 bg-opacity-75 transition-opacity"
      />
      {imageSrc && (
        <div
          className={cn(
            "bg-gray-200",
            isLoading && "opacity-70 animate-pulse pointer-events-none"
          )}
        >
          <div className="w-fit relative p-2">
            <Image
              alt="Preview"
              src={imageSrc || "/images/placeholder.jpg"}
              height={150}
              width={150}
              className="relative h-full w-auto max-h-[150px]"
            />
            <button
              className="p-2 absolute top-2 right-2 cursor-pointer  bg-white/20 hover:bg-white/50 transition-colors text-red-400 hover:text-red-500"
              type="button"
              onClick={() => handleReset()}
            >
              <HiTrash size={20} className="pointer-events-none" />
            </button>
          </div>
        </div>
      )}

      <div className="py-4 px-4 bg-white border-t flex items-center gap-2 lg:gap-4 w-full ">
        <button
          onClick={() => setIsOpenUpload(true)}
          disabled={isLoading}
          type="button"
          className="disabled:opacity-75"
        >
          <HiPhoto size={30} className="text-sky-500 cursor-pointer" />
        </button>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-center gap-2 lg:gap-4 w-full"
        >
          <MessageInput
            placeholder="Write a message"
            register={register}
            disabled={isLoading}
            id="message"
          />
          <button
            type="submit"
            className={cn(
              "rounded-full p-2 bg-sky-500 cursor-pointer  transition disabled:opacity-75",
              !isLoading && "hover:bg-sky-600"
            )}
            disabled={isLoading}
          >
            <HiPaperAirplane size={18} className="text-white" />
          </button>
        </form>
      </div>
    </>
  );
};

export default Form;
