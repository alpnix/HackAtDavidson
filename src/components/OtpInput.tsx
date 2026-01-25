import * as React from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  containerClassName?: string;
}

const OtpInput = React.forwardRef<React.ElementRef<typeof InputOTP>, OtpInputProps>(
  (
    {
      value,
      onChange,
      onComplete,
      length = 6,
      disabled,
      error,
      className,
      containerClassName,
    },
    ref
  ) => {
    const handleChange = (v: string) => {
      onChange(v);
      if (v.length === length && onComplete) onComplete(v);
    };

    return (
      <InputOTP
        ref={ref}
        maxLength={length}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={cn(className)}
        containerClassName={cn("gap-2 sm:gap-3 justify-center", containerClassName)}
      >
        <InputOTPGroup className={cn("gap-2 sm:gap-3 bg-transparent border-none p-0")}>
          {Array.from({ length }, (_, i) => (
            <InputOTPSlot
              key={i}
              index={i}
              className={cn(
                "h-12 w-11 sm:h-14 sm:w-12 rounded-xl border-2 bg-background text-center text-lg sm:text-xl font-semibold tabular-nums transition-all",
                "!rounded-xl !border-2 !border-solid !border-input",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                error && "!border-destructive ring-2 ring-destructive/20"
              )}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
    );
  }
);

OtpInput.displayName = "OtpInput";

export { OtpInput };
