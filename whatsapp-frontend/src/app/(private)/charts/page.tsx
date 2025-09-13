"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  MessageSquare,
  Clock,
  TrendingUp,
  Filter,
  RefreshCw,
  XCircle,
} from "lucide-react";
import type { User } from "@/types/user";
import type { Group } from "@/types/groups";
import { useStats } from "@/hooks/useStats";
import { StatCard } from "@/components/card/card";
import TimeRangeFilter from "@/components/charts/TimeRangeFilter";
import StatusRangeFilter from "@/components/charts/StatusRangeFilter";
import { CampaignFilter } from "@/components/charts/CampaignNameFilter";

interface TemplateMessage {
  id: string;
  body: string;
  status: string;
  createdAt: string;
  user: User | null;
  group: Group | null;
  campaignName: string;
}

const WhatsAppStatsDashboard: React.FC = () => {
  // token
  const token =
    (typeof window !== "undefined" &&
      (localStorage.getItem("token") || sessionStorage.getItem("token"))) ||
    "";

  // hooks (llamados dentro del componente)
  const statsHook = useStats(token);
  const rawStats = statsHook?.data ?? null;
  const isLoading = statsHook?.loading ?? false;
  const error = statsHook?.error ?? null;
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState("all");

  // 1) Diccionario centralizado
  const STATUS_LABELS: Record<string, string> = {
    SENT: "Enviados",
    DELIVERED: "Entregados",
    FAILED: "Fallidos",
    READ: "Leídos",
    PENDING: "Pendientes",
    UNKNOWN: "Desconocido",
  };

  // 2) Helper de traducción (con fallback elegante)
  const tStatus = (s?: string) =>
    STATUS_LABELS[s?.toUpperCase?.() || ""] ?? s ?? "";

  // Normalizar messages:
  const messagesFromApi: TemplateMessage[] = useMemo(() => {
    if (!rawStats) return [];
    if (Array.isArray(rawStats)) return rawStats as TemplateMessage[];
    // si viene como { messages: [...] }
    return (rawStats as any).messages ?? [];
  }, [rawStats]);

  // Helper: normalizar status para comparación
  const normalizeStatus = (s?: string) =>
    s ? s.toString().toUpperCase() : "UNKNOWN";

  const campaigns = useMemo(() => {
    const unique = new Set(
      messagesFromApi.map((msg) =>
        msg.campaignName && msg.campaignName.trim() !== ""
          ? msg.campaignName
          : "Sin campaña"
      )
    );
    return Array.from(unique);
  }, [messagesFromApi]);

  // Procesado de datos para gráficas
  const processedData = useMemo(() => {
    const statsList = messagesFromApi.map((m) => ({
      ...m,
      status: normalizeStatus(m.status),
    }));

    // Filtrar por status y rango de tiempo
    const filtered = statsList.filter((msg) => {
      if (
        selectedStatus !== "all" &&
        normalizeStatus(selectedStatus) !== msg.status
      ) {
        return false;
      }

      //Campaña
      const campaignName =
        msg.campaignName && msg.campaignName.trim() !== ""
          ? msg.campaignName
          : "Sin campaña";

      if (selectedCampaign !== "all" && selectedCampaign !== campaignName) {
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
    const sendCount = statusCounts["SENT"] ?? 0;

    // Map status -> color & display name
    const statusOrdering = [
      "SENT",
      "DELIVERED",
      "READ",
      "FAILED",
      "PENDING",
      "UNKNOWN",
    ];
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
        key: s, // valor "crudo" para lógica
        label: tStatus(s), // etiqueta traducida para UI
        value: statusCounts[s],
        color: getColorFor(s),
      }));

    const dailyData = filtered.reduce((acc, msg) => {
      const date = msg.createdAt.split(" ")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timeSeriesData = Object.entries(dailyData)
      .map(([date, count]) => ({ date, messages: count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      //Ordenar por fecha
      .reverse();

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
    console.log("GroupActivity:", groupActivity);

    const topGroups = Object.entries(groupActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, messages]) => ({ name, messages }));

    // Campaign activity (top campaigns)
    const campaignActivity = filtered.reduce((acc, msg) => {
      const name =
        msg.campaignName && msg.campaignName.trim() !== ""
          ? msg.campaignName
          : "Sin campaña";

      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCampaigns = Object.entries(campaignActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([name, messages]) => ({ name, messages }));

    const total = filtered.length;
    const delivered = statusCounts["DELIVERED"] ?? 0;
    const sent = statusCounts["SENT"] ?? 0;
    const okCount = delivered + sent;

    return {
      total,
      statusData,
      failureCount,
      timeSeriesData,
      topUsers,
      topGroups,
      topCampaigns,

      deliveryRate: total > 0 ? (sendCount / total) * 100 : 0,
      failureRate: total > 0 ? (failureCount / total) * 100 : 0,
      okCount,
      rawFiltered: filtered,
    };
  }, [messagesFromApi, timeRange, selectedStatus, selectedCampaign]);

  // Loading state
  if (isLoading) {
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

  // Error state
  if (error) {
    const message = (error as any)?.message ?? String(error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Error al cargar datos
          </h3>
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
      <div ref={scrollContainerRef} className="flex-1 overflow-y-scroll">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Filters */}
          <div className="bg-white/70 backdrop-blur-sm mb-8 rounded-2xl p-2 shadow-sm border border-white/50">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between p-4">
              {/* Time Range Selector */}
              <TimeRangeFilter
                timeRange={timeRange}
                setTimeRange={setTimeRange}
              />
              {/* Status Filter */}
              <StatusRangeFilter
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
              />
              {/*Selector de  CampaingName*/}
              <CampaignFilter
                campaigns={campaigns}
                selectedCampaign={selectedCampaign}
                setSelectedCampaign={setSelectedCampaign}
              />
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
              title="Tasa de Fallo"
              value={`${processedData.failureRate.toFixed(1)}%`}
              icon={<Clock className="w-6 h-6" />}
              change="-0.5%"
              changeType="negative"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Users */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Usuarios Más Activos
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  Total actividad
                </div>
              </div>

              <div className="space-y-4">
                {processedData.topUsers.map((user, index) => (
                  <div key={user.name} className="group relative">
                    {/* Ranking Badge */}
                    <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-10">
                      <div
                        className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md
                        ${
                          index === 0
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                            : index === 1
                            ? "bg-gradient-to-r from-gray-400 to-gray-600"
                            : index === 2
                            ? "bg-gradient-to-r from-amber-600 to-amber-800"
                            : "bg-gradient-to-r from-blue-500 to-blue-600"
                        }
                      `}
                      >
                        {index + 1}
                      </div>
                    </div>

                    {/* User Card */}
                    <div className="ml-6 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 group-hover:border-blue-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          {/* User Info */}
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {user.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {user.messages} mensaje
                              {user.messages !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        {/* Activity Badge */}
                        <div className="text-right">
                          <div
                            className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            ${
                              index === 0
                                ? "bg-green-100 text-green-800"
                                : index < 3
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-700"
                            }
                          `}
                          >
                            {index === 0
                              ? "MVP"
                              : index < 3
                              ? "Top 3"
                              : "Activo"}
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-2 w-20 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(
                                  (user.messages /
                                    Math.max(
                                      ...processedData.topUsers.map(
                                        (u) => u.messages
                                      )
                                    )) *
                                    100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Total de {processedData.topUsers.length} usuarios activos
                  </span>
                  <span className="text-gray-500">
                    {processedData.topUsers.reduce(
                      (sum, user) => sum + user.messages,
                      0
                    )}{" "}
                    mensajes totales
                  </span>
                </div>
              </div>
            </div>

            {/*CampaingName*/}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                Campañas Más Activas
              </h3>
              <div className="space-y-4">
                {processedData.topCampaigns.map((campaign, index) => {
                  const percentage =
                    processedData.total > 0
                      ? (campaign.messages / processedData.total) * 100
                      : 0;
                  return (
                    <div
                      key={campaign.name}
                      className="flex items-center justify-between"
                    >
                      {/* Ranking + Nombre */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">
                          {campaign.name}
                        </span>
                      </div>

                      {/* Barra de progreso + cantidad */}
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                          {campaign.messages} mensajes
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Messages Over Time */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Mensajes por Día
                </h3>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4"
                    />
                  </svg>
                  <span className="text-sm text-gray-500">Últimos 7 días</span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 text-center border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">
                    {processedData.timeSeriesData.reduce(
                      (sum, day) => sum + day.messages,
                      0
                    )}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">Total</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 text-center border border-green-100">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      processedData.timeSeriesData.reduce(
                        (sum, day) => sum + day.messages,
                        0
                      ) / processedData.timeSeriesData.length
                    )}
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    Promedio
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 text-center border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.max(
                      ...processedData.timeSeriesData.map((day) => day.messages)
                    )}
                  </div>
                  <div className="text-xs text-purple-600 font-medium">
                    Pico
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                {processedData.timeSeriesData.map((day, index) => {
                  const maxMessages = Math.max(
                    ...processedData.timeSeriesData.map((d) => d.messages)
                  );
                  const percentage = (day.messages / maxMessages) * 100;
                  const isToday =
                    index === processedData.timeSeriesData.length - 1;
                  const isHighActivity = day.messages > maxMessages * 0.7;

                  return (
                    <div key={day.date} className="group relative">
                      <div
                        className={`
                        rounded-xl p-4 transition-all duration-300 border
                        ${
                          isToday
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-md"
                            : isHighActivity
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-md"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }
                        hover:scale-[1.02] cursor-pointer
                      `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            {/* Day Indicator */}
                            <div
                              className={`
                              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                              ${
                                isToday
                                  ? "bg-blue-500 text-white"
                                  : isHighActivity
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-400 text-white"
                              }
                            `}
                            >
                              {new Date(day.date).getDate()}
                            </div>

                            {/* Date Info */}
                            <div>
                              <div
                                className={`font-semibold ${
                                  isToday ? "text-blue-900" : "text-gray-900"
                                }`}
                              >
                                {new Date(day.date).toLocaleDateString(
                                  "es-ES",
                                  {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "short",
                                  }
                                )}
                                {isToday && (
                                  <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                                    HOY
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {day.messages} mensaje
                                {day.messages !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </div>

                          {/* Activity Level Badge */}
                          <div
                            className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            ${
                              isHighActivity
                                ? "bg-green-100 text-green-800"
                                : day.messages > maxMessages * 0.4
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-600"
                            }
                          `}
                          >
                            {isHighActivity
                              ? "Alta"
                              : day.messages > maxMessages * 0.4
                              ? "Media"
                              : "Baja"}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`
                                h-2 rounded-full transition-all duration-500 ease-out
                                ${
                                  isToday
                                    ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                                    : isHighActivity
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                    : "bg-gradient-to-r from-gray-400 to-gray-500"
                                }
                              `}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          {/* Percentage Label */}
                          <div className="absolute right-0 -top-6 text-xs text-gray-500">
                            {Math.round(percentage)}%
                          </div>
                        </div>

                        {/* Trend Indicator */}
                        {index > 0 && (
                          <div className="absolute right-2 top-2">
                            {day.messages >
                            processedData.timeSeriesData[index - 1].messages ? (
                              <svg
                                className="w-4 h-4 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 17l9.2-9.2M17 17V8h-9"
                                />
                              </svg>
                            ) : day.messages <
                              processedData.timeSeriesData[index - 1]
                                .messages ? (
                              <svg
                                className="w-4 h-4 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 7l-9.2 9.2M7 7v9h9"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 12h14"
                                />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary Footer */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Período: {processedData.timeSeriesData.length} días
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Alta actividad
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Media
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      Baja
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-0">
                <h3 className="text-lg font-bold text-gray-900">
                  Distribución por Estado
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  {processedData.statusData.reduce(
                    (sum, item) => sum + item.value,
                    0
                  )}{" "}
                  total
                </div>
              </div>

              {/* Status Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {processedData.statusData.map((status, index) => {
                  const total = processedData.statusData.reduce(
                    (sum, item) => sum + item.value,
                    0
                  );
                  const percentage = ((status.value / total) * 100).toFixed(1);
                  const isHighest =
                    status.value ===
                    Math.max(...processedData.statusData.map((s) => s.value));

                  return (
                    <div
                      key={status.key}
                      className={`
                        relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2
                        ${
                          isHighest
                            ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg"
                            : "border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:shadow-md hover:border-gray-300"
                        }
                      `}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: status.color }}
                        />
                      </div>

                      {/* Status Icon */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                          style={{ backgroundColor: status.color }}
                        >
                          {status.label.charAt(0).toUpperCase()}
                        </div>

                        {isHighest && (
                          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            <svg
                              className="w-3 h-3"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            Mayor
                          </div>
                        )}
                      </div>

                      {/* Status Info */}
                      <div className="relative z-10">
                        <h4 className="font-bold text-lg text-gray-900 capitalize mb-1">
                          {status.label}
                        </h4>
                        <div className="flex items-end gap-2 mb-3">
                          <span
                            className="text-3xl font-bold"
                            style={{ color: status.color }}
                          >
                            {status.value}
                          </span>
                          <span className="text-sm text-gray-600 pb-1">
                            ({percentage}%)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className="h-2 rounded-full transition-all duration-700 ease-out"
                            style={{
                              backgroundColor: status.color,
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        {/* Status Description */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">
                            {status.value === 1
                              ? "1 elemento"
                              : `${status.value} elementos`}
                          </span>
                          <span
                            className="font-medium"
                            style={{ color: status.color }}
                          >
                            {percentage}% del total
                          </span>
                        </div>
                      </div>

                      {/* Decorative Elements */}
                      <div className="absolute top-2 right-2 opacity-20">
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                      </div>
                      <div className="absolute bottom-2 right-6 opacity-10">
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comparison Chart */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                  Comparación Visual
                </h4>
                <div className="flex items-end gap-2 h-20">
                  {processedData.statusData.map((status, index) => {
                    const maxValue = Math.max(
                      ...processedData.statusData.map((s) => s.value)
                    );
                    const height = (status.value / maxValue) * 100;

                    return (
                      <div
                        key={status.key}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div className="w-full flex flex-col items-center">
                          <div
                            className="w-full rounded-t-md transition-all duration-700 ease-out"
                            style={{
                              backgroundColor: status.color,
                              height: `${height}%`,
                              minHeight: "4px",
                            }}
                          />
                          <div className="mt-2 text-xs text-center">
                            <div className="font-semibold text-gray-900">
                              {status.value}
                            </div>
                            <div className="text-gray-500 capitalize truncate w-12">
                              {status.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">
                    {processedData.statusData.length}
                  </div>
                  <div className="text-xs text-gray-600">Estados</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {Math.round(
                      processedData.statusData.reduce(
                        (sum, item) => sum + item.value,
                        0
                      ) / processedData.statusData.length
                    )}
                  </div>
                  <div className="text-xs text-gray-600">Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {Math.max(...processedData.statusData.map((s) => s.value))}
                  </div>
                  <div className="text-xs text-gray-600">Máximo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppStatsDashboard;
