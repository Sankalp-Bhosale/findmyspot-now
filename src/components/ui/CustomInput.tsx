
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./Input";

export interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={props.id || props.name} className="block text-xs font-medium text-parking-gray uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-parking-gray">
              {icon}
            </div>
          )}
          <Input
            className={cn(
              icon ? "pl-10" : "",
              error ? "border-parking-error" : "",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-parking-error">{error}</p>}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

export { CustomInput };
