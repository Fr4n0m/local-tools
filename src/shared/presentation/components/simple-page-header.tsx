import Link from "next/link";
import type { ReactNode } from "react";
import { AppLogo } from "@/shared/presentation/components/app-logo";

type SimplePageHeaderProps = {
  rightSlot?: ReactNode;
};

export function SimplePageHeader({ rightSlot }: SimplePageHeaderProps) {
  return (
    <header className="simple-page-header mb-5 pb-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link className="inline-flex" href="/">
            <AppLogo />
          </Link>
        </div>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
    </header>
  );
}
