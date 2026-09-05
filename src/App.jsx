import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import RouteSkeleton from "./components/Skeleton.jsx";
import Landing from "./pages/Landing.jsx";

const Chat = lazy(() => import("./pages/Chat.jsx"));
const Directory = lazy(() => import("./pages/Directory.jsx"));
const Analytics = lazy(() => import("./pages/Analytics.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));

function RouteFallback({ path }) {
  return <RouteSkeleton path={path} />;
}

export default function App() {
  const { pathname } = useLocation();
  const isMarketing = pathname === "/";

  return (
    <div className={isMarketing ? "site" : "app-root"}>
      <Suspense fallback={<RouteFallback path={pathname} />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AppShell />}>
            <Route path="/desk" element={<Chat />} />
            <Route path="/people" element={<Directory />} />
            <Route path="/pulse" element={<Analytics />} />
            <Route path="/you" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
