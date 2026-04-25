import { useState, useEffect } from "react";
import API from "../api";

function Dashboard() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [links, setLinks] = useState([]);

  const token = localStorage.getItem("token");

  const fetchLinks = async () => {
    try {
      const res = await API.get("/my-links", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setLinks(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // 🔹 Shorten URL
  const handleShorten = async () => {
    try {
      const res = await API.post(
        "/shorten",
        { longUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setShortUrl(res.data.shortUrl);
      setQrCode(res.data.qrCode);

      fetchLinks(); // refresh list

    } catch (err) {
      alert("Error shortening URL");
      console.log(err.response?.data);
    }
  };

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">URL Shortener</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Shorten Box */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6">
        <input
          type="text"
          placeholder="Enter long URL"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          className="w-full p-3 border rounded mb-4"
        />

        <button
          onClick={handleShorten}
          className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
        >
          Shorten URL
        </button>

        {/* Result */}
        {shortUrl && (
          <div className="mt-4 text-center">
            <p className="text-green-600 font-semibold">Short URL:</p>
            <a
              href={shortUrl}
              target="_blank"
              className="text-blue-500 underline"
            >
              {shortUrl}
            </a>

            {/* QR Code */}
            {qrCode && (
              <div className="mt-4 flex justify-center">
                <img src={qrCode} alt="QR Code" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* My Links */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4">My Links</h2>

        {links.length === 0 ? (
          <p>No links yet</p>
        ) : (
          <div className="space-y-3">
            {links.map((link, index) => (
              <div
                key={index}
                className="p-3 border rounded flex justify-between"
              >
                <a
                  href={`http://localhost:3000/${link.short_code}`}
                  target="_blank"
                  className="text-blue-500"
                >
                  {link.short_code}
                </a>

                <span className="text-gray-500 truncate max-w-[200px]">
                  {link.long_url}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;