import Sidebar from "../../components/Sidebar"
import Header from "../../components/Header";

export default function AdminDashboardLayout({ children }) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto flex flex-col ml-6">
          <Header />
          <main className="px-7 py-5">{children}</main>
        </div>
      </div>
    );
  }
  