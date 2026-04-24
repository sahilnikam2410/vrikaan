export default function Dashboard() {
  return (
    <div
      style={{
        background: "#06080c",
        minHeight: "100vh",
        color: "#e8ede6",
        padding: "40px",
      }}
    >
      <h1>Vrikaan Security Dashboard</h1>

      <p>Your cyber protection overview.</p>

      <ul>
        <li>Threats blocked: 12</li>
        <li>Alerts today: 3</li>
        <li>Security score: 78</li>
      </ul>
    </div>
  );
}