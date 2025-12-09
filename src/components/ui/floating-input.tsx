import * as React from "react"
import { cn } from "@/lib/utils"

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode,
  label: string,
  rightElement?: React.ReactNode
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, icon, label, rightElement, type, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = value !== undefined && value !== null && value !== '';
    const shouldFloat = isFocused || hasValue;

    return (
      <div className="relative mb-4">
        <div
          className="relative flex items-center gap-2 rounded-md bg-white p-3 transition-all duration-200"
          style={{
            backgroundClip: 'padding-box, border-box',
            backgroundImage: shouldFloat
              ? 'linear-gradient(white, white), linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)'
              : 'none',
            backgroundOrigin: 'padding-box, border-box',
            border: '2px solid transparent',
            borderColor: shouldFloat ? 'transparent' : '#d1d5db'
          }}
        >
          {icon && (
            <span
              className="shrink-0 transition-all duration-200"
              style={{
                color: shouldFloat ? '#2563eb' : '#9ca3af'
              }}
            >
              {icon}
            </span>
          )}
          <input
            className={cn(
              "z-10 w-full bg-transparent text-base outline-none",
              "text-gray-900",
              "[appearance:textfield]",
              "[&::-webkit-outer-spin-button]:appearance-none",
              "[&::-webkit-inner-spin-button]:appearance-none",
              className
            )}
            onBlur={() => setIsFocused(false)}
            onFocus={(e) => {
              setIsFocused(true);
              if (props.onFocus) {props.onFocus(e);}
            }}
            placeholder=" "
            ref={ref}
            style={{
              border: 'none',
              boxShadow: 'none !important',
              height: '24px',
              lineHeight: '24px',
              outline: 'none !important',
              paddingRight: rightElement ? '100px' : '0'
            }}
            type={type}
            value={value}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-[14px] right-2 z-20 flex items-center">
              {rightElement}
            </div>
          )}
          <label
            className="pointer-events-none absolute origin-left text-sm transition-all duration-200"
            style={{
              backgroundColor: shouldFloat ? 'white' : 'transparent',
              left: icon ? '2.25rem' : '0.625rem',
              paddingLeft: shouldFloat ? '0.25rem' : '0',
              paddingRight: shouldFloat ? '0.25rem' : '0',
              top: shouldFloat ? '-0.625rem' : '50%',
              transform: shouldFloat ? 'translateY(0) scale(0.75)' : 'translateY(-50%) scale(1)',
              zIndex: shouldFloat ? 20 : 10
            }}
          >
            <span
              style={{
                WebkitBackgroundClip: shouldFloat ? 'text' : 'border-box',
                WebkitTextFillColor: shouldFloat ? 'transparent' : '#9ca3af',
                backgroundClip: shouldFloat ? 'text' : 'border-box',
                backgroundImage: shouldFloat
                  ? 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)'
                  : 'none',
                color: shouldFloat ? 'transparent' : '#9ca3af'
              }}
            >
              {label}
            </span>
          </label>
        </div>
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
