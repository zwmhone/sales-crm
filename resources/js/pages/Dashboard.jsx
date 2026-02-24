import { useState, useEffect } from 'react';

// Helper functions for data transformation
const determineSlaStatus = (dueDate, status) => {
    const now = new Date();
    const due = new Date(dueDate);
    const hoursDiff = (due - now) / (1000 * 60 * 60);
    
    if (status !== 'Open' && status !== 'In Progress') return 'Active';
    if (due < now) return 'Breached';
    if (hoursDiff <= 24) return 'Due Soon';
    return 'Active';
};

const formatExceptionType = (taskType, dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const hoursDiff = Math.round((due - now) / (1000 * 60 * 60));
    const daysDiff = Math.round(hoursDiff / 24);
    
    if (hoursDiff < 0) {
        const overdueHours = Math.abs(hoursDiff);
        if (overdueHours < 24) return `${taskType} (${overdueHours}h overdue)`;
        return `${taskType} (${Math.abs(daysDiff)}d overdue)`;
    }
    if (hoursDiff <= 24) return `${taskType} (${hoursDiff}h left)`;
    return `${taskType} (${daysDiff}d left)`;
};

const getActionText = (taskType) => {
    const actionMap = {
        'Not Verified': 'Verify Now',
        'Not Confirmed': 'Log Confirmation',
        'No-show Not Retargeted': 'Start Retarget',
        'Follow-up Overdue': 'Send Follow-up',
        'Call Back': 'Make Call',
        'Email Follow-up': 'Send Email',
        'Quote Expiring': 'Renew Quote',
        'Manual': 'Take Action',
        'Meeting Follow-up': 'Follow Up',
        'Proposal Follow-up': 'Follow Up',
        'Payment Follow-up': 'Check Payment',
        'Compliance Request': 'Review',
        'Document Request': 'Upload Document'
    };
    return actionMap[taskType] || 'Take Action';
};

function StatusBadge({ status }) {
    const statusClass = status === 'Breached' ? 'breached' : 
                        status === 'Due Soon' ? 'due-soon' : 'active';
    
    return (
        <span className={`status-badge ${statusClass}`}>
            {status}
        </span>
    );
}

function Btn({ label, variant='primary', onClick, disabled = false }) {
    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`btn btn-${variant} ${disabled ? 'btn-disabled' : ''}`}
        >
            {label}
        </button>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="stat-item">
            <p>{label}</p>
            <p>{value ?? '—'}</p>
        </div>
    );
}

function TabBtn({ label, active, onClick, count }) {
    return (
        <button 
            onClick={onClick}
            className={`tab-btn ${active ? 'active' : ''}`}
        >
            {label}
        </button>
    );
}

// Skeleton Components
function Skeleton({ width = '100%', height = 16, radius = 6 }) {
    return (
        <div 
            className="skeleton-pulse"
            style={{
                width, 
                height, 
                borderRadius: radius,
            }} 
        />
    );
}

function StatCardSkeleton() {
    return (
        <div className="stat-item stat-item-skeleton">
            <Skeleton width="70%" height={13} />
            <Skeleton width="40%" height={28} radius={8} />
        </div>
    );
}

function SkeletonRow() {
    return (
        <tr style={{ borderBottom: '1px solid var(--brand-bg)' }}>
            <td style={{ padding: '16px' }}>
                <Skeleton width="80%" height={14} radius={4} />
                <div style={{ marginTop: 6 }}><Skeleton width="50%" height={11} radius={4} /></div>
            </td>
            <td style={{ padding: '16px' }}><Skeleton width="90%" height={14} radius={4} /></td>
            <td style={{ padding: '16px' }}><Skeleton width={80} height={26} radius={20} /></td>
            <td style={{ padding: '16px' }}><Skeleton width="70%" height={14} radius={4} /></td>
            <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Skeleton width={64} height={32} radius={6} />
                    <Skeleton width={100} height={32} radius={6} />
                </div>
            </td>
        </tr>
    );
}

function EmptyState({ filtered }) {
    return (
        <tr>
            <td colSpan={5}>
                <div className="empty-state">
                    <div style={{ fontSize: 40, marginBottom: 12 }}>
                        {filtered ? '🔍' : '✅'}
                    </div>
                    <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#475569' }}>
                        {filtered ? 'No exceptions match this filter' : 'No exceptions right now'}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                        {filtered ? 'Try selecting a different filter above.' : 'All SLA and SOP rules are currently being met.'}
                    </p>
                </div>
            </td>
        </tr>
    );
}

