"use client";

import axios from "axios";
import Image from "next/image";
import { User } from "@prisma/client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FieldValues, useForm, SubmitHandler } from "react-hook-form";

import Modal from "../Modal";
import Button from "../Button";
import Input from "../inputs/Input";
import UploadModal from "../UploadModal";

interface SettingsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentUser: User;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  onClose,
  isOpen,
}) => {
  const { status } = useSession();
  const router = useRouter();

  const [isOpenUpload, setIsOpenUpload] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [link, setLink] = useState<string>("");
  const [imageSrc, setImageSrc] = useState<string | null>(currentUser?.image);

  const {
    handleSubmit,
    setValue,
    register,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: currentUser?.name,
      image: null,
    },
  });

  const image = watch("image");
  const isError = useMemo(() => Object.keys(errors).length !== 0, [errors]);

  const handleReset = useCallback(
    (time?: number) => {
      URL.revokeObjectURL(imageSrc!);
      function reset() {
        setValue("image", null, { shouldValidate: true });
        setImageSrc(currentUser?.image);
        setLink("");
      }

      time ? setTimeout(() => reset(), time) : reset();
    },
    [currentUser?.image, imageSrc, setValue]
  );

  const handleClose = useCallback(() => {
    if (!isLoading) {
      handleReset(350);
      onClose();
    }
  }, [handleReset, onClose, isLoading]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (status !== "authenticated") return;
    try {
      setIsLoading(true);

      const { name, image } = data;

      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "wif9z1i9");

      const opt = { headers: { "Content-Type": "multipart/form-data" } };
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

      if (image && name !== currentUser?.name) {
        // update image and name
        const response = await axios.post(cloudinaryUrl, formData, opt);
        const imageUrl: string = response.data.secure_url;
        await axios.post("/api/settings", { name, image: imageUrl });
      } else if (image) {
        // just update image
        const response = await axios.post(cloudinaryUrl, formData, opt);
        const imageUrl: string = response.data.secure_url;
        await axios.post("/api/settings", { image: imageUrl });
      } else if (currentUser?.name !== name) {
        // just update name
        await axios.post("/api/settings", { name });
      }

      handleClose();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong!");
      console.error(error, "ERROR_SETTINGS_MODAL");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => {
      URL.revokeObjectURL(imageSrc!);
    };
  }, [imageSrc]);

  return (
    <>
      <UploadModal
        image={image}
        isOpen={isOpenUpload}
        imageSrc={imageSrc}
        register={register}
        setValue={setValue}
        link={link}
        setLink={setLink}
        setImageSrc={setImageSrc}
        handleReset={handleReset}
        setIsOpenUpload={setIsOpenUpload}
      />
      <Modal onClose={handleClose} isOpen={isOpen}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div className="border-b border-gray-900/10 pb-12">
              <h2 className="text-base font-semibold leading-7 text-gray-900">
                Profile 1
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Edit your public information.
              </p>
              <div className="mt-10 flex flex-col gap-y-8">
                <Input
                  disabled={isLoading}
                  label="Name"
                  id="name"
                  errors={errors}
                  required
                  register={register}
                />
                <div>
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Photo
                  </label>
                  <div className="m-2 flex items-center gap-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden relative">
                      <Image
                        fill
                        alt="Avatar"
                        className="object-cover w-full h-full object-center"
                        src={
                          imageSrc ||
                          currentUser?.image ||
                          "/images/placeholder.jpg"
                        }
                      />
                    </div>
                    <Button
                      onClick={() => setIsOpenUpload(true)}
                      disabled={isLoading}
                      secondary
                      type="button"
                    >
                      Change
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between gap-x-6">
              {isError && (
                <div className="text-xs text-red-400">*Something Wrong</div>
              )}
              <div className="flex-1 justify-end w-full gap-x-6 flex">
                <Button
                  type="button"
                  disabled={isLoading}
                  secondary
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button disabled={isLoading} type="submit">
                  Save
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default SettingsModal;
