import Sidebar from "../../components/Sidebar"
import Header from "../../components/Header";
import ClientLayout from "../../components/ClientLayout";

export default function AdminDashboardLayout({ children }) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto flex flex-col ml-6">
          <Header />
          <main className="px-7 py-5">
            <ClientLayout>
              {children}
            </ClientLayout>
          </main>
        </div>
      </div>
    );
  }
  