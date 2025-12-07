import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave, FiDownload } from "react-icons/fi";

const AttendancePage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
  }, [eventId]);

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [eventRes, participantsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://localhost:5000/api/events/${eventId}/participants`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setEvent(eventRes.data);
      setParticipants(participantsRes.data);

      // Map attendance using participation _id
      const attendanceMap = {};
      participantsRes.data.forEach((p) => {
        attendanceMap[p._id] = p.status === "Attended";
      });
      setAttendance(attendanceMap);
    } catch (err) {
      console.error("Failed to fetch attendance data", err);
      alert("Failed to load attendance data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (participantId, present) => {
    setAttendance({ ...attendance, [participantId]: present });
  };

  const handleSelectAll = (present) => {
    const updatedAttendance = {};
    participants.forEach((p) => {
      updatedAttendance[p._id] = present;
    });
    setAttendance(updatedAttendance);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/events/${eventId}/attendance`,
        { attendance },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Attendance saved successfully!");
    } catch (err) {
      alert("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/events/${eventId}/attendance/report`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `attendance_${eventId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download report");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  const presentCount = Object.values(attendance).filter((a) => a).length;
  const absentCount = participants.length - presentCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/events/${eventId}`)}
          className="text-teal-400 hover:text-teal-300 flex items-center gap-2"
        >
          <FiArrowLeft /> Back to Event
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">{event?.title}</h1>
        <p className="text-gray-400">Attendance Management</p>

        <div className="mt-6 flex flex-wrap gap-4">
          <div className="bg-green-900/50 px-6 py-3 rounded-lg">
            <p className="text-green-300 text-sm">Present</p>
            <p className="text-2xl font-bold text-white">{presentCount}</p>
          </div>
          <div className="bg-red-900/50 px-6 py-3 rounded-lg">
            <p className="text-red-300 text-sm">Absent</p>
            <p className="text-2xl font-bold text-white">{absentCount}</p>
          </div>
          <div className="bg-blue-900/50 px-6 py-3 rounded-lg">
            <p className="text-blue-300 text-sm">Total</p>
            <p className="text-2xl font-bold text-white">
              {participants.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-white">Mark Attendance</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleSelectAll(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleSelectAll(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-3 px-4 text-gray-300">Name</th>
                <th className="py-3 px-4 text-gray-300 hidden md:table-cell">
                  Email
                </th>
                <th className="py-3 px-4 text-gray-300 hidden sm:table-cell">
                  Department
                </th>
                <th className="py-3 px-4 text-gray-300">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant) => (
                <tr
                  key={participant._id}
                  className="border-t border-gray-700 hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4 text-white">
                    {participant.studentName}
                  </td>
                  <td className="py-3 px-4 text-gray-400 hidden md:table-cell">
                    {participant.studentEmail}
                  </td>
                  <td className="py-3 px-4 text-gray-400 hidden sm:table-cell">
                    {participant.eventTitle}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`attendance-${participant._id}`}
                          checked={attendance[participant._id] === true}
                          onChange={() =>
                            handleAttendanceChange(participant._id, true)
                          }
                          className="mr-2"
                        />
                        <span className="text-green-300">Present</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={`attendance-${participant._id}`}
                          checked={attendance[participant._id] === false}
                          onChange={() =>
                            handleAttendanceChange(participant._id, false)
                          }
                          className="mr-2"
                        />
                        <span className="text-red-300">Absent</span>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-teal-500 hover:bg-teal-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center disabled:opacity-50"
          >
            <FiSave /> {saving ? "Saving..." : "Save Attendance"}
          </button>
          <button
            onClick={handleDownloadReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center"
          >
            <FiDownload /> Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
