"use client";

import Image from "next/image";
import Modal from "@/app/components/Modal";

interface ImageModalProps {
  onClose: () => void;
  isOpen?: boolean;
  src?: string | null;
}

const ImageModal: React.FC<ImageModalProps> = ({ onClose, isOpen, src }) => {
  if (!src) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-80 h-80">
        <Image src={src} alt="Image" fill className="object-cover" />
      </div>
    </Modal>
  );
};

export default ImageModal;
