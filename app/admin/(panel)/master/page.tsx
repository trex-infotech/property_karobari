import type { Metadata } from "next";
import { getDb } from "@/app/lib/mongodb";
import CityModal from "./city-modal";

export const metadata: Metadata = {
  title: "Master | Admin",
};

// Reads MongoDB at request time.
export const instant = false;

export default async function AdminMasterPage() {
  const db = await getDb();
  const cities = await db
    .collection("cities")
    .find()
    .sort({ city: 1 })
    .limit(200)
    .toArray();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">
            Cities & Locations
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Manage cities and their locations.
          </p>
        </div>
        <CityModal mode="create" />
      </div>

      {cities.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500">
          No cities yet. Click “Create” to add your first city with locations.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="w-48 px-4 py-3">City</th>
                <th className="px-4 py-3">Locations</th>
                <th className="w-24 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {cities.map((entry) => (
                <tr key={String(entry._id)} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 align-top font-medium text-zinc-900">
                    {entry.city}
                  </td>
                  <td className="px-4 py-3">
                    {entry.locations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {entry.locations
                          .slice(0, 5)
                          .map((location: string) => (
                            <span
                              key={location}
                              className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                            >
                              {location}
                            </span>
                          ))}
                        {entry.locations.length > 5 && (
                          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-500">
                            +{entry.locations.length - 5} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-500">No locations added.</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CityModal
                      mode="edit"
                      cityId={String(entry._id)}
                      initialCity={entry.city}
                      initialLocations={entry.locations}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
