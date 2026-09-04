import { employees } from "./employees.js";

const byDept = employees.reduce((acc, person) => {
  acc[person.department] = (acc[person.department] || 0) + 1;
  return acc;
}, {});

export const stats = {
  total: employees.length,
  active: employees.filter((p) => p.status === "active").length,
  onLeave: employees.filter((p) => p.status === "leave").length,
  inactive: employees.filter((p) => p.status === "inactive").length,
  departments: Object.keys(byDept).length,
};

export const deptBars = Object.entries(byDept)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count);

export const statusPie = [
  { name: "In office / remote", value: stats.active, fill: "#3D5A45" },
  { name: "On leave", value: stats.onLeave, fill: "#C9A27C" },
  { name: "Offboarded", value: stats.inactive, fill: "#B85C38" },
];

export const headcountByYear = [
  { year: "2020", people: 9 },
  { year: "2021", people: 11 },
  { year: "2022", people: 12 },
  { year: "2023", people: 14 },
  { year: "2024", people: 15 },
  { year: "2026", people: 14 },
];
