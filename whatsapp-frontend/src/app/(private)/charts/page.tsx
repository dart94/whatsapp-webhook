"use client";
import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
import useUsers from "@/hooks/useUsers";
import { useGroups } from "@/hooks/useGroups";
import { useStats } from "@/hooks/useStats";
import { StatCard } from "@/components/card/card";

interface TemplateMessage {
  id: string;
  body: string;
  status: string;
  createdAt: string;
  user: User | null;
  group: Group | null;
}

const WhatsAppStatsDashboard: React.FC = () => {
  // token
  const token = (typeof window !== "undefined" && (localStorage.getItem("token") || sessionStorage.getItem("token"))) || "";

  // hooks (llamados dentro del componente)
  const usersHook = useUsers();
  const groupsHook = useGroups(token);
  const statsHook = useStats(token);

  // asumimos que useStats devuelve { data, isLoading, error } similar a react-query hook
  const rawStats = statsHook?.data ?? null;
  const isLoading = statsHook?.loading ?? false;
  const error = statsHook?.error ?? null;

  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Normalizar messages: backend puede devolver array o { messages, summary }
  const messagesFromApi: TemplateMessage[] = useMemo(() => {
    if (!rawStats) return [];
    if (Array.isArray(rawStats)) return rawStats as TemplateMessage[];
    // si viene como { messages: [...] }
    return (rawStats as any).messages ?? [];
  }, [rawStats]);

  // Helper: normalizar status para comparación (backend puede usar SENT, sent, Delivered, etc.)
  const normalizeStatus = (s?: string) => (s ? s.toString().toUpperCase() : "UNKNOWN");

  // Procesado de datos para gráficas
  const processedData = useMemo(() => {
    const statsList = messagesFromApi.map((m) => ({
      ...m,
      status: normalizeStatus(m.status),
    }));

    // Filtrar por status y rango de tiempo
    const filtered = statsList.filter((msg) => {
      if (selectedStatus !== "all" && normalizeStatus(selectedStatus) !== msg.status) {
        return false;
      }

      const msgDate = new Date(msg.createdAt);
      const now = new Date();
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      return msgDate >= cutoff;
    });

    // Status distribution
    const statusCounts = filtered.reduce((acc, msg) => {
      acc[msg.status] = (acc[msg.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const failureCount = statusCounts["FAILED"] ?? 0;

    // Map status -> color & display name
    const statusOrdering = ["SENT", "DELIVERED", "READ", "FAILED", "PENDING", "UNKNOWN"];
    const getColorFor = (status: string) =>
      status === "DELIVERED"
        ? "#10B981"
        : status === "SENT"
        ? "#3B82F6"
        : status === "FAILED"
        ? "#EF4444"
        : status === "READ"
        ? "#8B5CF6"
        : "#94A3B8";

    const statusData = statusOrdering
      .filter((s) => (statusCounts[s] ?? 0) > 0)
      .map((s) => ({
        name: s,
        value: statusCounts[s],
        color: getColorFor(s),
      }));

    // Daily time series
    const dailyData = filtered.reduce((acc, msg) => {
      const date = new Date(msg.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timeSeriesData = Object.entries(dailyData)
      .map(([date, count]) => ({ date, messages: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // User activity (top users)
    const userActivity = filtered.reduce((acc, msg) => {
      const name = msg.user?.name ?? "Sin usuario";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topUsers = Object.entries(userActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, messages]) => ({ name, messages }));

    // Group activity (top groups)
    const groupActivity = filtered.reduce((acc, msg) => {
      const name = msg.group?.name ?? "Sin grupo";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topGroups = Object.entries(groupActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, messages]) => ({ name, messages }));

    const total = filtered.length;
    const delivered = statusCounts["DELIVERED"] ?? 0;
    const sent = statusCounts["SENT"] ?? 0;
    const okCount = delivered + sent + (statusCounts["READ"] ?? 0);

    return {
      total,
      statusData,
      failureCount,
      timeSeriesData,
      topUsers,
      topGroups,
      deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
      failureRate: total > 0 ? (failureCount / total) * 100 : 0,
      okCount,
      rawFiltered: filtered,
    };
  }, [messagesFromApi, timeRange, selectedStatus]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-lg">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-gray-700 font-medium">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const message = (error as any)?.message ?? String(error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error al cargar datos</h3>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  // Si no hay datos
  if (!processedData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">No hay datos para mostrar</div>
      </div>
    );
  }

  // UI
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
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={() => location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
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
                  onChange={(e) => setTimeRange(e.target.value as "7d" | "30d" | "90d")}
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
                  <option value="SENT">Enviados</option>
                  <option value="DELIVERED">Entregados</option>
                  <option value="FAILED">Fallidos</option>
                  <option value="READ">Leídos</option>
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
            <StatCard
              title="Mensajes Fallidos"
              value={processedData.failureCount.toLocaleString()}
              icon={<XCircle className="w-6 h-6" />}
              change="+12%"
              changeType="negative"
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
              changeType="negative"
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Messages Over Time */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Mensajes por Día</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={processedData.timeSeriesData}>
                  <defs>
                    <linearGradient id="messageGradient" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="messages" stroke="#3B82F6" strokeWidth={2} fill="url(#messageGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Distribución por Estado</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={processedData.statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" strokeWidth={0}>
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
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm font-medium capitalize">{entry.name}</span>
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
              <h3 className="text-lg font-bold text-gray-900 mb-6">Usuarios Más Activos</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={processedData.topUsers} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={12} width={140} />
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
              <h3 className="text-lg font-bold text-gray-900 mb-6">Grupos Más Activos</h3>
              <div className="space-y-4">
                {processedData.topGroups.map((group, index) => {
                  const percentage = processedData.total > 0 ? (group.messages / processedData.total) * 100 : 0;
                  return (
                    <div key={group.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{group.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-sm font-medium text-gray-600 min-w-[3rem]">{group.messages}</span>
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
