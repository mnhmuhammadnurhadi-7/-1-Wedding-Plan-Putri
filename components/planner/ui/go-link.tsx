import type { AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { usePlanner } from "../data/planner-store";
import type { PageKey } from "../data/types";

export function GoLink({
  page,
  set,
  children,
  ...props
}: {
  page: PageKey;
  set?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">) {
  const { go } = usePlanner();
  const href = `/${page}`;

  return (
    <Link
      {...props}
      href={href}
      onClick={(event) => {
        props.onClick?.(event);
        go(page, set);
      }}
    >
      {children}
    </Link>
  );
}
