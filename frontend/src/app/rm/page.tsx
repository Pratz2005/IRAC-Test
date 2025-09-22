"use client";
import { useEffect, useState } from "react";
import { Shield, BarChart3, PieChart, TrendingUp, Users, AlertTriangle, CheckCircle, Clock, User, LogOut, Filter, Download, Eye } from "lucide-react";

import { getAllRiskTables, getDashboardStats } from "@/app/lib/api";

interface RiskTableItem {
    id: string;
    project_manager_id: string;
    risk_scenario_id: string;
    mitigation_status: string;
    pm_name?: string;
    project_name?: string;
    risk_name?: string;
}

interface DashboardStats {
    risk_distribution: Record<string, number>;
    mitigation_progress: Record<string, number>;
    project_managers: number;
    total_risks: number;
}

export default function RCDashboard() {
    const [tables, setTables] = useState<RiskTableItem[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        risk_distribution: {},
        mitigation_progress: {},
        project_managers: 0,
        total_risks: 0
    });
    const [selectedFilter, setSelectedFilter] = useState<string>("all");
    const [selectedProject, setSelectedProject] = useState<string>("all");

    useEffect(() => {
        getAllRiskTables().then((res) => setTables(res.data));
        getDashboardStats().then((res) => setStats(res.data));
    }, []);

    useEffect(() => {
        getDashboardStats().then((res) => {
            setStats({
                risk_distribution: res.data.risk_distribution || {},
                mitigation_progress: res.data.mitigation_progress || {},
                project_managers: res.data.project_managers || 0,
                total_risks: res.data.total_risks || 0,
            });
        });
    }, []);

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

    const filteredTables = tables.filter(item => {
        const statusMatch = selectedFilter === "all" || item.mitigation_status === selectedFilter;
        const projectMatch = selectedProject === "all" || item.project_manager_id === selectedProject;
        return statusMatch && projectMatch;
    });

    const uniqueProjects = Array.from(new Set(tables.map(item => item.project_manager_id)))
        .map(id => {
            const item = tables.find(t => t.project_manager_id === id);
            return { id, name: item?.pm_name || id, project: item?.project_name || "Unknown Project" };
        });

    const riskDistributionData = Object.entries(stats.risk_distribution).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / stats.total_risks) * 100)
    }));

    const mitigationData = Object.entries(stats.mitigation_progress || {}).map(([status, count]) => ({
        status,
        count,
        percentage: stats.total_risks > 0
            ? Math.round((count / stats.total_risks) * 100)
            : 0
    }));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <Shield className="w-8 h-8 text-purple-600" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">RiskGuard</h1>
                                    <p className="text-sm text-gray-500">Risk Consultant Dashboard</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                <Download className="w-4 h-4" />
                                <span>Export Report</span>
                            </button>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <User className="w-5 h-5" />
                                <span className="text-sm font-medium">Sarah Wilson</span>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Risk Entries</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total_risks}</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.project_managers}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Mitigation Rate</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {Math.round((((stats.mitigation_progress?.["fully mitigated"] || 0) / (stats.total_risks || 1)) * 100))}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">High Risk Items</p>
                                <p className="text-3xl font-bold text-red-600">
                                    {stats.mitigation_progress?.["not mitigated"] ?? 0}
                                </p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Risk Distribution Chart */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Risk Scenario Distribution</h3>
                            <PieChart className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            {riskDistributionData.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-purple-500' : index === 2 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-gray-900">{item.count}</span>
                                        <span className="text-xs text-gray-500 ml-1">({item.percentage}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mitigation Progress Chart */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Mitigation Progress</h3>
                            <BarChart3 className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            {mitigationData.map((item) => (
                                <div key={item.status} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 capitalize">
                                            {item.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">{item.count} ({item.percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${item.status === 'fully mitigated' ? 'bg-green-500' :
                                                item.status === 'partially mitigated' ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Risk Tables Overview */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">All Risk Tables</h2>
                            <div className="flex items-center space-x-3">
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">All Projects</option>
                                    {uniqueProjects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.name} - {project.project}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedFilter}
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="not mitigated">Not Mitigated</option>
                                    <option value="partially mitigated">Partially Mitigated</option>
                                    <option value="fully mitigated">Fully Mitigated</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden">
                        {filteredTables.length === 0 ? (
                            <div className="p-12 text-center">
                                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No risk entries found</h3>
                                <p className="text-gray-500">Try adjusting your filters to see more results.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Manager</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Scenario</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTables.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <User className="w-5 h-5 text-gray-400 mr-3" />
                                                        <span className="text-sm font-medium text-gray-900">{item.pm_name || item.project_manager_id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">{item.project_name || "Unknown Project"}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-gray-900">{item.risk_name || `Risk ${item.risk_scenario_id}`}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(item.mitigation_status)}
                                                        <span className={getStatusBadge(item.mitigation_status)}>
                                                            {item.mitigation_status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full ${item.mitigation_status === 'fully mitigated' ? 'bg-green-500' :
                                                                item.mitigation_status === 'partially mitigated' ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{
                                                                width: item.mitigation_status === 'fully mitigated' ? '100%' :
                                                                    item.mitigation_status === 'partially mitigated' ? '50%' : '10%'
                                                            }}
                                                        ></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}