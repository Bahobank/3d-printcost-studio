"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export interface LegacyData {
  printers?: unknown[];
  materials?: unknown[];
  jobs?: unknown[];
  settings?: unknown;
  theme?: string;
  language?: string;
}

interface MigrationStatus {
  state: "idle" | "loading" | "success" | "error";
  message?: string;
  migrated?: {
    printers: number;
    materials: number;
    jobs: number;
  };
}

export function LegacyDataMigration({ userEmail }: { userEmail: string }) {
  const [status, setStatus] = useState<MigrationStatus>({ state: "idle" });

  const extractLegacyData = (): LegacyData | null => {
    try {
      // Try to get data from localStorage using the same keys as legacy app
      const v2Data = localStorage.getItem("3dPrintCostStudio.v2");
      const v1Data = localStorage.getItem("3dPrintCostStudio.v1");

      const data = v2Data ? JSON.parse(v2Data) : v1Data ? JSON.parse(v1Data) : null;

      if (!data) {
        console.warn("[migration] No legacy data found in localStorage");
        return null;
      }

      return data;
    } catch (error) {
      console.error("[migration] Error extracting legacy data:", error);
      return null;
    }
  };

  const handleMigration = async () => {
    setStatus({ state: "loading", message: "Extracting data from legacy app..." });

    const legacyData = extractLegacyData();

    if (!legacyData) {
      setStatus({
        state: "error",
        message: "No legacy data found. Make sure you have used the old app before.",
      });
      return;
    }

    try {
      setStatus({ state: "loading", message: "Migrating data to cloud..." });

      const response = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legacyData,
          email: userEmail,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Migration failed");
      }

      const result = await response.json();

      setStatus({
        state: "success",
        message: `Successfully migrated ${result.migrated.printers} printers, ${result.migrated.materials} materials, and ${result.migrated.jobs} print jobs!`,
        migrated: result.migrated,
      });

      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Migration failed",
      });
    }
  };

  // Auto-detect legacy data and show migration prompt
  useEffect(() => {
    const hasLegacyData = 
      localStorage.getItem("3dPrintCostStudio.v2") || 
      localStorage.getItem("3dPrintCostStudio.v1");

    if (hasLegacyData && status.state === "idle") {
      setStatus({
        state: "idle",
        message: "Legacy data detected. Click to migrate.",
      });
    }
  }, []);

  if (status.state === "idle" && !status.message) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-lg max-w-sm">
      <div className="flex gap-3">
        {status.state === "loading" && (
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0 mt-0.5" />
        )}
        {status.state === "success" && (
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        )}
        {status.state === "error" && (
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        )}

        <div className="flex-1">
          <p className="font-semibold text-sm text-gray-900">
            {status.state === "loading" && "Migrating your data..."}
            {status.state === "success" && "Migration successful!"}
            {status.state === "error" && "Migration failed"}
            {status.state === "idle" && "Legacy data found"}
          </p>
          <p className="text-sm text-gray-600 mt-1">{status.message}</p>
        </div>
      </div>

      {status.state === "idle" && (
        <button
          onClick={handleMigration}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md text-sm transition-colors"
        >
          Start Migration
        </button>
      )}
    </div>
  );
}
