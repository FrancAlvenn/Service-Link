import { Button } from "@material-tailwind/react";
import React, { useContext, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { UserContext } from "../../context/UserContext";
import axios from "axios";
import { AuthContext } from "../../features/authentication";

dayjs.extend(relativeTime);

const ActivityTab = ({ referenceNumber }) => {
    const [selectedTab, setSelectedTab] = useState(localStorage.getItem("selected_activity_tab"));
    const [activityType, setActivityType] = useState();
    const [editingActivity, setEditingActivity] = useState(null);
    const [visibility, setVisibility] = useState("");
    
    const [content, setContent] = useState("");
    const [editContent, setEditContent] = useState("");
    
    const { user } = useContext(AuthContext);

    const { getUserByReferenceNumber } = useContext(UserContext);

    const [activities, setActivities] = useState([]);


    const getRequestActivity = async () => {
        await axios({
            method: "GET",
            url: `/request_activity/${referenceNumber}`,
            withCredentials: true,
        })
        .then((res) => {
            setActivities(Array.isArray(res.data) ? res.data : []);
        })
        .catch((error) => {
            console.error("Error fetching activities:", error);
        });
    };
    
    useEffect(() => {
        getRequestActivity();
    }, [referenceNumber]);
    

    const handleContentChange = (value) => {
        setContent(value);
    };

    function handleTabChange(tab) {
        setSelectedTab(tab);
        localStorage.setItem("selected_activity_tab", tab);
    }

    const handleSaveActivity = async () => {
        if (!content) return;
        if (content.trim() === "") return;
    
        const newActivity = {
            reference_number: referenceNumber,
            type: "comment",
            visibility: visibility,
            action: visibility === "internal" ? "Internal Note" : "Reply to Client",
            details: content,
            performed_by: user.reference_number,
        };
    
        try {
            await axios({
                method: "post",
                url: "/request_activity",
                data: newActivity,
                withCredentials: true
            }).then((res) => {
                getRequestActivity();
            })
        } catch (error) {
            console.error("Error saving activity:", error);
        }

        setActivities((prevActivities) => [...(prevActivities || []), newActivity]);
        setContent("");
        setActivityType(null);
    };


    function handleEditClick(activity) {
        setEditingActivity(activity.id);
        setEditContent(activity.details);
    }

    const handleSaveEdit = async (id) => {
        try {
            await axios({
                method: "put",
                url: `/request_activity/${id}`,
                data: {
                    details: editContent,
                    performed_by: user.reference_number,
                },
                withCredentials: true,
            });

            // Update the local state
            setActivities((prevActivities) =>
                prevActivities.map((activity) =>
                    activity.id === id ? { ...activity, details: editContent } : activity
                )
            );

            setEditingActivity(null);
        } catch (error) {
            console.error("Error updating activity:", error);
        }
    };

    function handleDeleteActivity(id) {
        axios({
            method: "DELETE",
            url: `/request_activity/${id}`,
            withCredentials: true,
        })
        .then(() => {
            setActivities(activities.filter((activity) => activity.id !== id));
        })
        .catch((error) => {
            console.error("Error deleting activity:", error);
        });
    }

    return (
        <div className="flex flex-col gap-2 p-3 border-gray-400 border rounded-md">
            <span className="flex gap-1">
                <p className="text-sm font-semibold text-gray-600">Activity</p>
            </span>

            {/* Tab Selection */}
            <div className="flex items-center gap-2 mb-3">
                <p className="text-sm font-normal text-gray-500">Show</p>
                <Button variant="outlined" color={selectedTab === "all" ? "blue" : "gray"} size="sm" className="text-xs py-1 px-2" onClick={() => handleTabChange("all")}>All</Button>
                <Button variant="outlined" color={selectedTab === "comment" ? "blue" : "gray"} size="sm" className="text-xs py-1 px-2" onClick={() => handleTabChange("comment")}>Comment</Button>
                <Button variant="outlined" color={selectedTab === "status_change" ? "blue" : "gray"} size="sm" className="text-xs py-1 px-2" onClick={() => handleTabChange("status_change")}>Status Change</Button>
                <Button variant="outlined" color={selectedTab === "approval" ? "blue" : "gray"} size="sm" className="text-xs py-1 px-2" onClick={() => handleTabChange("approval")}>Approval</Button>
            </div>

            {/*  */}
            <div className="flex items-center gap-2 px-4 py-2 border-gray-400 border rounded-md">
                <p className={`text-sm font-semibold cursor-pointer ${visibility === 'internal' ? 'text-blue-500' : 'text-gray-500'}`} onClick={() => setVisibility("internal")}>Add internal note </p>
                <p>/</p>
                <p className={`text-sm font-semibold cursor-pointer ${visibility === 'external' ? 'text-blue-500' : 'text-gray-500'}`} onClick={() => setVisibility("external")}>Reply to client</p>
            </div>

            {/* Add Request Activity - Comment when there is visibility */}
            {visibility && (
                <div className="flex flex-col gap-2">
                    <ReactQuill theme="snow" value={content} onChange={handleContentChange} />
                    <div className="flex gap-2 mt-12">
                        <Button variant="outlined" color="blue" className="text-xs py-1 px-2" disabled={!content || content.trim() === "" || content === "<p><br></p>"} onClick={() => handleSaveActivity() }>Save</Button>
                        <Button variant="outlined" color="gray" className="text-xs py-1 px-2" onClick={() => setVisibility("")}>Cancel</Button>
                    </div>
                </div>
            )}


           {/* Activity Feed */}
            <div className="mt-4 flex flex-col gap-2 pt-2">
                <div className="flex flex-col gap-3 p-2">
                    {activities?.length > 0 ? (
                        activities
                            .filter(activity =>
                                (activity.visibility !== "internal" || activity.created_by === user.reference_number) &&
                                (selectedTab === "all" || activity.request_type === selectedTab)
                            )
                            .map((activity) => {
                                const isUser = activity.created_by === user.reference_number;

                                // Different UI for each request type
                                if (activity.request_type === "status_change") {
                                    return (
                                        <div key={activity.id} className="py-2 px-3 bg-blue-100 text-blue-900 border-l-4 border-blue-500 rounded-md shadow-md">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold" dangerouslySetInnerHTML={{ __html: activity.action }}></p>
                                                <span className="text-xs text-gray-500">{dayjs(activity.created_at).fromNow()}</span>
                                            </div>
                                            <p className="text-sm">{activity.details}</p>
                                        </div>
                                    );
                                }

                                if (activity.request_type === "approval") {
                                    return (
                                        <div key={activity.id} className="py-2 px-3 bg-green-100 text-green-900 border-l-4 border-green-500 rounded-md shadow-md">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold" dangerouslySetInnerHTML={{ __html: activity.action }}></p>
                                                <span className="text-xs text-gray-500">{dayjs(activity.created_at).fromNow()}</span>
                                            </div>
                                            <p className="text-sm">{activity.details}</p>
                                        </div>
                                    );
                                }

                                // Default UI for Comments
                                return (
                                    <div key={activity.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                                        <div className="flex flex-col gap-2 max-w-[85%]">
                                            <div className="relative p-2 rounded-lg text-sm shadow-md bg-white text-gray-700">
                                                {/* Edit Mode (Only for Comments) */}
                                                {editingActivity === activity.id ? (
                                                    <div>
                                                        <ReactQuill theme="snow" value={editContent} onChange={setEditContent} className="w-full" />
                                                        <div className="flex gap-2 mt-2">
                                                            <Button variant="outlined" color="blue" className="text-xs py-1 px-2" disabled={!editContent || editContent.trim() === "" || editContent === "<p><br></p>"} onClick={() => handleSaveEdit(activity.id)}>Save</Button>
                                                            <Button variant="outlined" color="gray" className="text-xs py-1 px-2" onClick={() => setEditingActivity(null)}>Cancel</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="flex items-center justify-between gap-10">
                                                            <p className="text-xs font-semibold">{getUserByReferenceNumber(activity.created_by)}</p>
                                                            <span className="text-xs ml-auto text-gray-500 block mt-1">{dayjs(activity.created_at).fromNow()}</span>
                                                        </span>
                                                        <p dangerouslySetInnerHTML={{ __html: activity.details }} className="text-sm break-words whitespace-pre-wrap"></p>
                                                    </div>
                                                )}
                                            </div>

                                            {isUser && editingActivity !== activity.id && (
                                                <div className="right-2 flex gap-1 ml-auto">
                                                    <button className="text-xs text-white bg-gray-600 px-2 py-1 rounded" onClick={() => handleEditClick(activity)}>Edit</button>
                                                    <button className="text-xs text-white bg-red-500 px-2 py-1 rounded" onClick={() => handleDeleteActivity(activity.id)}>Delete</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                    ) : (
                        <div className="text-gray-500 text-sm text-center py-4">
                            No activities found.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default ActivityTab;
