import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import RequireRole from "./components/guards/RequireRole";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import FacultyDashboard from "./pages/dashboards/FacultyDashboard";
import HODDashboard from "./pages/dashboards/HODDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import UserListPage from "./pages/users/UserListPage";
import UserFormPage from "./pages/users/UserFormPage";
import DepartmentListPage from "./pages/departments/DepartmentListPage";
import DepartmentFormPage from "./pages/departments/DepartmentFormPage";
import EventListPage from "./pages/events/EventListPage";
import EventFormPage from "./pages/events/EventFormPage";
import EventDetailPage from "./pages/events/EventDetailPage";
import EventApprovalsPage from "./pages/events/EventApprovalsPage";
import TaskListPage from "./pages/tasks/TaskListPage";
import TaskFormPage from "./pages/tasks/TaskFormPage";
import AttendancePage from "./pages/attendance/AttendancePage";
import ReportsPage from "./pages/reports/ReportsPage";
import CreateFacultyPage from "./pages/hod/CreateFacultyPage";
import MyEventsPage from "./pages/events/MyEventsPage";
import AllEventsPage from "./pages/events/AllEventsPage";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          {/* Redirect forgot-password to login page */}
          <Route
            path="/forgot-password"
            element={<Navigate to="/login" replace />}
          />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes - Student */}
          <Route
            path="/dashboard/student"
            element={
              <RequireRole allowedRoles={["student"]}>
                <DashboardLayout role="student" />
              </RequireRole>
            }
          >
            <Route index element={<StudentDashboard />} />
          </Route>

          {/* Protected Routes - Faculty */}
          <Route
            path="/dashboard/faculty"
            element={
              <RequireRole allowedRoles={["faculty"]}>
                <DashboardLayout role="faculty" />
              </RequireRole>
            }
          >
            <Route index element={<FacultyDashboard />} />
          </Route>

          {/* Protected Routes - HOD */}
          <Route
            path="/dashboard/hod"
            element={
              <RequireRole allowedRoles={["hod"]}>
                <DashboardLayout role="hod" />
              </RequireRole>
            }
          >
            <Route index element={<HODDashboard />} />
          </Route>

          {/* Protected Routes - Admin */}
          <Route
            path="/dashboard/admin"
            element={
              <RequireRole allowedRoles={["admin"]}>
                <DashboardLayout role="admin" />
              </RequireRole>
            }
          >
            <Route index element={<AdminDashboard />} />
          </Route>

          {/* Shared Protected Routes */}
          <Route
            element={
              <RequireRole>
                <DashboardLayout />
              </RequireRole>
            }
          >
            <Route path="/profile" element={<ProfilePage />} />

            {/* User Management */}
            <Route
              path="/users"
              element={
                <RequireRole allowedRoles={["admin", "hod"]}>
                  <UserListPage />
                </RequireRole>
              }
            />
            <Route
              path="/users/create"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <UserFormPage />
                </RequireRole>
              }
            />

            {/* Department Management */}
            <Route
              path="/departments"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <DepartmentListPage />
                </RequireRole>
              }
            />
            <Route
              path="/departments/create"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <DepartmentFormPage />
                </RequireRole>
              }
            />
            <Route
              path="/departments/:id/edit"
              element={
                <RequireRole allowedRoles={["admin"]}>
                  <DepartmentFormPage />
                </RequireRole>
              }
            />

            {/* Event Management */}
            <Route path="/events" element={<EventListPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route
              path="/my-events"
              element={
                <RequireRole allowedRoles={["student"]}>
                  <MyEventsPage />
                </RequireRole>
              }
            />
            <Route
              path="/create-event"
              element={
                <RequireRole allowedRoles={["faculty", "admin"]}>
                  <EventFormPage />
                </RequireRole>
              }
            />
            <Route
              path="/events/:id/edit"
              element={
                <RequireRole allowedRoles={["faculty", "admin"]}>
                  <EventFormPage />
                </RequireRole>
              }
            />
            <Route
              path="/event-approvals"
              element={
                <RequireRole allowedRoles={["hod", "admin"]}>
                  <EventApprovalsPage />
                </RequireRole>
              }
            />
            <Route
              path="/all-events"
              element={
                <RequireRole allowedRoles={["hod", "admin"]}>
                  <AllEventsPage />
                </RequireRole>
              }
            />

            {/* Volunteer Tasks */}
            <Route
              path="/tasks"
              element={
                <RequireRole allowedRoles={["faculty", "admin"]}>
                  <TaskListPage />
                </RequireRole>
              }
            />
            <Route
              path="/my-tasks"
              element={
                <RequireRole allowedRoles={["student"]}>
                  <TaskListPage />
                </RequireRole>
              }
            />
            <Route
              path="/tasks/create"
              element={
                <RequireRole allowedRoles={["faculty", "admin"]}>
                  <TaskFormPage />
                </RequireRole>
              }
            />
            <Route
              path="/tasks/:id/edit"
              element={
                <RequireRole allowedRoles={["faculty", "admin"]}>
                  <TaskFormPage />
                </RequireRole>
              }
            />

            {/* Attendance Management */}
            <Route
              path="/attendance"
              element={
                <RequireRole allowedRoles={["faculty", "hod", "admin"]}>
                  <EventListPage />
                </RequireRole>
              }
            />
            <Route
              path="/events/:eventId/attendance"
              element={
                <RequireRole allowedRoles={["faculty", "hod", "admin"]}>
                  <AttendancePage />
                </RequireRole>
              }
            />

            {/* Reports */}
            <Route
              path="/reports"
              element={
                <RequireRole allowedRoles={["hod", "admin"]}>
                  <ReportsPage />
                </RequireRole>
              }
            />

            {/* HOD Create Faculty */}
            <Route
              path="/create-faculty"
              element={
                <RequireRole allowedRoles={["hod"]}>
                  <CreateFacultyPage />
                </RequireRole>
              }
            />
          </Route>

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}