function ErrorState({ onRetry }) {
    return (
        <tr>
            <td colSpan={5}>
                <div className="empty-state">
                    <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                    <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#475569' }}>
                        Failed to load data
                    </p>
                    <button onClick={onRetry} className="btn btn-primary">
                        Try Again
                    </button>
                </div>
            </td>
        </tr>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [exceptions, setExceptions] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [actioningId, setActioningId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(false);

        try {
            // Fetch stats
            const statsResponse = await fetch('/api/dashboard/stats');
            if (!statsResponse.ok) throw new Error('Failed to fetch stats');
            const statsData = await statsResponse.json();

            // Fetch exceptions
            const exceptionsResponse = await fetch('/api/dashboard/exceptions');
            if (!exceptionsResponse.ok) throw new Error('Failed to fetch exceptions');
            const exceptionsData = await exceptionsResponse.json();

            // Process exceptions to add computed fields for display
            const processedExceptions = exceptionsData.map(ex => {
                // Build lead name from contact profile
                const leadName = ex.contact_profile ? 
                    `${ex.contact_profile.first_name || ''} ${ex.contact_profile.last_name || ''}`.trim() : 
                    'Unknown';
                
                // Build reference from deal profile
                const ref = ex.deal_profile?.id ? 
                    `Deal #${ex.deal_profile.id}` : 
                    'Unknown';
                
                // Build owner name from employee and BU
                const owner = ex.employee_ref ? 
                    `${ex.employee_ref.name || ''} - ${ex.bu_ref?.code || ''}`.trim() : 
                    'Unassigned';

                return {
                    id: ex.id,
                    lead_name: leadName,
                    ref: ref,
                    exception_type: formatExceptionType(ex.task_type, ex.due_date),
                    sla_status: determineSlaStatus(ex.due_date, ex.status),
                    owner: owner,
                    action: getActionText(ex.task_type),
                    // Keep original data for action handling
                    task_id: ex.id,
                    task_type: ex.task_type,
                    deal_id: ex.deal_profile?.id,
                    contact_id: ex.contact_profile?.id
                };
            });

            setStats(statsData);
            setExceptions(processedExceptions);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(true);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = filter === 'All' 
        ? exceptions 
        : exceptions.filter(e => e.sla_status === filter);

    const counts = {
        All: exceptions.length,
        Breached: exceptions.filter(e => e.sla_status === 'Breached').length,
        'Due Soon': exceptions.filter(e => e.sla_status === 'Due Soon').length,
    };

    const handleOpen = (row) => {
        // Navigate to deal detail page
        // Replace this with actual navigation for details page 
        window.open(`/deals/${row.deal_id}`, '_blank');
    };

    const handleAction = async (row) => {
        setActioningId(row.id);
        
        try {
            const response = await fetch(`/api/follow-up-tasks/${row.task_id}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: row.action,
                    task_type: row.task_type
                }),
            });

            if (!response.ok) throw new Error('Failed to perform action');
            
            // Refresh data after successful action
            await fetchData();
            
        } catch (err) {
            console.error('Error performing action:', err);
            alert('Failed to perform action. Please try again.');
        } finally {
            setActioningId(null);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Stats Card */}
            <div className="stats-card">
                <h1>SOP Control Center</h1>
                <div className="stats-grid">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
                    ) : (
                        <>
                            <StatCard label="Active Leads" value={stats?.active_leads} />
                            <StatCard label="Meetings Scheduled" value={stats?.meetings_scheduled} />
                            <StatCard label="No-Shows" value={stats?.no_shows} />
                            <StatCard label="Deals in Pipeline" value={stats?.deals_in_pipeline} />
                            <StatCard label="Closed Won" value={stats?.closed_won} />
                        </>
                    )}
                </div>
            </div>

            {/* Exceptions Table Card */}
            <div className="exceptions-card">
                <div className="exceptions-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <h2>SLA / SOP Exceptions</h2>
                        {!loading && !error && (
                            <span className={`exceptions-total ${counts[filter] > 0 ? 'exceptions-total--alert' : 'exceptions-total--ok'}`}>
                                {counts[filter]} total
                            </span>
                        )}
                    </div>
                    <div className="tab-group">
                        {['All', 'Breached', 'Due Soon'].map(f => (
                            <TabBtn 
                                key={f} 
                                label={f} 
                                active={filter === f} 
                                onClick={() => setFilter(f)}
                                count={loading || error ? undefined : counts[f]}
                            />
                        ))}
                        <button 
                            onClick={fetchData} 
                            className="btn-refresh" 
                            title="Refresh"
                            disabled={loading}
                        >
                            ↻
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="exceptions-table">
                        <thead>
                            <tr>
                                <th>Lead/Deal</th>
                                <th>Exception Type</th>
                                <th>SLA Status</th>
                                <th>Owner</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Loading state */}
                            {loading && Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)}

                            {/* Error state */}
                            {!loading && error && <ErrorState onRetry={fetchData} />}

                            {/* Empty states */}
                            {!loading && !error && exceptions.length === 0 && <EmptyState filtered={false} />}
                            {!loading && !error && exceptions.length > 0 && filtered.length === 0 && <EmptyState filtered={true} />}

                            {/* Data ready */}
                            {!loading && !error && filtered.map((row) => (
                                <tr key={row.id}>
                                    <td>
                                        <p className="lead-info">{row.lead_name}</p>
                                        <p className="lead-ref">{row.ref}</p>
                                    </td>
                                    <td className="exception-type">{row.exception_type}</td>
                                    <td><StatusBadge status={row.sla_status} /></td>
                                    <td className="owner-name">{row.owner}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <Btn 
                                                label="Open" 
                                                variant="primary" 
                                                onClick={() => handleOpen(row)} 
                                                disabled={actioningId === row.id}
                                            />
                                            <Btn 
                                                label={actioningId === row.id ? 'Working...' : row.action} 
                                                variant="accent" 
                                                onClick={() => handleAction(row)}
                                                disabled={actioningId === row.id}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer count */}
                {!loading && !error && filtered.length > 0 && (
                    <p className="table-footer">
                        Showing {filtered.length} of {exceptions.length} exceptions
                    </p>
                )}
            </div>
        </div>
    );
}
