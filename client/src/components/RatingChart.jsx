import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const pieColors = ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1"];

// reusable chart card
const RatingChart = ({
  title,
  type = "bar",
  data = [],
  dataKey,
  nameKey,
  seriesName,
  yDomain,
}) => {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header">
        <h6 className="mb-0">{title}</h6>
      </div>

      <div className="card-body" style={{ height: "300px" }}>
        {data.length === 0 ? (
          <p className="text-center text-muted mt-5">No data available</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {type === "pie" ? (
              <PieChart>
                <Pie
                  data={data}
                  dataKey={dataKey}
                  nameKey={nameKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${entry[nameKey]}`}
                      fill={pieColors[index % pieColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : type === "line" ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={nameKey} />
                <YAxis domain={yDomain || [0, "auto"]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={dataKey} name={seriesName} />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={nameKey} />
                <YAxis domain={yDomain || [0, "auto"]} />
                <Tooltip />
                <Legend />
                <Bar dataKey={dataKey} name={seriesName} />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RatingChart;
