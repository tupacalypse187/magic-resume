import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingCard({
  icon: Icon,
  title,
  action,
  children,
}: {
  icon: any;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card
      className={cn(
        "border shadow-sm",
        "bg-card border-border shadow-sm"
      )}
    >
      <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Icon
            className={cn("w-4 h-4 text-muted-foreground")}
          />
          <span className={cn("text-foreground")}>
            {title}
          </span>
        </CardTitle>
        {action && <div className="ml-auto">{action}</div>}
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}
