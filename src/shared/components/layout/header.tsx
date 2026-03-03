import { SidebarTrigger } from '../sidebar/sidebar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  isDashboard?: boolean; 
}

export default function Header({
    title,
    subtitle,
    isDashboard = true,
}: HeaderProps) {
  return (
    <header className="bg-grey text-primary">
        {isDashboard && <SidebarTrigger />}
        <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-primary/80">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
