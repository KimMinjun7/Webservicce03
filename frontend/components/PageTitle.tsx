import Icon, { type IconName } from "@/components/Icon";

type PageTitleProps = {
  icon: IconName;
  title: string;
};

export default function PageTitle({ icon, title }: PageTitleProps) {
  return (
    <h1>
      <span className="title-icon" aria-hidden="true">
        <Icon name={icon} size={22} />
      </span>
      {title}
    </h1>
  );
}
