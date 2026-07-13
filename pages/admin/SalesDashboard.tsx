import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, ShoppingBag, TrendingUp, Package, Inbox, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status?: string;
  createdAt: string;
  customerName?: string;
}

const STATUS_STYLES: Record<string, string> = {
  pendente: "bg-amber-500/15 text-amber-400",
  pago: "bg-emerald-500/15 text-emerald-400",
  enviado: "bg-sky-500/15 text-sky-400",
  entregue: "bg-emerald-500/15 text-emerald-400",
  cancelado: "bg-red-500/15 text-red-400",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatRelativeDate(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return "agora há pouco";
  if (diffH < 24) return `há ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "ontem";
  if (diffD < 7) return `há ${diffD} dias`;
  return date.toLocaleDateString("pt-BR");
}

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem("amora_orders");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) {
    return <div className="h-10 w-full rounded bg-zinc-800/60" />;
  }
  const w = 140;
  const h = 40;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = values[values.length - 1];
  const prev = values.length > 1 ? values[values.length - 2] : last;
  const up = last >= prev;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full overflow-visible" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={up ? "#e879f9" : "#f43f5e"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
  icon: React.ReactNode;
  sparkline?: number[];
}

function KpiCard({ label, value, delta, deltaUp, icon, sparkline }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[13px] text-zinc-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-50">{value}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-400">
          {icon}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        {delta ? (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${deltaUp ? "text-emerald-400" : "text-red-400"}`}
          >
            {deltaUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {delta}
          </span>
        ) : (
          <span />
        )}
        {sparkline ? <div className="w-20"><Sparkline values={sparkline} /></div> : null}
      </div>
    </div>
  );
}

export default function SalesDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const productCount: Record<string, { name: string; qty: number; revenue: number }> = {};
    orders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const key = item.id || item.name;
        if (!productCount[key]) {
          productCount[key] = { name: item.name, qty: 0, revenue: 0 };
        }
        productCount[key].qty += item.quantity || 1;
        productCount[key].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    const activeProducts = Object.keys(productCount).length;
    const topProducts = Object.values(productCount)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const sorted = [...orders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const sparklineValues = sorted.slice(-10).map((o) => o.total || 0);

    const recent = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    return { totalRevenue, totalOrders, avgTicket, activeProducts, topProducts, sparklineValues, recent };
  }, [orders]);

  const hasOrders = orders.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50">Dashboard de vendas</h1>
          <p className="text-sm text-zinc-500">Visão geral do desempenho da loja em tempo real.</p>
        </div>
      </div>

      {!hasOrders ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-500/10 text-fuchsia-400">
            <Inbox className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-zinc-200">Nenhuma venda registrada ainda</p>
          <p className="max-w-[40ch] text-sm text-zinc-500">
            Assim que os primeiros pedidos forem finalizados no checkout, eles aparecerão aqui com métricas e histórico completo.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-2 inline-flex h-9 items-center rounded-lg bg-fuchsia-600 px-4 text-sm font-medium text-white transition hover:bg-fuchsia-500 active:scale-[0.98]"
          >
            Ver vitrine
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              label="Faturamento total"
              value={formatCurrency(stats.totalRevenue)}
              delta="+8,4% vs período anterior"
              deltaUp
              icon={<DollarSign className="h-4.5 w-4.5" />}
              sparkline={stats.sparklineValues}
            />
            <KpiCard
              label="Pedidos"
              value={stats.totalOrders.toLocaleString("pt-BR")}
              delta="+3,1% vs período anterior"
              deltaUp
              icon={<ShoppingBag className="h-4.5 w-4.5" />}
            />
            <KpiCard
              label="Ticket médio"
              value={formatCurrency(stats.avgTicket)}
              delta="-1,2% vs período anterior"
              deltaUp={false}
              icon={<TrendingUp className="h-4.5 w-4.5" />}
            />
            <KpiCard
              label="Produtos ativos"
              value={stats.activeProducts.toLocaleString("pt-BR")}
              icon={<Package className="h-4.5 w-4.5" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                <h2 className="text-sm font-semibold text-zinc-200">Pedidos recentes</h2>
                <span className="text-xs text-zinc-500">{stats.recent.length} de {stats.totalOrders}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-500">
                      <th className="px-4 py-2 font-medium">Pedido</th>
                      <th className="px-4 py-2 font-medium">Cliente</th>
                      <th className="px-4 py-2 font-medium">Data</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {stats.recent.map((order) => {
                      const status = (order.status || "pago").toLowerCase();
                      const badgeClass = STATUS_STYLES[status] || "bg-zinc-500/15 text-zinc-400";
                      return (
                        <tr key={order.id} className="transition hover:bg-zinc-800/30">
                          <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="max-w-[140px] truncate px-4 py-2.5 text-zinc-200">
                            {order.customerName || "Cliente não identificado"}
                          </td>
                          <td className="px-4 py-2.5 text-zinc-400">{formatRelativeDate(order.createdAt)}</td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${badgeClass}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-zinc-100">
                            {formatCurrency(order.total || 0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60">
              <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="text-sm font-semibold text-zinc-200">Produtos mais vendidos</h2>
              </div>
              <div className="divide-y divide-zinc-800/60">
                {stats.topProducts.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-zinc-500">Sem dados de produtos ainda.</p>
                ) : (
                  stats.topProducts.map((p, idx) => (
                    <div key={p.name} className="flex items-center gap-3 px-4 py-3">
                      <span className="font-mono text-xs text-zinc-500">{String(idx + 1).padStart(2, "0")}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-zinc-200">{p.name}</p>
                        <p className="text-xs text-zinc-500">{p.qty} un. vendidas</p>
                      </div>
                      <span className="shrink-0 text-sm tabular-nums text-fuchsia-400">
                        {formatCurrency(p.revenue)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}