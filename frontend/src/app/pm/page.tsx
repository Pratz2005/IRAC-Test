"use client";
import { useEffect, useState } from "react";
import { Shield, Plus, Eye, AlertTriangle, CheckCircle, Clock, Search, Filter, User, LogOut, BarChart3, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

import { getRisks, addToRiskTable, getRiskTable, updateMitigationStatus, deleteRiskTableItem } from "@/app/lib/api";

interface Risk {
    id: string;
    name: string;
    description: string;
    mitigation_strategy?: string;
}

interface RiskTableItem {
    id: string;
    risk_scenario_id: string;
    mitigation_status: string;
    risk_name?: string;
}

export default function PMDashboard() {
    const [user, setUser] = useState<{ id: string; role: string; email?: string } | null>(null);
    const [risks, setRisks] = useState<Risk[]>([]);
    const [myTable, setMyTable] = useState<RiskTableItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [showAddModal, setShowAddModal] = useState(false);
    const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (!user) return;
        if (user && user.role === "PM") {
            getRisks().then((res) => setRisks(res.data));
            getRiskTable(user.id).then((res) => setMyTable(res.data));
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/"; // or router.push("/login")
    };

    const handleAdd = async (riskId: string) => {
        const risk = risks.find(r => r.id === riskId);
        if (!user || !risk) return;
        await addToRiskTable(user.id, { risk_scenario_id: riskId, mitigation_status: "not mitigated" });

        // Refresh the risk table from API
        const updated = await getRiskTable(user.id);
        setMyTable(updated.data);
        setShowAddModal(false);
    };

    const handleStatusUpdate = async (itemId: string, newStatus: string) => {
        if (!user) return;
        try {
            await updateMitigationStatus(user.id, itemId, newStatus);
            const updated = await getRiskTable(user.id);
            setMyTable(updated.data);
        } catch (e: any) {
            console.error("Update error:", e);
            alert(e?.response?.data?.detail || "Failed to update mitigation status");
        }
    };

    const handleDelete = async (itemId: string) => {
        if (!user) return;
        try {
            await deleteRiskTableItem(user.id, itemId);
            const updated = await getRiskTable(user.id);
            setMyTable(updated.data);

            // Also remove from expanded risks if it was expanded
            setExpandedRisks(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        } catch (e: any) {
            console.error("Delete error:", e);
            alert(e?.response?.data?.detail || "Failed to delete item");
        }
    };

    const toggleExpanded = (itemId: string) => {
        setExpandedRisks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const getRiskDetails = (riskScenarioId: string) => {
        return risks.find(risk => risk.id === riskScenarioId);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "fully mitigated":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "partially mitigated":
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return <AlertTriangle className="w-5 h-5 text-red-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
        switch (status) {
            case "fully mitigated":
                return `${baseClasses} bg-green-100 text-green-800`;
            case "partially mitigated":
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            default:
                return `${baseClasses} bg-red-100 text-red-800`;
        }
    };

    const filteredRisks = risks.filter(risk =>
        risk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTable = myTable.filter(item =>
        selectedStatus === "all" || item.mitigation_status === selectedStatus
    );

    const stats = {
        total: myTable.length,
        fullyMitigated: myTable.filter(item => item.mitigation_status === "fully mitigated").length,
        partiallyMitigated: myTable.filter(item => item.mitigation_status === "partially mitigated").length,
        notMitigated: myTable.filter(item => item.mitigation_status === "not mitigated").length
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <Shield className="w-8 h-8 text-blue-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">RiskGuard</h1>
                                    <p className="text-sm text-gray-500">Project Manager Dashboard</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-gray-600">
                                <User className="w-5 h-5" />
                                <span className="text-sm font-medium">{user?.email || "Unknown User"}</span>
                            </div>
                            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Risks</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Fully Mitigated</p>
                                <p className="text-3xl font-bold text-green-600">{stats.fullyMitigated}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Partially Mitigated</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.partiallyMitigated}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Not Mitigated</p>
                                <p className="text-3xl font-bold text-red-600">{stats.notMitigated}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* My Risk Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">My Risk Table</h2>
                            <div className="flex items-center space-x-3">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="not mitigated">Not Mitigated</option>
                                    <option value="partially mitigated">Partially Mitigated</option>
                                    <option value="fully mitigated">Fully Mitigated</option>
                                </select>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Risk</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden">
                        {filteredTable.length === 0 ? (
                            <div className="p-12 text-center">
                                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No risks found</h3>
                                <p className="text-gray-500 mb-4">Start by adding risks to your table to track mitigation progress.</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add Your First Risk
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredTable.map((item) => {
                                    const isExpanded = expandedRisks.has(item.id);
                                    const riskDetails = getRiskDetails(item.risk_scenario_id);

                                    return (
                                        <div key={item.id} className="transition-colors">
                                            <div className="p-6 hover:bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-start space-x-4 flex-1">
                                                        {getStatusIcon(item.mitigation_status)}
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <h3 className="text-lg font-medium text-gray-900">
                                                                    {riskDetails?.name || item.risk_name || `Risk ID: ${item.risk_scenario_id}`}
                                                                </h3>
                                                                <button
                                                                    onClick={() => toggleExpanded(item.id)}
                                                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                                    title={isExpanded ? "Collapse details" : "Expand details"}
                                                                >
                                                                    {isExpanded ? (
                                                                        <ChevronUp className="w-4 h-4 text-gray-500" />
                                                                    ) : (
                                                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center space-x-3 mt-1">
                                                                <span className={getStatusBadge(item.mitigation_status)}>
                                                                    {item.mitigation_status.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <select
                                                            value={item.mitigation_status}
                                                            onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                                                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        >
                                                            <option value="not mitigated">Not Mitigated</option>
                                                            <option value="partially mitigated">Partially Mitigated</option>
                                                            <option value="fully mitigated">Fully Mitigated</option>
                                                        </select>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete risk from table"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expandable Details */}
                                            {isExpanded && riskDetails && (
                                                <div className="px-6 pb-6 bg-gray-50 border-t border-gray-100">
                                                    <div className="pt-4 space-y-4">
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Risk Description</h4>
                                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                                {riskDetails.description}
                                                            </p>
                                                        </div>

                                                        {riskDetails.mitigation_strategy && (
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Mitigation Strategy</h4>
                                                                <div className="bg-blue-50 rounded-lg p-3">
                                                                    <p className="text-sm text-blue-800 leading-relaxed">
                                                                        {riskDetails.mitigation_strategy}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Risk Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-gray-900">Add Risk to Your Table</h3>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <p className="text-gray-600 mt-1">Select from available risk scenarios to add to your project.</p>
                            </div>

                            <div className="p-6">
                                <div className="mb-6">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search risk scenarios..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {filteredRisks.map((risk) => {
                                        const isAlreadyAdded = myTable.some(item => item.risk_scenario_id === risk.id);
                                        return (
                                            <div key={risk.id} className={`border rounded-lg p-4 transition-all ${isAlreadyAdded ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 mb-2">{risk.name}</h4>
                                                        <p className="text-gray-600 text-sm mb-3 leading-relaxed">{risk.description}</p>
                                                        {risk.mitigation_strategy && (
                                                            <div className="bg-blue-50 rounded-lg p-3">
                                                                <p className="text-xs font-medium text-blue-800 mb-1">Suggested Mitigation Strategy:</p>
                                                                <p className="text-sm text-blue-700">{risk.mitigation_strategy}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4 flex-shrink-0">
                                                        {isAlreadyAdded ? (
                                                            <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                                <span className="text-sm font-medium">Added</span>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAdd(risk.id)}
                                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                <span>Add</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {filteredRisks.length === 0 && (
                                    <div className="text-center py-8">
                                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No risks found</h3>
                                        <p className="text-gray-500">Try adjusting your search terms.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}