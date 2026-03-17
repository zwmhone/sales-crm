import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CompanyListPage() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    async function loadCompanies() {
        setLoading(true);

        const res = await axios.get("/api/companies");

        setRows(res.data.data || []);
        setLoading(false);
    }

    useEffect(() => {
        loadCompanies();
    }, []);

    return (
        <div className="page">
            <style>{`

.page{
background:#ebe6df;
padding:40px;
min-height:100vh;
font-family:Arial;
}

.container{
background:white;
padding:30px;
border-radius:14px;
box-shadow:0 2px 6px rgba(0,0,0,0.05);
}

.header{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:20px;
}

.title{
font-size:20px;
font-weight:700;
}

.export-btn{
background:#f3f4f6;
border:1px solid #ddd;
padding:6px 14px;
border-radius:6px;
font-size:12px;
cursor:pointer;
}

.filters{
display:flex;
gap:10px;
margin-bottom:20px;
flex-wrap:wrap;
}

.filter{
background:#f5f6f7;
border:1px solid #ddd;
padding:6px 12px;
border-radius:6px;
font-size:12px;
cursor:pointer;
}

.stats{
display:grid;
grid-template-columns:repeat(5,1fr);
gap:12px;
margin-bottom:20px;
}

.stat{
background:#f9fafb;
border-radius:8px;
padding:14px;
border:1px solid #eee;
font-size:12px;
}

.stat strong{
display:block;
font-size:18px;
margin-bottom:4px;
}

.table-box{
border:1px solid #e5e7eb;
border-radius:10px;
overflow:hidden;
}

table{
width:100%;
border-collapse:collapse;
font-size:12px;
}

thead{
background:#f3f4f6;
}

th{
padding:12px;
text-align:left;
border-bottom:1px solid #e5e7eb;
font-weight:600;
}

td{
padding:12px;
border-bottom:1px solid #f1f1f1;
}

.badge{
padding:4px 10px;
border-radius:12px;
font-size:11px;
}

.badge.red{
background:#fee2e2;
color:#991b1b;
}

.badge.yellow{
background:#fef3c7;
color:#92400e;
}

.view-btn{
background:#667F35;
color:white;
border:none;
padding:6px 14px;
border-radius:6px;
cursor:pointer;
font-size:12px;
}

      `}</style>

            <div className="container">
                <div className="header">
                    <div className="title">Company List</div>
                    <button className="export-btn">Export</button>
                </div>

                <div className="filters">
                    <div className="filter">Retail</div>
                    <div className="filter">Deal Owner</div>
                    <div className="filter">Created Date</div>
                    <div className="filter">Country</div>
                    <div className="filter">Lifecycle Stage</div>
                    <div className="filter">Source</div>
                    <div className="filter">Campaign Code</div>
                </div>

                <div className="stats">
                    <div className="stat">
                        <strong>10</strong>
                        Total Companies
                    </div>

                    <div className="stat">
                        <strong>6</strong>
                        Companies with Active Deals
                    </div>

                    <div className="stat">
                        <strong>260,590</strong>
                        Total Pipeline Value
                    </div>

                    <div className="stat">
                        <strong>4</strong>
                        Dormant Accounts
                    </div>

                    <div className="stat">
                        <strong>2</strong>
                        SLA Breached Accounts
                    </div>
                </div>

                <div className="table-box">
                    <table>
                        <thead>
                            <tr>
                                <th>Lead</th>
                                <th>Email</th>
                                <th>Owner</th>
                                <th>Phone</th>
                                <th>Country</th>
                                <th>Lifecycle Stage</th>
                                <th>Source</th>
                                <th>Created Date</th>
                                <th>Campaign Code</th>
                                <th>SLA Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan="11">Loading...</td>
                                </tr>
                            )}

                            {!loading &&
                                rows.map((c) => (
                                    <tr key={c.company_id}>
                                        <td>{c.lead}</td>
                                        <td>{c.email}</td>
                                        <td>{c.owner}</td>
                                        <td>{c.phone}</td>
                                        <td>{c.country}</td>
                                        <td>{c.lifecycle_stage}</td>
                                        <td>{c.source}</td>
                                        <td>{c.created_date}</td>
                                        <td>{c.campaign_code}</td>

                                        <td>
                                            {c.sla_status === "Breached" && (
                                                <span className="badge red">
                                                    Breached
                                                </span>
                                            )}

                                            {c.sla_status === "Due Soon" && (
                                                <span className="badge yellow">
                                                    Due Soon
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            <button className="view-btn">
                                                View
                                            </button>
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
