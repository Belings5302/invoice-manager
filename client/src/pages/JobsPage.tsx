import React, { useEffect, useState } from 'react';
import { Job, Client, Invoice } from '../types';
import { api } from '../utils/api';
import { formatDate, getStatusBadgeClass, formatStatusLabel } from '../utils/formatters';
import { JobModal } from '../components/jobs/JobModal';
import { Plus, Search, Filter, CheckCircle2, Clock, PlayCircle, Edit2, Trash2, RefreshCw } from 'lucide-react';

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsData, clientsData, invsData] = await Promise.all([
        api.get<Job[]>('/jobs'),
        api.get<Client[]>('/clients'),
        api.get<Invoice[]>('/invoices'),
      ]);
      setJobs(jobsData);
      setClients(clientsData);
      setInvoices(invsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this job record?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete job');
    }
  };

  const handleQuickComplete = async (job: Job) => {
    try {
      await api.put(`/jobs/${job.id}`, {
        ...job,
        status: 'completed',
        end_date: new Date().toISOString().split('T')[0],
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update job');
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.client_name && j.client_name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedCount = jobs.filter(j => j.status === 'completed').length;
  const inProgressCount = jobs.filter(j => j.status === 'in_progress').length;
  const pendingCount = jobs.filter(j => j.status === 'pending').length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h1>Job & Project Delivery Tracker</h1>
            <p>Monitor completed jobs, active engagements, and monthly delivery frequencies</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={loadData} className="btn btn-secondary btn-sm">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
              <Plus size={16} /> New Job
            </button>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)'
      }}>
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Completed Jobs</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginTop: '4px' }}>
            {completedCount}
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)' }}>
            <PlayCircle size={18} />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>In Progress</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginTop: '4px' }}>
            {inProgressCount}
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--info)' }}>
            <Clock size={18} />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Pending Starts</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginTop: '4px' }}>
            {pendingCount}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-4)' }}>
        <div className="filter-bar">
          <div className="search-input">
            <Search />
            <input
              type="text"
              placeholder="Search jobs by title or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses ({jobs.length})</option>
            <option value="completed">Completed ({completedCount})</option>
            <option value="in_progress">In Progress ({inProgressCount})</option>
            <option value="pending">Pending ({pendingCount})</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Client</th>
              <th>Linked Invoice</th>
              <th>Started</th>
              <th>Finished</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <div className="spinner" style={{ margin: '0 auto' }}></div>
                </td>
              </tr>
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                  No jobs found matching criteria.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{job.title}</div>
                    {job.description && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        {job.description}
                      </div>
                    )}
                  </td>
                  <td>{job.client_name}</td>
                  <td>
                    {job.invoice_number ? (
                      <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{job.invoice_number}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>{formatDate(job.start_date)}</td>
                  <td>{formatDate(job.end_date)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${getStatusBadgeClass(job.status)}`}>
                      <span className="badge-dot"></span>
                      {formatStatusLabel(job.status)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      {job.status !== 'completed' && (
                        <button
                          onClick={() => handleQuickComplete(job)}
                          className="btn btn-secondary btn-sm"
                          title="Mark as Completed"
                          style={{ padding: '6px 10px', fontSize: '11px' }}
                        >
                          <CheckCircle2 size={13} /> Complete
                        </button>
                      )}
                      <button
                        onClick={() => setEditingJob(job)}
                        className="btn btn-ghost btn-sm"
                        title="Edit"
                        style={{ padding: '6px' }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="btn btn-ghost btn-sm"
                        title="Delete"
                        style={{ padding: '6px', color: 'var(--danger)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {(showAddModal || editingJob) && (
        <JobModal
          job={editingJob}
          clients={clients}
          invoices={invoices}
          onClose={() => {
            setShowAddModal(false);
            setEditingJob(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingJob(null);
            loadData();
          }}
        />
      )}
    </div>
  );
};
