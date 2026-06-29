import { SeriesTable } from "@/components/dashboard/SeriesTable";
import { seriesService } from "@/services/series.service";
import { userService } from "@/services/user.service";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function SeriesManagementPage() {
  const session = await userService.getUserSession();
  const role = session?.user?.role;
  const canCreate = role === "CREATOR"; // Assuming only creators can create, or maybe ADMIN can too? Requirements say: "Admin and modarator can't create series or chapter they can only view all series or chapters"

  const res = await seriesService.getAllSeries({ limit: 100 });
  const series = res?.data || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Series Management</h1>
          <p className="text-sm text-muted-foreground">Catalog and manage all published content.</p>
        </div>
        {canCreate && (
          <Link href="/dashboard/series/add">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Add New Series
            </button>
          </Link>
        )}
      </div>

      <SeriesTable initialSeries={series} userRole={role} />
    </div>
  );
}
