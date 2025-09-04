"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,

} from "recharts";
import {
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  Filter,
  Calendar,
  Download,
  RefreshCw,
  XCircle,
} from "lucide-react";
import type { User } from "@/types/user";
import type { Group } from "@/types/groups";
import type { Template } from "@/types/whatsapp";
import type { TemplateStatsResult } from "@/types/stats";
import useUsers from "@/hooks/useUsers";
import { useGroups } from "@/hooks/useGroups";
import { fetchAllTemplateMessages } from "@/lib/stats";

interface TemplateMessage {
  id: string;
  body: string;
  status: string;
  createdAt: string;
  user: User | null;
  group: Group | null;
}

const token = localStorage.getItem("token") || sessionStorage.getItem("token");

const data = (): TemplateMessage[] => {
  const statuses = ["delivered", "sent", "failed", "read"];
  const users = useUsers();
  const groups = useGroups(token);
  

  return users.users.map((user) => {
    return {
      id: user.id.toString(),
      body: user.name,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date().toISOString(),
      user,
      group: groups.groups[Math.floor(Math.random() * groups.groups.length)],
    };
  });
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  className?: string;
}> = ({
  title,
  value,
  icon,
  change,
  changeType = "neutral",
  className = "",
}) => (
  <div
    className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ${className}`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="text-blue-600">{icon}</div>
      </div>
      {change && (
        <span
          className={`text-sm font-medium px-2 py-1 rounded-full ${
            changeType === "positive"
              ? "text-green-600 bg-green-50"
              : changeType === "negative"
              ? "text-red-600 bg-red-50"
              : "text-gray-600 bg-gray-50"
          }`}
        >
          {change}
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-gray-600 text-sm">{title}</p>
  </div>
);

const WhatsAppStatsDashboard: React.FC = () => {
  const dataMessages = data();
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedStatus, setSelectedStatus] = useState("all");
  

  const processedData = useMemo(() => {
    const filtered = dataMessages.filter((msg) => {
      if (selectedStatus !== "all" && msg.status !== selectedStatus)
        return false;

      const msgDate = new Date(msg.createdAt);
      const now = new Date();
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const totalApi = dataMessages.length;                   // total crudo desde el front


      return msgDate >= cutoff;
    });

    // Status distribution
    const statusCounts = filtered.reduce((acc, msg) => {
      acc[msg.status] = (acc[msg.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const failureCount = filtered.filter(msg => msg.status === 'failed').length;

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color:
        status === "delivered"
          ? "#10B981"
          : status === "sent"
          ? "#3B82F6"
          : status === "failed"
          ? "#EF4444"
          : "#8B5CF6",
    }));

    // Daily messages over time
    const dailyData = filtered.reduce((acc, msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timeSeriesData = Object.entries(dailyData)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, messages: count }));

    // User activity
    const userActivity = filtered.reduce((acc, msg) => {
      if (msg.user) {
        acc[msg.user.name] = (acc[msg.user.name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topUsers = Object.entries(userActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, messages: count }));

    // Group activity
    const groupActivity = filtered.reduce((acc, msg) => {
      if (msg.group?.name) {
        acc[msg.group.name] = (acc[msg.group.name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topGroups = Object.entries(groupActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, count]) => ({ name, messages: count }));

    return {
      total: filtered.length,
      // totalApi,
      statusData,
      failureCount,
      timeSeriesData,
      topUsers,
      topGroups,
      deliveryRate: statusCounts.delivered
        ? (statusCounts.delivered / filtered.length) * 100
        : 0,
      failureRate: statusCounts.failed
        ? (statusCounts.failed / filtered.length) * 100
        : 0,
    };
  }, [dataMessages, timeRange, selectedStatus]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-lg">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-gray-700 font-medium">
            Cargando estadísticas...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Error al cargar datos
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
  <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
    {/* Header fijo */}
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Estadísticas WhatsApp
            </h1>
            <p className="text-gray-600 mt-1">Dashboard de mensajes template</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors">
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Período:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-gray-50 rounded-lg border-0 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Estado:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-gray-50 rounded-lg border-0 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">Todos</option>
                <option value="delivered">Entregados</option>
                <option value="sent">Enviados</option>
                <option value="failed">Fallidos</option>
                <option value="read">Leídos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Mensajes"
            value={processedData.total}
            icon={<MessageSquare className="w-6 h-6" />}
            change="+12%"
            changeType="positive"
          />
          {/* //Mensajes Fallidos */}
          <StatCard
            title="Mensajes Fallidos"
            value={processedData.failureCount.toLocaleString()}
            icon={<XCircle className="w-6 h-6" />}
            change="+12%"
            changeType="positive"
          />
          <StatCard
            title="Tasa de Entrega"
            value={`${processedData.deliveryRate.toFixed(1)}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            change="+2.3%"
            changeType="positive"
          />
          <StatCard
            title="Usuarios Activos"
            value={processedData.topUsers.length}
            icon={<Users className="w-6 h-6" />}
            change="0"
            changeType="neutral"
          />
          <StatCard
            title="Tasa de Fallo"
            value={`${processedData.failureRate.toFixed(1)}%`}
            icon={<Clock className="w-6 h-6" />}
            change="-0.5%"
            changeType="positive"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Messages Over Time */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Mensajes por Día
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={processedData.timeSeriesData}>
                <defs>
                  <linearGradient
                    id="messageGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#messageGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Distribución por Estado
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={processedData.statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {processedData.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-4">
              {processedData.statusData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium capitalize">
                    {entry.name}
                  </span>
                  <span className="text-sm text-gray-500">({entry.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Users and Groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Users */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Usuarios Más Activos
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={processedData.topUsers} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="messages" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Groups */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Grupos Más Activos
            </h3>
            <div className="space-y-4">
              {processedData.topGroups.map((group, index) => {
                const percentage = (group.messages / processedData.total) * 100;
                return (
                  <div
                    key={group.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">
                        {group.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                        {group.messages}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default WhatsAppStatsDashboard;
