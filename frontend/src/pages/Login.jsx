import { useState } from "react";
import API from "../api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      console.log("Sending request:", {
        email: email.trim(),
        password: password.trim()
      });

      const res = await API.post("/login", {
        email: email.trim(),
        password: password.trim()
      });

      console.log("SUCCESS RESPONSE:", res.data);
      localStorage.setItem("token", res.data.token);
      alert("Login successful");
      onLogin();

    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("STATUS:", err.response?.status);
      console.log("BACKEND MESSAGE:", err.response?.data);

      alert(err.response?.data || "Login failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;