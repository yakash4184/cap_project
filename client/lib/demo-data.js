export const demoIssues = [
  {
    _id: "issue-1",
    title: "Overflowing garbage near Sector 21 market",
    description: "Waste collection missed three days in a row and the footpath is blocked.",
    category: "garbage",
    status: "pending",
    assignedDepartment: "Sanitation",
    createdAt: "2026-03-14T09:30:00.000Z",
    updatedAt: "2026-03-14T09:30:00.000Z",
    imageUrl:
      "https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&w=1200&q=80",
    location: {
      lat: 28.6139,
      lng: 77.209,
      address: "Sector 21 Main Market",
    },
    reportedBy: {
      name: "Riya Sharma",
      email: "riya@example.com",
      role: "user",
    },
  },
  {
    _id: "issue-2",
    title: "Pothole widening on ring road",
    description: "Heavy traffic area, visible risk for two-wheelers during evening rush.",
    category: "road",
    status: "in-progress",
    assignedDepartment: "Road Works",
    createdAt: "2026-03-07T07:10:00.000Z",
    updatedAt: "2026-03-18T11:00:00.000Z",
    imageUrl:
      "https://images.unsplash.com/photo-1541417904950-b855846fe074?auto=format&fit=crop&w=1200&q=80",
    location: {
      lat: 28.622,
      lng: 77.217,
      address: "Ring Road Junction",
    },
    reportedBy: {
      name: "Aman Verma",
      email: "aman@example.com",
      role: "user",
    },
  },
  {
    _id: "issue-3",
    title: "Streetlight out near community park",
    description: "Complete dark patch from gate to walkway, unsafe after 8 PM.",
    category: "streetlight",
    status: "resolved",
    assignedDepartment: "Electricity Board",
    createdAt: "2026-02-28T18:25:00.000Z",
    updatedAt: "2026-03-05T13:40:00.000Z",
    imageUrl:
      "https://images.unsplash.com/photo-1499096382193-ebb232527fee?auto=format&fit=crop&w=1200&q=80",
    location: {
      lat: 28.6315,
      lng: 77.2167,
      address: "Community Park Entrance",
    },
    reportedBy: {
      name: "Neha Joshi",
      email: "neha@example.com",
      role: "user",
    },
  },
];

export const demoNotifications = [
  {
    _id: "note-1",
    message: 'Your issue "Pothole widening on ring road" moved to in-progress.',
    read: false,
    createdAt: "2026-03-18T11:00:00.000Z",
    issue: {
      title: "Pothole widening on ring road",
      status: "in-progress",
      category: "road",
    },
  },
  {
    _id: "note-2",
    message: 'Your issue "Streetlight out near community park" has been resolved.',
    read: true,
    createdAt: "2026-03-05T13:40:00.000Z",
    issue: {
      title: "Streetlight out near community park",
      status: "resolved",
      category: "streetlight",
    },
  },
];

export const demoStats = {
  totalIssues: 128,
  pendingIssues: 36,
  inProgressIssues: 41,
  resolvedIssues: 51,
  stalePendingIssues: 9,
};

