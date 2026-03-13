import { Routes, Route, useNavigate, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./styles.css";

const API = "https://internal-polling-system.onrender.com";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!token) return null;

  return (
    <div className="navbar">
      <div onClick={() => navigate("/dashboard")}>
        Internal Polling System
      </div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function Home() {
  return (
    <div className="hero">
      <h1>Internal Polling System</h1>
      <p>Secure • Role-Based • Real-Time Polling Platform</p>
      <Link to="/login">
        <button>Login</button>
      </Link>
      <br /><br />
      <Link to="/register">
        <button>Register</button>
      </Link>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
      navigate("/login");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Create Account</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Welcome Back</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

function CreatePoll({ refresh }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const token = localStorage.getItem("token");

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (value, index) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API}/api/polls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question, options }),
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
      setQuestion("");
      setOptions(["", ""]);
      refresh();
    }
  };

  return (
    <div className="card">
      <h2>Create New Poll</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Poll Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        {options.map((opt, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Option ${index + 1}`}
            value={opt}
            onChange={(e) => handleOptionChange(e.target.value, index)}
          />
        ))}
        <button type="button" onClick={addOption}>
          Add Another Option
        </button>
        <br />
        <button type="submit">Publish Poll</button>
      </form>
    </div>
  );
}

function Dashboard() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" />;

  const [polls, setPolls] = useState([]);
  const user = JSON.parse(atob(token.split(".")[1]));

  const fetchPolls = async () => {
    const response = await fetch(`${API}/api/polls`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (response.ok) setPolls(data);
  };

  const vote = async (pollId, index) => {
    const response = await fetch(`${API}/api/polls/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pollId,
        selectedOptionIndex: index,
      }),
    });

    const data = await response.json();
    alert(data.message);
    fetchPolls();
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <div className="container">
      <h1 style={{ marginBottom: "40px" }}>Dashboard</h1>

      {user.role === "ADMIN" && <CreatePoll refresh={fetchPolls} />}

      {polls.map((poll) => (
        <div key={poll._id} className="card">
          <h3>{poll.question}</h3>

          {poll.options.map((option, index) => {
            const totalVotes = poll.options.reduce(
              (sum, o) => sum + o.votes,
              0
            );

            const percentage = totalVotes
              ? ((option.votes / totalVotes) * 100).toFixed(0)
              : 0;

            return (
              <div key={index} style={{ marginBottom: "20px" }}>
                <div
                  style={{ cursor: "pointer", fontWeight: 500 }}
                  onClick={() => vote(poll._id, index)}
                >
                  {option.text} ({option.votes})
                </div>

                <div className="vote-bar">
                  <div
                    className="vote-fill"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App;