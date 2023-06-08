"use client";

import axios from "axios";
import { toast } from "react-hot-toast";
import { Dialog } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { FiAlertTriangle } from "react-icons/fi";
import { useCallback, useState } from "react";

import Modal from "@/app/components/Modal";
import Button from "@/app/components/Button";
import useConversation from "@/app/hooks/useConversation";

interface ConfirmModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ onClose, isOpen }) => {
  const router = useRouter();
  const { conversationId } = useConversation();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onDelete = useCallback(() => {
    setIsLoading(true);

    axios
      .delete(`/api/conversations/${conversationId}`)
      .then(() => {
        router.push("/conversations");
        onClose();
        router.refresh();
      })
      .catch(() => toast.error("Something went wrong"))
      .finally(() => setIsLoading(false));
  }, [conversationId, router, onClose]);

  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <FiAlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Delete Conversation
          </Dialog.Title>
          <div className="mt-2">
            <p>
              Are you sure tou want delete this conversation? this action cannot
              be undone
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-2">
        <Button disabled={isLoading} danger onClick={onDelete}>
          Delete
        </Button>
        <Button disabled={isLoading} secondary onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
