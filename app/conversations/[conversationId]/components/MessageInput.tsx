import { ComponentPropsWithRef, forwardRef } from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";

interface MessageInputProps extends ComponentPropsWithRef<"input"> {
  register: UseFormRegister<FieldValues>;
  id: string;
}

// eslint-disable-next-line react/display-name
const MessageInput = forwardRef<HTMLInputElement, MessageInputProps>(
  ({ id, register, required, ...rest }) => {
    return (
      <div className="relative w-full">
        <input
          id={id}
          autoComplete={id}
          className="text-black font-light py-2 px-4 bg-neutral-100 w-full rounded-full focus:outline-none"
          {...rest}
          {...register(id)}
        />
      </div>
    );
  }
);

export default MessageInput;
