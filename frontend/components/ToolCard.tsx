import Link from "next/link";
import Icon, { type IconName } from "@/components/Icon";

type ToolCardProps = {
  icon: IconName;
  title: string;
  desc: string;
  href: string;
  isNew?: boolean;
  external?: boolean;
};

export default function ToolCard({ icon, title, desc, href, isNew, external }: ToolCardProps) {
  const cls = `card${isNew ? " card-new" : ""}`;
  const inner = (
    <>
      <span className="card-icon" aria-hidden="true">
        <Icon name={icon} size={22} />
      </span>
      <strong>{title}</strong>
      <p>{desc}</p>
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
