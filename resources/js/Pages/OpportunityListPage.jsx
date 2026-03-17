import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OpportunityListPage() {
    const [data, setData] = useState([]);
    const [activeBU, setActiveBU] = useState("All");
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/api/opportunities")
            .then((res) => res.json())
            .then((res) => setData(res.data));
    }, []);

    const filteredData =
        activeBU === "All" ? data : data.filter((item) => item.bu === activeBU);

    return (
        <div className="p-8 bg-[#F3EFEA] min-h-screen">
            <div className="bg-white rounded-xl shadow p-6">
                {/* Header + BU Tabs */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-semibold">Opportunity List</h1>

                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        {["All", "Retail", "Alliance", "Enterprise"].map(
                            (bu) => (
                                <button
                                    key={bu}
                                    onClick={() => setActiveBU(bu)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition 
                                ${
                                    activeBU === bu
                                        ? "bg-white shadow text-black"
                                        : "text-gray-500"
                                }`}
                                >
                                    {bu}
                                </button>
                            ),
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="text-left px-6 py-4">
                                    Opportunity
                                </th>
                                <th className="text-left px-6 py-4">Company</th>
                                <th className="text-left px-6 py-4">Stage</th>
                                <th className="text-left px-6 py-4">Value</th>
                                <th className="text-left px-6 py-4">Owner</th>
                                <th className="text-left px-6 py-4">SOP</th>
                                <th className="text-right px-6 py-4">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {filteredData.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 transition"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium">
                                            {item.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {item.code}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        {item.company}
                                    </td>

                                    <td className="px-6 py-4">
                                        <StageBadge stage={item.stage} />
                                    </td>

                                    <td className="px-6 py-4">{item.value}</td>

                                    <td className="px-6 py-4">{item.owner}</td>

                                    <td className="px-6 py-4">
                                        <SopBadge status={item.sop} />
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/opportunities/${item.id}`,
                                                )
                                            }
                                            className="bg-[#667F35] hover:bg-[#5a6f2f] text-white px-4 py-1.5 rounded-md text-xs font-semibold"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="text-xs text-gray-400 mt-4">
                    Data source: database
                </div>
            </div>
        </div>
    );
}

/* ---------------------- */
/* Badge Components */
/* ---------------------- */

function StageBadge({ stage }) {
    const styles = {
        Bronze: "bg-yellow-100 text-yellow-700",
        Silver: "bg-gray-200 text-gray-700",
        Gold: "bg-amber-100 text-amber-700",
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[stage]}`}
        >
            {stage}
        </span>
    );
}

function SopBadge({ status }) {
    const styles = {
        "Due Soon": "bg-yellow-100 text-yellow-700",
        Breached: "bg-red-100 text-red-600",
        Good: "bg-green-100 text-green-700",
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-600"}`}
        >
            {status}
        </span>
    );
}
