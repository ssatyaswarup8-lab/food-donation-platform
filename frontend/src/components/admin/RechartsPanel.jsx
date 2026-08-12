import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = ["#2e7d32", "#ff8f00", "#1565c0", "#d32f2f", "#6a1b9a"];

export const DailyLineChart = ({ data }) => (
  <div style={{ width: "100%", height: 260, marginBottom: 24 }}>
    <h4>Daily Donations (Last 30 Days)</h4>
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="totalListings" stroke="#2e7d32" name="Listings" />
        <Line type="monotone" dataKey="totalQuantity" stroke="#ff8f00" name="Quantity" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const MonthlyBarChart = ({ data }) => (
  <div style={{ width: "100%", height: 260, marginBottom: 24 }}>
    <h4>Monthly Donations (Last 12 Months)</h4>
    <ResponsiveContainer>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalListings" fill="#2e7d32" name="Listings" />
        <Bar dataKey="totalQuantity" fill="#ff8f00" name="Quantity" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const CategoryPieChart = ({ data }) => (
  <div style={{ width: "100%", height: 280, marginBottom: 24 }}>
    <h4>Food Category Breakdown</h4>
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="_id"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={(entry) => entry._id}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);