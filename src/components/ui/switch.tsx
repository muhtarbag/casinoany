import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "group peer relative inline-flex h-8 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-all duration-300 ease-in-out data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted hover:data-[state=unchecked]:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
    ref={ref}
  >
    {/* OFF Text - Right side */}
    <span 
      className="absolute right-2 text-xs font-bold uppercase text-muted-foreground transition-opacity duration-300 pointer-events-none select-none group-data-[state=checked]:opacity-0 group-data-[state=unchecked]:opacity-100"
    >
      OFF
    </span>
    
    {/* ON Text - Left side */}
    <span 
      className="absolute left-2 text-xs font-bold uppercase text-primary-foreground transition-opacity duration-300 pointer-events-none select-none group-data-[state=checked]:opacity-100 group-data-[state=unchecked]:opacity-0"
    >
      ON
    </span>
    
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-7 w-7 rounded-full bg-background shadow-lg ring-0 transition-all duration-300 ease-in-out data-[state=checked]:translate-x-[30px] data-[state=unchecked]:translate-x-[-30px] z-10",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
