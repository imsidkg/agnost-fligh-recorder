"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";

export function Switch({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <SwitchPrimitives.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="relative h-5 w-9 rounded-full bg-zinc-700 data-[state=checked]:bg-blue-600"
    >
      <SwitchPrimitives.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-4" />
    </SwitchPrimitives.Root>
  );
}
