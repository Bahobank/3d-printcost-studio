import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type LegacyData = {
  printers?: unknown[];
  materials?: unknown[];
  jobs?: unknown[];
  settings?: unknown;
  theme?: string;
  language?: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { legacyData, email } = body;

    if (!legacyData || !email) {
      return NextResponse.json(
        { error: "Missing legacyData or email" },
        { status: 400 }
      );
    }

    // Authenticate user
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userData.user.email !== email) {
      return NextResponse.json(
        { error: "Email mismatch" },
        { status: 403 }
      );
    }

    // Use admin client to save migration
    const admin = createAdminClient();
    const userId = userData.user.id;

    // 1. Migrate printers to printer_profiles
    if (Array.isArray(legacyData.printers)) {
      for (const printer of legacyData.printers) {
        const printerData = printer as any;
        if (printerData.id && printerData.name) {
          const { error } = await admin.from("printer_profiles").insert({
            user_id: userId,
            printer_type: printerData.printerType?.toLowerCase() === "resin" ? "resin" : "fdm",
            brand: printerData.brand || "unknown",
            model: printerData.name || "",
            avg_watt: parseInt(printerData.avgWatt) || 0,
            max_watt: parseInt(printerData.maxWatt) || 0,
            depreciation_percent: parseFloat(printerData.depreciationPercent) || 0,
          });
          if (error) console.error("[migration] Error adding printer:", error);
        }
      }
    }

    // 2. Migrate materials to material_stocks
    if (Array.isArray(legacyData.materials)) {
      for (const material of legacyData.materials) {
        const materialData = material as any;
        if (materialData.id && materialData.name) {
          const { error } = await admin.from("material_stocks").insert({
            user_id: userId,
            material_category: materialData.material_category?.toLowerCase() === "resin" ? "resin" : "filament",
            product_name: materialData.name || "",
            color_name: materialData.color || "",
            remaining_amount: parseFloat(materialData.remaining_amount || materialData.quantity || 0) || 0,
            initial_amount: parseFloat(materialData.initial_amount || materialData.quantity || 0) || 0,
            total_cost: parseFloat(materialData.total_cost || 0) || 0,
          });
          if (error) console.error("[migration] Error adding material:", error);
        }
      }
    }

    // 3. Migrate print jobs to print_jobs
    if (Array.isArray(legacyData.jobs)) {
      for (const job of legacyData.jobs) {
        const jobData = job as any;
        if (jobData.id && jobData.name) {
          const { error } = await admin.from("print_jobs").insert({
            user_id: userId,
            job_name: jobData.name || "",
            job_status: jobData.status || "sale",
            hours: parseInt(jobData.hours) || 0,
            minutes: parseInt(jobData.minutes) || 0,
            electricity_cost: parseFloat(jobData.electricity_cost || 0) || 0,
            machine_cost: parseFloat(jobData.machine_cost || 0) || 0,
            labor_cost: parseFloat(jobData.labor_cost || 0) || 0,
            other_cost: parseFloat(jobData.other_cost || 0) || 0,
            total_cost: parseFloat(jobData.total_cost || 0) || 0,
          });
          if (error) console.error("[migration] Error adding job:", error);
        }
      }
    }

    // 4. Update user profile with migration timestamp
    const { error: updateError } = await admin
      .from("user_profiles")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("[migration] Error updating profile:", updateError);
    }

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      migrated: {
        printers: Array.isArray(legacyData.printers)
          ? legacyData.printers.length
          : 0,
        materials: Array.isArray(legacyData.materials)
          ? legacyData.materials.length
          : 0,
        jobs: Array.isArray(legacyData.jobs) ? legacyData.jobs.length : 0,
      },
    });
  } catch (error) {
    console.error("[migration] Error:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
