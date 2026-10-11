import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Image as ImageIcon, 
  AlertTriangle, 
  ClipboardList, 
  Trash2, 
  Search, 
  CheckCircle, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { Post, UserProfile, ReportItem, AdminAuditLog } from '../types';
import { 
  getAdminReports, 
  updateReportStatus, 
  getAllUsersForAdmin, 
  deletePost, 
  getAdminAuditLogs 
} from '../services/databaseService';

interface AdminPageProps {
  currentUser: UserProfile;
  isAdmin: boolean;
  posts: Post[];
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  isAdmin,
  posts
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'reports' | 'posts' | 'users' | 'logs' | 'setup'>('overview');
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedUid, setCopiedUid] = useState<boolean>(false);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [rep, usr, aud] = await Promise.all([
          getAdminReports(),
          getAllUsersForAdmin(),
          getAdminAuditLogs()
        ]);
        setReports(rep);
        setUsers(usr);
        setLogs(aud);
      } catch (err) {
        console.error("Admin fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAdmin]);

  const handleCopyUid = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUser.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleModerateReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await updateReportStatus(reportId, status, currentUser.uid);
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status } : r));
    } catch (err) {
      alert("Failed to update report: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeletePostAdmin = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post as Administrator?")) return;
    try {
      await deletePost(postId, currentUser.uid, true);
      alert("Post removed successfully.");
    } catch (err) {
      alert("Deletion failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // If not admin, display secure barrier and setup instructions
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/60 p-8 shadow-lg">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Access Restricted — Administrator Verification Required
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            This dashboard is protected by Firebase Realtime Database Security Rules at <code className="text-indigo-600 font-mono">/admins/{'{uid}'}</code>.
            Only accounts explicitly authorized in the database can view or moderate PhotoNest.
          </p>

          {/* UID Box for Owner */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Current Firebase Auth UID:
            </p>
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl font-mono text-xs border border-slate-200 dark:border-slate-800">
              <span className="truncate text-indigo-600 dark:text-indigo-400 font-bold">
                {currentUser.uid}
              </span>
              <button
                onClick={handleCopyUid}
                className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 shrink-0 font-sans"
              >
                {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copiedUid ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Authorization instructions */}
          <div className="mt-6 text-left space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <p className="font-bold text-slate-900 dark:text-slate-100">How to authorize the Owner UID:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Open the Firebase Console for project <code className="font-mono text-indigo-500">saddam-premium-hub</code>.</li>
              <li>Go to <strong>Realtime Database</strong> &gt; <strong>Data</strong>.</li>
              <li>Create or expand the path: <code className="font-mono text-indigo-500">admins / {currentUser.uid}</code>.</li>
              <li>Set its value to boolean: <code className="font-mono text-indigo-500">true</code>.</li>
              <li>Refresh this page, and your Admin Dashboard will unlock immediately!</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const pendingReports = reports.filter((r) => r.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Administrator
            </span>
            <span className="text-xs text-slate-400">Owner Access Granted</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            PhotoNest Moderation & Oversight
          </h1>
        </div>

        {/* Navigation tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'overview'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection('reports')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
              activeSection === 'reports'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Reports
            {pendingReports.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full">
                {pendingReports.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('posts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'posts'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveSection('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'users'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveSection('logs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'logs'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {loading && (
        <div className="py-20 text-center text-slate-400">
          <p className="text-xs">Loading secure moderation data...</p>
        </div>
      )}

      {!loading && activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Users</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{users.length}</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Published Photos</span>
                <ImageIcon className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{posts.length}</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Active Reports</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-amber-500">{pendingReports.length}</p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Audit Logs</span>
                <ClipboardList className="w-4 h-4 text-violet-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{logs.length}</p>
            </div>
          </div>

          {/* Pending Reports Callout */}
          {pendingReports.length > 0 && (
            <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    {pendingReports.length} content reports require your attention
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Review reported posts and take appropriate action.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSection('reports')}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs"
              >
                Review Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reports Section */}
      {!loading && activeSection === 'reports' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Reported Content Queue ({reports.length})
          </h3>
          {reports.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-80" />
              <p className="text-sm font-semibold">No reports</p>
              <p className="text-xs mt-0.5">The community feed is clean and compliant.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    {rep.postImageUrl && (
                      <img
                        src={rep.postImageUrl}
                        alt="Reported content"
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-rose-600 dark:text-rose-400">
                          {rep.reason}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          rep.status === 'pending'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                            : rep.status === 'resolved'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {rep.status.toUpperCase()}
                        </span>
                      </div>
                      {rep.details && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">"{rep.details}"</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        Reported by: {rep.reportedByEmail} • {new Date(rep.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {rep.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleModerateReport(rep.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => {
                          handleDeletePostAdmin(rep.postId);
                          handleModerateReport(rep.id, 'resolved');
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                      >
                        Remove Post
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Posts Section */}
      {!loading && activeSection === 'posts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Manage Community Posts ({posts.length})
            </h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search post caption or author..."
              className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {posts
              .filter((p) => p.caption?.toLowerCase().includes(searchTerm.toLowerCase()) || p.authorName?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((post) => (
                <div key={post.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div>
                    <img src={post.imageUrl} alt={post.caption} className="w-full h-40 object-cover" />
                    <div className="p-3">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {post.authorName} <span className="text-slate-400 font-normal">@{post.authorUsername}</span>
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                        {post.caption || "No caption"}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDeletePostAdmin(post.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Delete as Administrator"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Users Section */}
      {!loading && activeSection === 'users' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Registered Users ({users.length})
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">UID</th>
                    <th className="p-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 flex items-center gap-2">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`}
                          alt={u.displayName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{u.displayName}</p>
                          <p className="text-[11px] text-slate-400">@{u.username}</p>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{u.email}</td>
                      <td className="p-3 text-slate-400 font-mono text-[10px]">{u.uid}</td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Section */}
      {!loading && activeSection === 'logs' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Administrator Action Audit Trail ({logs.length})
          </h3>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target ID</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-500">{log.targetId}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
