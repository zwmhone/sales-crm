import { useState, useEffect } from 'react';

// ── Mock data 
const MOCK_STATS = {
    active_leads: 24, meetings_scheduled: 12,
    no_shows: 3, deals_in_pipeline: 36, closed_won: 12,
};

const MOCK_EXCEPTIONS = [
    { id:1, lead_name:'John Smith',   ref:'Lead #1245', exception_type:'Not Verified (12h)',           sla_status:'Breached', owner:'DBD - Team A',       action:'Verify Now'       },
    { id:2, lead_name:'Jennifer Lee', ref:'Lead #1248', exception_type:'Not Confirmed (24h)',          sla_status:'Due Soon', owner:'Sales Rep - Mike',   action:'Log Confirmation' },
    { id:3, lead_name:'Emma Brown',   ref:'Deal #895',  exception_type:'No-show Not Retargeted (48h)', sla_status:'Breached', owner:'Sales Rep - Sara',   action:'Start Retarget'   },
    { id:4, lead_name:'Olivia Jones', ref:'Deal #645',  exception_type:'Follow-up Overdue (2h)',       sla_status:'Breached', owner:'Sales Rep - Daniel', action:'Send Follow-up'   },
    { id:5, lead_name:'Michael Davis', ref:'Deal #723',  exception_type:'Follow-up Overdue (1h)',       sla_status:'Due Soon', owner:'Sales Rep - Lisa', action:'Send Follow-up'   },
    { id:6, lead_name:'Sophia Wilson', ref:'Lead #1289', exception_type:'Not Verified (6h)',            sla_status:'Due Soon', owner:'DBD - Team B',       action:'Verify Now'       },
];

function StatusBadge({ status }) {
    const statusClass = status === 'Breached' ? 'breached' : 
                        status === 'Due Soon' ? 'due-soon' : 'active';
    
    return (
        <span className={`status-badge ${statusClass}`}>
            {status}
        </span>
    );
}

function Btn({ label, variant='primary', onClick }) {
    return (
        <button 
            onClick={onClick}
            className={`btn btn-${variant}`}
        >
            {label}
        </button>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="stat-item">
            <p>{label}</p>
            <p>{value}</p>
        </div>
    );
}

function TabBtn({ label, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            className={`tab-btn ${active ? 'active' : ''}`}
        >
            {label}
        </button>
    );
}

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [exceptions, setExceptions] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setStats(MOCK_STATS);
            setExceptions(MOCK_EXCEPTIONS);
            setLoading(false);
        }, 400);
    }, []);

    const filtered = filter === 'All' ? exceptions : exceptions.filter(e => e.sla_status === filter);

    const handleOpen = (row) => {
        alert(`Opening ${row.ref}`);
    };

    const handleAction = (row) => {
        alert(`${row.action} → ${row.lead_name}`);
    };

    if (loading) return (
        <div className="loading-state">
            Loading...
        </div>
    );

    return (
        <div className="dashboard-container">
            {/* Stats Card */}
            <div className="stats-card">
                <h1>SOP Control Center</h1>
                <div className="stats-grid">
                    <StatCard label="Active Leads" value={stats.active_leads} />
                    <StatCard label="Meetings Scheduled (Open)" value={stats.meetings_scheduled} />
                    <StatCard label="No-Shows" value={stats.no_shows} />
                    <StatCard label="Deals in Pipeline" value={stats.deals_in_pipeline} />
                    <StatCard label="Closed Won" value={stats.closed_won} />
                </div>
            </div>

            {/* Exceptions Table Card */}
            <div className="exceptions-card">
                <div className="exceptions-header">
                    <h2>SLA / SOP Exceptions</h2>
                    <div className="tab-group">
                        {['All','Breached','Due Soon'].map(f => (
                            <TabBtn key={f} label={f} active={filter===f} onClick={()=>setFilter(f)} />
                        ))}
                    </div>
                </div>

                <div style={{ overflowX:'auto' }}>
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
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="empty-state">
                                        No exceptions found.
                                    </td>
                                </tr>
                            ) : filtered.map((row) => (
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
                                            <Btn label="Open" variant="primary" onClick={()=>handleOpen(row)} />
                                            <Btn label={row.action} variant="accent" onClick={()=>handleAction(row)} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}