"use client";
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Account Security</h2>
          <p className="text-sm text-gray-500">Manage your password and authentication methods.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center pb-6 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-800">Change Password</h3>
              <p className="text-sm text-gray-500">Update your password to keep your account secure.</p>
            </div>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50">
              Update
            </button>
          </div>

          <div className="flex justify-between items-center pb-6 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-800">Two-Factor Authentication (2FA)</h3>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
            </div>
            <button className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-bold hover:bg-blue-800">
              Enable
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Notifications</h2>
          <p className="text-sm text-gray-500">Manage how we communicate with you.</p>
        </div>
        
        <div className="p-6 space-y-4">
          <label className="flex items-center space-x-3">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="font-semibold text-gray-800 text-sm">Order Status Updates (Email & SMS)</span>
          </label>
          <label className="flex items-center space-x-3">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="font-semibold text-gray-800 text-sm">Promotional Offers & Rate Alerts</span>
          </label>
        </div>
      </div>
    </div>
  );
}
