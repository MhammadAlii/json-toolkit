import { inputClasses } from "./input-styles";

export function TextInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" className={`${inputClasses} ${className}`} {...props} />;
}
