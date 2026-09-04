import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "../components/StatCard.jsx";
import { deptBars, headcountByYear, stats, statusPie } from "../data/analytics.js";

const tooltipStyle = {
  background: "var(--panel)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  color: "var(--ink)",
  fontSize: 13,
};

export default function Analytics() {
  return (
    <div className="pulse">
      <div className="stat-row">
        <StatCard label="On the books" value={stats.total} note="including leave + offboarded" />
        <StatCard
          label="Active"
          value={stats.active}
          note={`${stats.onLeave} on leave right now`}
        />
        <StatCard label="Shops" value={stats.departments} note="People through Sales" />
      </div>

      <div className="chart-grid">
        <section className="panel">
          <header className="panel-head">
            <h2>Heads by shop</h2>
            <p>Engineering is still the loudest room. No surprise.</p>
          </header>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptBars} barSize={28}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--wash)" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#B85C38" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <header className="panel-head">
            <h2>Who’s actually here</h2>
            <p>Karthik’s on leave. Aditi’s gone. Everyone else is on the roster.</p>
          </header>
          <div className="chart-box pie-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusPie}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                  stroke="none"
                >
                  {statusPie.map((slice) => (
                    <Cell key={slice.name} fill={slice.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <ul className="legend">
              {statusPie.map((slice) => (
                <li key={slice.name}>
                  <i style={{ background: slice.fill }} />
                  {slice.name}
                  <b>{slice.value}</b>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section className="panel">
        <header className="panel-head">
          <h2>Headcount, roughly</h2>
          <p>We shrank a little this year. Finance already knows.</p>
        </header>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={headcountByYear} barSize={36}>
              <CartesianGrid stroke="var(--line)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: "var(--mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "var(--mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--wash)" }} />
              <Bar dataKey="people" radius={[6, 6, 0, 0]} fill="#3D5A45" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
