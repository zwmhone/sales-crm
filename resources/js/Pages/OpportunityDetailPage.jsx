import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function OpportunityDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/opportunities/${id}`)
            .then((res) => res.json())
            .then((res) => {
                setData(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="p-10">Loading...</div>;
    if (!data) return <div className="p-10">Opportunity not found.</div>;

    const { opportunity, contacts, documents, activities } = data;

    return (
        <div className="bg-[#F3EFEA] min-h-screen p-10">
            <div className="max-w-6xl mx-auto">
                {/* HEADER */}
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h1 className="text-xl font-semibold text-[#667F35]">
                        Opportunity Detail – {opportunity.deal_name}
                    </h1>

                    <div className="mt-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-[#667F35] hover:bg-[#5a6f2f] text-white px-4 py-2 rounded-md text-sm font-semibold"
                        >
                            Go Back
                        </button>
                    </div>
                </div>

                {/* DEAL INFO */}
                <div className="bg-white rounded-xl shadow p-6 mb-8">
                    <h2 className="font-semibold text-gray-700 mb-6">
                        Deal Information
                    </h2>

                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <Info
                            label="Opportunity Name"
                            value={opportunity.deal_name}
                        />
                        <Info label="Stage" value={opportunity.deal_stage} />
                        <Info
                            label="Amount"
                            value={`SGD ${opportunity.deal_amount}`}
                        />
                        <Info
                            label="Stage Entry Date"
                            value={opportunity.stage_entry_date}
                        />
                        <Info label="Owner" value="DBD Team" />
                    </div>
                </div>

                {/* RELATED CONTACTS */}
                <Section title="Related Contacts">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="text-left p-3">Name</th>
                                <th className="text-left p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((c) => (
                                <tr key={c.contact_id} className="border-b">
                                    <td className="p-3">
                                        {c.contact_first_name}{" "}
                                        {c.contact_last_name}
                                    </td>
                                    <td className="p-3">
                                        <button className="bg-[#667F35] hover:bg-[#5a6f2f] text-white px-3 py-1 rounded text-xs">
                                            Open
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Section>

                {/* RELATED DOCUMENTS */}
                <Section title="Related Documents">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="text-left p-3">Document</th>
                                <th className="text-left p-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((doc, i) => (
                                <tr key={i} className="border-b">
                                    <td className="p-3">
                                        {doc.contract_name || "Document"}
                                    </td>
                                    <td className="p-3">
                                        {doc.created_at || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Section>

                {/* ACTIVITY + STATUS */}
                <div className="grid grid-cols-2 gap-6 mt-8">
                    {/* ACTIVITY */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="font-semibold text-gray-700 mb-4">
                            Activity History
                        </h2>

                        <div className="space-y-4">
                            {activities.map((a, i) => (
                                <div
                                    key={i}
                                    className="bg-gray-100 p-4 rounded-md text-sm"
                                >
                                    <p className="font-medium">
                                        {a.activity_status || "Activity"}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        {a.created_at || ""}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* STATUS */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="font-semibold text-gray-700 mb-4">
                            Status Tracking
                        </h2>

                        <p className="text-sm text-gray-500">Current Stage</p>
                        <p className="font-semibold mb-4">
                            {opportunity.deal_stage}
                        </p>

                        <button className="bg-[#667F35] hover:bg-[#5a6f2f] text-white px-4 py-2 rounded-md text-sm font-semibold">
                            Verify Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Small reusable components */

function Info({ label, value }) {
    return (
        <div>
            <p className="text-gray-500">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="font-semibold text-gray-700 mb-4">{title}</h2>
            {children}
        </div>
    );
}
