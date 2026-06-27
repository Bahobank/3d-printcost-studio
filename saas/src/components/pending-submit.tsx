"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type PendingSubmitButtonProps = {
  className: string;
  idleText: string;
  pendingText: string;
  icon?: ReactNode;
};

export function PendingSubmitButton({ className, idleText, pendingText, icon }: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button aria-busy={pending} className={className} disabled={pending} type="submit">
      {icon}
      {pending ? pendingText : idleText}
    </button>
  );
}