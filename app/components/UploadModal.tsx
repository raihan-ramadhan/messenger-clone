"use client";

import cn from "clsx";
import axios from "axios";
import Image from "next/image";
import { IoClose } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { MdCloudUpload, MdOutlineError } from "react-icons/md";
import { useDropzone, FileWithPath, FileRejection } from "react-dropzone";
import { FieldValues, UseFormRegister, UseFormSetValue } from "react-hook-form";

import Button from "./Button";

interface UploadModalProps {
  setIsOpenUpload: React.Dispatch<React.SetStateAction<boolean>>;
  setLink: React.Dispatch<React.SetStateAction<string>>;
  handleReset: (time?: number) => void;
  setImageSrc: React.Dispatch<React.SetStateAction<string | null>>;
  className?: string;
  setValue: UseFormSetValue<FieldValues>;
  register: UseFormRegister<FieldValues>;
  imageSrc: string | null;
  isOpen: boolean;
  image: any;
  link: string;
}

const UploadModal: React.FC<UploadModalProps> = ({
  setIsOpenUpload,
  handleReset,
  setImageSrc,
  imageSrc,
  setValue,
  register,
  className,
  setLink,
  isOpen,
  image,
  link,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const onClose = () => {
    if (image) setIsOpenUpload(false);
  };

  const handleResetState = (time?: number) => {
    // Make sure to revoke the data uris to avoid memory leaks, will run every handleResetState get call
    URL.revokeObjectURL(imageSrc!);
    setIsSearch(true);
    setError("");
    setLink("");
    handleReset(time);
  };

  const handleCancel = () => {
    handleResetState(350);
    setIsOpenUpload(false);
    setIsLoading(false);
  };

  const onDrop = (
    acceptedFiles: FileWithPath[],
    rejectedFiles: FileRejection[]
  ) => {
    handleResetState();

    if (rejectedFiles.length > 0) {
      setTimeout(() => setValue("image", null, { shouldValidate: true }));

      const errorMessage = rejectedFiles[0]?.errors?.[0]?.message;
      return setError(errorMessage);
    }

    setValue("image", acceptedFiles[0], { shouldValidate: true });
    setImageSrc(URL.createObjectURL(acceptedFiles[0]));
  };

  const { getRootProps, getInputProps, isFocused, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    disabled: isLoading,
  });

  const handleLink = async () => {
    // Make sure to revoke the data uris to avoid memory leaks, will run every request link
    URL.revokeObjectURL(imageSrc!);
    setError("");
    if (link) {
      setIsSearch(false);
      handleReset();
      try {
        setIsLoading(true);
        new URL(link); // make sure link is valid (start with http / https)

        const response = await axios.post("/api/image", { link });

        const type = response.headers["content-type"];
        const uint8Array = new Uint8Array(response.data.data);
        const blob = new Blob([uint8Array], { type });
        const contentDisposition = response.headers["content-disposition"];
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        let filename = "downloadedFile"; // Default filename if extraction fails
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
        const file = new File([blob], filename, {
          type: blob.type,
        });

        setValue("image", file, {
          shouldValidate: true,
        });
        setImageSrc(URL.createObjectURL(file));
      } catch (error: any) {
        setError(error?.response?.data || error.message || "Something wrong");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => URL.revokeObjectURL(imageSrc!);
  }, [imageSrc]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div
            className={cn(
              "flex flex-col min-h-full items-center justify-center p-4 text-center",
              className
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-300"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg p-10 bg-white text-left shadow-xl transition-all w-full max-w-3xl h-full flex-1 max-h-[610px] sm:my-8 flex-col flex">
                <section className="flex-1 flex flex-col">
                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex-1 flex justify-center items-center focus:outline-none transition-colors duration-200 relative",
                      !isFocused && !error && "dropzoneNoActive",
                      (isFocused || isDragActive) &&
                        !error &&
                        "bg-sky-500/5 dropzoneActive",
                      error && "!bg-red-500/5 dropzoneError"
                    )}
                  >
                    {image && imageSrc && (
                      <Image
                        src={imageSrc || "/images/placeholder.jpg"}
                        fill
                        alt="preview"
                        className="object-contain p-[5px]"
                      />
                    )}
                    <input
                      {...getInputProps({ id: "image" })}
                      {...register("image", { required: false })}
                    />
                    {error.length !== 0 && !isLoading && (
                      <div className="flex flex-col gap-3 justify-center items-center w-full">
                        <MdOutlineError className="text-red-500 w-[100px] h-[70px]" />
                        <span className="font-bold text-2xl">{error}</span>
                      </div>
                    )}
                    {!image && error.length == 0 && !isLoading && (
                      <div className="flex flex-col gap-1 md:gap-3 justify-center items-center w-full">
                        <MdCloudUpload className="text-sky-500 w-[100px] h-[70px]" />
                        <span className="font-bold text-xl md:text-2xl text-center">
                          Drag an image here or <br className="sm:hidden" />
                          <span className="text-sky-500 cursor-pointer">
                            upload a file
                          </span>
                        </span>
                        <span className="text-gray-400 text-xs md:text-sm text-center">
                          (Only images will be accepted)
                        </span>
                      </div>
                    )}
                    {isLoading && (
                      <div className="flex flex-col gap-3 justify-center items-center w-full">
                        <ClipLoader size={40} color="#0284c7" />
                        <span className="font-bold text-2xl">Loading</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col w-full gap-10 mt-[40px] md:mt-[80px]">
                    <div className="flex gap-5 sm:gap-10">
                      <input
                        id="link"
                        autoComplete="link"
                        placeholder="Paste image link"
                        className={cn(
                          "form-input block w-full rounded-md border-0 border-gray-500 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                        )}
                        value={link}
                        onChange={(e) => {
                          setIsSearch(true);
                          setLink(e.target.value);
                        }}
                      />
                      {isSearch ? (
                        <Button
                          type="button"
                          disabled={isLoading}
                          onClick={handleLink}
                        >
                          Search
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => handleResetState()}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    <Button type="button" onClick={onClose} disabled={!image}>
                      Add Picture
                    </Button>
                    <div className="absolute right-0 top-0 pt-3 pr-3  z-10">
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                        onClick={handleCancel}
                      >
                        <span className="sr-only">Close</span>
                        <IoClose className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </section>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default UploadModal;
