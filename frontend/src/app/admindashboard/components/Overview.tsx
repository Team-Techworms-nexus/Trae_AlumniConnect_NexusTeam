'use client';

interface CollegeStats {
  total_students: number;
  total_alumni: number;
  total_achievements: number;
  total_donations: number;
  donations_growth_percent: number;
  achievements_growth_percent: number;
  active_groups: number;
  upcoming_events: number;
  recent_achievements: number;
  recent_donations: number;
}

interface OverviewProps {
  stats: CollegeStats;
  loading: boolean;
  error: string | null;
}

export default function Overview({ stats, loading, error }: OverviewProps) {
  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Loading college statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600">{error}</p>
        <button 
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-black">Add New Student</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Add Student
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                id="excel-upload-student"
              />
              <label
                htmlFor="excel-upload-student"
                className="w-full cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block text-center"
              >
                Upload Excel
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 text-black">Add New Alumni</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Add Alumni
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                id="excel-upload-alumni"
              />
              <label
                htmlFor="excel-upload-alumni"
                className="w-full cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block text-center"
              >
                Upload Excel
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-black mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-black">{stats.total_students.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-black mb-2">Total Alumni</h3>
          <p className="text-3xl font-bold text-black">{stats.total_alumni.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-black mb-2">Total Achievements</h3>
          <p className="text-3xl font-bold text-black">{stats.total_achievements.toLocaleString()}</p>
          <p className="text-sm text-black mt-1">
            {stats.achievements_growth_percent > 0 ? '↑' : '↓'} {Math.abs(stats.achievements_growth_percent).toFixed(1)}% this month
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-black mb-2">Total Donations</h3>
          <p className="text-3xl font-bold text-black">₹{stats.total_donations.toLocaleString()}</p>
          <p className="text-sm text-black mt-1">
            {stats.donations_growth_percent > 0 ? '↑' : '↓'} {Math.abs(stats.donations_growth_percent).toFixed(1)}% this month
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-black mb-2">Active Groups</h3>
          <p className="text-3xl font-bold text-black">{stats.active_groups}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-black mb-2">Upcoming Events</h3>
          <p className="text-3xl font-bold text-black">{stats.upcoming_events}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-black mb-2">Recent Achievements</h3>
          <p className="text-3xl font-bold text-black">{stats.recent_achievements}</p>
          <p className="text-sm text-black mt-1">This month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-black mb-2">Recent Donations</h3>
          <p className="text-3xl font-bold text-black">₹{stats.recent_donations.toLocaleString()}</p>
          <p className="text-sm text-black mt-1">This month</p>
        </div>
      </div>
    </div>
  );
}