import * as React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboBoxOptions<T>
  extends Omit<ButtonProps, "value" | "children"> {
  value: T | null;
  renderValue: (val: T) => React.ReactNode;
  selectedPlaceholder: string;
  filterPlaceholder: string;
  setValue: (value: T) => void;
  values: T[];
}

export function ComboBox<T>({
  value,
  setValue,
  values,
  renderValue,
  selectedPlaceholder,
  filterPlaceholder,
  ...props
}: ComboBoxOptions<T>) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const trigger = (
    <Button variant="outline" {...props}>
      {value ? (
        renderValue(value)
      ) : (
        <span className="w-full text-left text-muted-foreground">
          {selectedPlaceholder}
        </span>
      )}
    </Button>
  );

  const dropdownContent = (
    <Command>
      <CommandInput placeholder={filterPlaceholder} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {values.map((value, i) => (
            <CommandItem
              key={i}
              onSelect={() => {
                setValue(value);
                setOpen(false);
              }}
            >
              {renderValue(value)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          {dropdownContent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">{dropdownContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
