// app/dashboard/layout.tsx
import React, { Suspense } from "react";
import Dashboard from "./Dashboard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Suspense fallback={<div>Loading Dashboard...</div>}>
        <Dashboard />
      </Suspense>
      {children}
    </div>
  );
}
