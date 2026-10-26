import { WifiOff } from "lucide-react";
import { formatLastSync } from "@/lib/cache";

type Props = {
  pageName: string;
  showCache?: boolean;
};

export default function OfflineNotice({ pageName, showCache = true }: Props) {
  return (
    <div className="p-4 md:p-8">
      <div className="border rounded-lg p-6 bg-amber-50 border-amber-200 text-center space-y-2">
        <WifiOff className="h-8 w-8 text-amber-600 mx-auto" />
        <h2 className="font-semibold text-amber-900">{pageName} is unavailable offline</h2>
        <p className="text-sm text-amber-800">
          This page requires an internet connection.
        </p>
        {showCache && (
          <p className="text-xs text-amber-700">
            Last cached data: {formatLastSync()}
          </p>
        )}
      </div>
    </div>
  );
}