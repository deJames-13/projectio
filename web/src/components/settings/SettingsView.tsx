"use client";

import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Plus, 
  Check, 
  Mail
} from 'lucide-react';
import type { Member } from '~/types';

interface SettingsViewProps {
  currentUser: Member;
  members: Member[];
  onInviteMember?: (email: string, role: string) => void;
  onAddMember?: (member: Member) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  members,
  onInviteMember,
  onAddMember
}) => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'members' | 'security'>('workspace');
  const [workspaceName, setWorkspaceName] = useState('Acme Corp');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Engineer');
  const [isInviteSuccess, setIsInviteSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    if (onInviteMember) {
      onInviteMember(inviteEmail.trim(), inviteRole);
    }
    if (onAddMember) {
      const newMember: Member = {
        id: `user-${Date.now()}`,
        name: inviteEmail.split('@')[0] ?? 'Team Member',
        role: inviteRole,
        email: inviteEmail.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      };
      onAddMember(newMember);
    }
    setIsInviteSuccess(true);
    setInviteEmail('');
    setTimeout(() => setIsInviteSuccess(false), 3000);
  };

  return (
    <div id="settings-view" className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Workspace Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage workspace preferences, team members, permissions, and security.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200" role="tablist">
        <button
          onClick={() => setActiveTab('workspace')}
          role="tab"
          aria-selected={activeTab === 'workspace'}
          className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            activeTab === 'workspace'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>General</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          role="tab"
          aria-selected={activeTab === 'members'}
          className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            activeTab === 'members'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members & Permissions ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          role="tab"
          aria-selected={activeTab === 'security'}
          className={`flex items-center gap-2 pb-3 px-1 text-xs font-semibold border-b-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security & Audit</span>
        </button>
      </div>

      {/* Tab: General */}
      {activeTab === 'workspace' && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Workspace Details</h3>

            <div>
              <label htmlFor="workspace-name-input" className="text-xs font-semibold text-slate-700 block mb-1">
                Workspace Name
              </label>
              <input
                id="workspace-name-input"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full max-w-md bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="workspace-slug-input" className="text-xs font-semibold text-slate-700 block mb-1">
                Workspace Slug / URL
              </label>
              <div className="flex items-center max-w-md">
                <span className="bg-slate-100 border border-r-0 border-slate-200 px-3 py-2 text-xs text-slate-500 rounded-l-lg">
                  app.projectio.com/
                </span>
                <input
                  id="workspace-slug-input"
                  type="text"
                  readOnly
                  value="acme-corp"
                  className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-700 rounded-r-lg font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>

            {savedSuccess && (
              <span className="text-xs text-emerald-600 font-medium animate-in fade-in">Settings saved successfully</span>
            )}
          </div>
        </form>
      )}

      {/* Tab: Members */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Invite Section */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Invite New Team Member</h3>
            <form onSubmit={handleInviteSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-lg text-xs text-slate-900"
                />
              </div>

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="Engineer">Engineer</option>
                <option value="Product Designer">Product Designer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Admin">Admin</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Send Invite</span>
              </button>
            </form>

            {isInviteSuccess && (
              <p className="text-xs text-emerald-600 font-medium mt-2 animate-in fade-in">
                Invitation dispatched successfully!
              </p>
            )}
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Active Members</h3>
              <span className="text-xs text-slate-500 font-medium">{members.length} members</span>
            </div>

            <div className="divide-y divide-slate-100">
              {members.map(member => (
                <div key={member.id} className="px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{member.name}</h4>
                      <p className="text-[11px] text-slate-400">{member.role} • {member.email}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${
                    member.id === currentUser.id 
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {member.id === currentUser.id ? 'You (Admin)' : 'Member'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Authentication & Access</h3>
            <p className="text-xs text-slate-500 mt-1">Configure Single Sign-On (SSO) and session lifetimes.</p>
          </div>

          <div className="space-y-4 divide-y divide-slate-100">
            <div className="pt-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Two-Factor Authentication (2FA)</h4>
                <p className="text-[11px] text-slate-500">Require all workspace members to use 2FA.</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Enforced
              </span>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-900">SAML / Okta Single Sign-On</h4>
                <p className="text-[11px] text-slate-500">Allow enterprise identity providers.</p>
              </div>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
                Configure SSO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
