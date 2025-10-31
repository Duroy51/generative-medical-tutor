// app/dashboard/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Globe, Package, Loader2, MessageSquare, Building2, AlertCircle, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import * as ApiService from "@/lib/ApiService";

export default function DashboardPage() {

  const router = useRouter();
  const [loading, setLoading] = useState(true);
 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col ml-6 min-h-screen">
      <main className="flex-1 bg-whrite pt-16">


      
      </main>
    </div>
  );
}
