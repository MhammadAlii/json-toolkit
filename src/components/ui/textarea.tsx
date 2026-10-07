import { inputClasses } from "./input-styles";

export function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${inputClasses} resize-y py-2.5 leading-5 ${className}`} {...props} />;
}
