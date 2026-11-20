import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
} from "@radix-ui/react-select";
import { ChevronDown } from "@/components/Icons";
import { forwardRef, useMemo } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  required?: boolean;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
}

export const CustomSelect = forwardRef<HTMLButtonElement, CustomSelectProps>(
  (
    {
      value,
      onValueChange,
      options,
      placeholder = "Select an option",
      ariaLabel,
      required = false,
      ariaInvalid = false,
      ariaDescribedBy,
      className = "",
      disabled = false,
      id,
    },
    ref
  ) => {
    // Debug: log value prop
    console.log('[CustomSelect] render value:', value, 'type:', typeof value);

    // Compute the display label directly from value and options
    const displayLabel = useMemo(() => {
      if (!value) return "Select an option";
      const selectedOption = options.find((opt) => opt.value === value);
      if (selectedOption) return selectedOption.label;
      // If value doesn't match any option but has content, show it
      if (value && value.trim()) return value.trim();
      return "Select an option";
    }, [value, options]);

    return (
      <Select
        value={value}
        onValueChange={(newValue) => {
          console.log('[CustomSelect] onValueChange called with:', newValue);
          // Ignore empty string values (Radix Select calls onValueChange with "" when closing)
          if (newValue === "") {
            return;
          }
          onValueChange(newValue);
        }}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger
          ref={ref}
          id={id}
          aria-label={ariaLabel}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className={`
            w-full rounded-xl border bg-white/5 px-5 py-4 text-sm text-[#FAF5EF] transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-[#E87272] focus:border-[#E87272] focus:bg-white/5
            ${ariaInvalid
              ? "border-[#E87272] ring-1 ring-[#E87272]/20 bg-white/6"
              : "border-[#FAF5EF]/20 hover:border-[#FAF5EF]/25 hover:bg-white/5"}
            ${disabled ? "opacity-40 cursor-not-allowed" : ""}
            ${className}
          `}
        >
          <span className="text-[#FAF5EF]">{displayLabel}</span>
          <ChevronDown
            className={`pointer-events-none h-4 w-4 text-[#FAF5EF]/50 transition-transform duration-300 ${
              disabled ? "opacity-50" : ""
            }`}
            aria-hidden="true"
          />
        </SelectTrigger>

        <SelectContent
          className={`
            relative z-50 min-w-[8rem] max-h-96 overflow-y-auto rounded-xl
            bg-[#1A0A0C]/95 backdrop-blur-xl border border-[#4A0E17]/30
            shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8),_0_0_0_1px_rgba(250,245,239,0.05)]
            p-2 animate-in fade-in-0 zoom-in-95 duration-200 ease-out
            data-[state=closed]:animate-out data-[state=closed]:fade-out-0
            data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150
          `}
          sideOffset={5}
          collisionPadding={10}
        >
          {options.map((option, index) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className={`
                relative flex w-full cursor-pointer select-none items-center rounded-lg
                px-4 py-3 text-sm text-[#FAF5EF] outline-none
                data-[disabled]:pointer-events-none data-[disabled]:opacity-50
                data-[highlighted]:bg-white/10 data-[highlighted]:text-[#FAF5EF]
                focus:bg-white/10 focus:text-[#FAF5EF]
                animate-in fade-in-0 zoom-in-95 duration-150 ease-out
                ${index === 0 ? "rounded-t-lg" : ""}
                ${index === options.length - 1 ? "rounded-b-lg" : ""}
              `}
            >
              <span className="flex-1">{option.label}</span>
              <SelectItemIndicator className="flex h-4 w-4 items-center justify-center text-[#E87272]">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

CustomSelect.displayName = "CustomSelect";