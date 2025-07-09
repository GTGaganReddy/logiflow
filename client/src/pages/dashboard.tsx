import { Truck, Plus, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CustomerLoadTable from "@/components/CustomerLoadTable";
import FleetStatus from "@/components/FleetStatus";
import LogisticsNotepad from "@/components/LogisticsNotepad";
import AddCustomerModal from "@/components/AddCustomerModal";
import DashboardStats from "@/components/DashboardStats";




export default function Dashboard() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  


  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Truck className="text-primary text-2xl" />
                <h1 className="text-2xl font-bold text-neutral-800">BubbleGPT Full Truck Load</h1>
              </div>
              <span className="text-neutral-500 text-sm">Logistics Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center space-x-2">
                <Plus size={16} />
                <span>Add Load</span>
              </Button>
              <div className="flex items-center space-x-2 text-neutral-600">
                <UserCircle className="text-xl" />
                <span className="text-sm">John Coordinator</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">

        <div className="space-y-6">
          <DashboardStats />
          <CustomerLoadTable />
          <LogisticsNotepad />
        </div>
      </div>

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
