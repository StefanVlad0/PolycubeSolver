import { Sidebar } from "./components/Sidebar";
import { Viewport } from "./components/Viewport";

export default function App() {
  return (
    <div className="app-bg flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="relative m-3 ml-0 flex-1 overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
        <Viewport />
      </main>
    </div>
  );
}
