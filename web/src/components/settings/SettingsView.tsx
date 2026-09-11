"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  Plus,
  Check,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  AtSign,
  Briefcase,
  CheckSquare,
  FolderGit2,
  Upload,
  RotateCcw,
  Info,
  Crop as CropIcon
} from 'lucide-react';
import type { Member } from '~/types';
import { UserAvatar } from '~/components/ui/UserAvatar';
import { useUploadThing } from '~/utils/uploadthing';
import { ImageCropModal } from '~/components/modals/ImageCropModal';

export interface SettingsViewProps {
  currentUser: Member;
  members: Member[];
  onInviteMember?: (email: string, role: string) => void;
  onAddMember?: (member: Member) => void;
  onUpdateProfile?: (data: {
    name?: string;
    username?: string;
    role?: string;
    avatar?: string;
  }) => Promise<void>;
  initialTab?: 'profile' | 'workspace' | 'members' | 'security';
}

const STANDARD_ROLES = [
  'Product Lead',
  'Staff Architect',
  'Senior Fullstack Engineer',
  'Frontend Engineer',
  'DevOps / SRE',
  'Product Designer',
  'Security Engineer',
  'Custom',
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  members,
  onInviteMember,
  onAddMember,
  onUpdateProfile,
  initialTab = 'profile',
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'members' | 'security'>(initialTab);

  // Profile Form States
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username ?? '');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isResettingAvatar, setIsResettingAvatar] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState<string>("avatar.jpg");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedRole, setSelectedRole] = useState(
    STANDARD_ROLES.includes(currentUser.role) ? currentUser.role : 'Custom'
  );
  const [customRole, setCustomRole] = useState(
    STANDARD_ROLES.includes(currentUser.role) ? '' : currentUser.role
  );
  const [bio, setBio] = useState('Building high-velocity software with Projectio.');

  // Profile Action Feedback (5 states)
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Sync state if currentUser changes
  useEffect(() => {
    setName(currentUser.name);
    setUsername(currentUser.username ?? '');
    setAvatar(currentUser.avatar);
    if (STANDARD_ROLES.includes(currentUser.role)) {
      setSelectedRole(currentUser.role);
      setCustomRole('');
    } else {
      setSelectedRole('Custom');
      setCustomRole(currentUser.role);
    }
  }, [currentUser]);

  // Sync initialTab if changed
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Workspace Settings State
  const [workspaceName, setWorkspaceName] = useState('Acme Corp');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Engineer');
  const [isInviteSuccess, setIsInviteSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const effectiveRole = selectedRole === 'Custom' ? customRole.trim() : selectedRole;

  // Validation
  const isNameEmpty = !name.trim();
  const hasUnsavedChanges =
    name !== currentUser.name ||
    avatar !== currentUser.avatar ||
    effectiveRole !== currentUser.role;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNameEmpty) {
      setProfileErrorMsg('Display name cannot be blank.');
      return;
    }

    setIsSavingProfile(true);
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    try {
      if (onUpdateProfile) {
        await onUpdateProfile({
          name: name.trim(),
          role: effectiveRole || 'Member',
          avatar: avatar.trim(),
        });
      }
      setProfileSuccessMsg('Profile and role updated successfully across all workspace views.');
      setTimeout(() => setProfileSuccessMsg(null), 5000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setProfileErrorMsg(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // UploadThing hook for profile picture uploads (< 1MB)
  const { startUpload, isUploading } = useUploadThing("profilePicture", {
    onClientUploadComplete: async (res) => {
      const uploadedUrl = res?.[0]?.ufsUrl ?? res?.[0]?.url;
      if (uploadedUrl) {
        setAvatar(uploadedUrl);
        setUploadError(null);
        try {
          if (onUpdateProfile) {
            await onUpdateProfile({
              name: name.trim(),
              role: effectiveRole || 'Member',
              avatar: uploadedUrl,
            });
          }
          setProfileSuccessMsg('Profile picture uploaded and saved successfully across your workspace.');
          setTimeout(() => setProfileSuccessMsg(null), 5000);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to update profile picture.';
          setProfileErrorMsg(msg);
        }
      }
    },
    onUploadError: (err) => {
      const msg = err.message || 'Upload failed. Please ensure UPLOADTHING_TOKEN is set in your .env file.';
      setUploadError(msg);
    },
  });

  const handleFileSelection = (file: File) => {
    setUploadError(null);

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a PNG, JPG, or WEBP image.');
      return;
    }

    // Safeguard check on input file size
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Source image is too large (> 15MB). Please select a smaller file.');
      return;
    }

    // Create object URL and open 1:1 crop modal
    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setCropFileName(file.name);
    setCropModalOpen(true);
  };

  const handleOpenReCrop = () => {
    if (!avatar) return;
    setUploadError(null);
    setCropImageSrc(avatar);
    setCropFileName(`${currentUser.username ?? 'user'}-avatar.jpg`);
    setCropModalOpen(true);
  };

  const handleCropComplete = async (croppedFile: File) => {
    // Strict 1MB check on final cropped export
    if (croppedFile.size > 1024 * 1024) {
      setUploadError('Cropped image exceeds 1MB limit. Please adjust zoom and try again.');
      return;
    }

    try {
      await startUpload([croppedFile]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setUploadError(msg);
    } finally {
      if (cropImageSrc?.startsWith('blob:')) {
        URL.revokeObjectURL(cropImageSrc);
      }
    }
  };

  const handleCloseCropModal = () => {
    if (cropImageSrc?.startsWith('blob:')) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setCropModalOpen(false);
    setCropImageSrc(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileSelection(file);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFileSelection(file);
    }
  };

  const handleResetToInitial = async () => {
    setIsResettingAvatar(true);
    setUploadError(null);
    try {
      setAvatar('');
      if (onUpdateProfile) {
        await onUpdateProfile({
          name: name.trim(),
          role: effectiveRole || 'Member',
          avatar: '',
        });
      }
      setProfileSuccessMsg('Profile picture reset to default letter avatar.');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset avatar.';
      setProfileErrorMsg(msg);
    } finally {
      setIsResettingAvatar(false);
    }
  };

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
    <div id="settings-view" className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Account &amp; Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal identity, role customizations, team members, and enterprise security.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto" role="tablist">
        <button
          onClick={() => setActiveTab('profile')}
          role="tab"
          aria-selected={activeTab === 'profile'}
          className={`flex items-center gap-2 pb-3 px-2 sm:px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === 'profile'
            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Profile &amp; Role</span>
        </button>

        <button
          onClick={() => setActiveTab('workspace')}
          role="tab"
          aria-selected={activeTab === 'workspace'}
          className={`flex items-center gap-2 pb-3 px-2 sm:px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === 'workspace'
            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>General Workspace</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          role="tab"
          aria-selected={activeTab === 'members'}
          className={`flex items-center gap-2 pb-3 px-2 sm:px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === 'members'
            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members &amp; Permissions ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          role="tab"
          aria-selected={activeTab === 'security'}
          className={`flex items-center gap-2 pb-3 px-2 sm:px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === 'security'
            ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security &amp; Audit</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: User Profile & Role Customizations (README ## 911 Item 39) */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Status Banners (Anti-slop 5 states) */}
          {profileSuccessMsg && (
            <div
              role="status"
              className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-medium animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {profileErrorMsg && (
            <div
              role="alert"
              className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center justify-between text-rose-800 dark:text-rose-300 text-xs font-medium animate-in fade-in"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{profileErrorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setProfileErrorMsg(null)}
                className="text-[11px] underline hover:no-underline font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Workspace Telemetry Overview Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Assigned Tasks
              </span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {currentUser.assignedTasksCount ?? 0}
              </p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Active Projects
              </span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {currentUser.projectsCount ?? 0}
              </p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Current Role
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate" title={currentUser.role}>
                {currentUser.role || 'Member'}
              </p>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Handle
              </span>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1 truncate">
                @{currentUser.username ?? 'unset'}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form
            onSubmit={handleProfileSubmit}
            className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6"
          >
            {/* 1. Avatar Customization */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  1. Profile Picture
                </label>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  PNG, JPG, WEBP • Max 1MB
                </span>
              </div>

              {/* Upload Error Banner */}
              {uploadError && (
                <div
                  role="alert"
                  className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center justify-between text-rose-800 dark:text-rose-300 text-xs font-medium animate-in fade-in"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    className="text-[11px] underline hover:no-underline font-semibold cursor-pointer shrink-0 ml-2"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Active Avatar Preview with badge and Reset Action */}
                <div className="flex flex-col items-center gap-2.5 shrink-0 w-full sm:w-auto">
                  <div className="relative group">
                    <UserAvatar
                      name={name}
                      avatar={avatar}
                      size="xl"
                      showOnlineIndicator={true}
                      isOnline={true}
                      className="shadow-md ring-2 ring-blue-600/30 dark:ring-blue-500/30 transition-transform group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    {avatar ? (
                      <div className="flex items-center gap-1.5 flex-wrap justify-center">
                        <button
                          type="button"
                          onClick={handleOpenReCrop}
                          disabled={isUploading || isResettingAvatar}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          title="Re-crop and adjust 1:1 framing of this photo"
                        >
                          <CropIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span>Edit crop</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResetToInitial}
                          disabled={isResettingAvatar || isUploading}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                          title="Remove uploaded image and revert to first-letter initial"
                        >
                          {isResettingAvatar ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          <span>Reset</span>
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md">
                        Using initial: &quot;{(name.trim() || 'U').charAt(0).toUpperCase()}&quot;
                      </span>
                    )}
                  </div>
                </div>

                {/* UploadThing Dropzone & Uploader */}
                <div className="flex-1 w-full space-y-3">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (!isUploading) {
                        fileInputRef.current?.click();
                      }
                    }}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload profile picture (Max 1MB)"
                    className={`relative border-2 border-dashed rounded-xl p-5 sm:p-6 text-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${isDragging
                      ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/60 bg-slate-50/40 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950/60'
                      } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileInputChange}
                      className="hidden"
                      aria-hidden="true"
                    />

                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2.5 py-3 animate-in fade-in">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
                          <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            Uploading image to UploadThing...
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Saving and optimizing your profile picture.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs group-hover:scale-105 transition-transform">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            <span className="text-blue-600 dark:text-blue-400 underline hover:no-underline">
                              Click to choose an image
                            </span>{' '}
                            or drag &amp; drop
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            PNG, JPG, or WEBP up to 1MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Microcopy Helper */}
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 px-1">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span>
                      Your photo is hosted via UploadThing and securely linked to your account. Removing your photo automatically reverts to your initial letter badge.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* 2. Role & Specialization Customization */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
                2. Role &amp; Specialization Customization
              </label>

              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STANDARD_ROLES.map((roleOpt) => {
                    const isSelected = selectedRole === roleOpt;
                    return (
                      <button
                        key={roleOpt}
                        type="button"
                        onClick={() => setSelectedRole(roleOpt)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border text-left flex items-center justify-between transition-all cursor-pointer ${isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/20'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                      >
                        <span className="truncate">{roleOpt}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {selectedRole === 'Custom' && (
                  <div className="pt-2 animate-in fade-in duration-150">
                    <label htmlFor="custom-role-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Specify Custom Role Title
                    </label>
                    <input
                      id="custom-role-input"
                      type="text"
                      required
                      placeholder="e.g. Founder &amp; Lead Architect, AI Research Engineer"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="w-full max-w-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* 3. Identity Details */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
                3. Identity &amp; Handle
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="profile-name-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="profile-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-slate-950 border rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white transition-colors ${isNameEmpty
                      ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-400/20'
                      : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none'
                      }`}
                  />
                  {isNameEmpty && (
                    <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                      Name is required.
                    </span>
                  )}
                </div>

                {/* Username (@handle) - Disabled for now */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="profile-username-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Username Handle
                    </label>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      Locked
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-slate-100 dark:bg-slate-800/80 border border-r-0 border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-400 dark:text-slate-500 rounded-l-lg font-mono select-none">
                      @
                    </span>
                    <input
                      id="profile-username-input"
                      type="text"
                      disabled
                      aria-disabled="true"
                      readOnly
                      value={currentUser.username ?? username}
                      placeholder="username"
                      className="flex-1 bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 rounded-r-lg font-mono cursor-not-allowed select-none transition-colors focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Username handle changing is temporarily disabled.
                  </p>
                </div>

                {/* Primary Work Email */}
                <div>
                  <label htmlFor="profile-email-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Primary Work Email
                  </label>
                  <div className="relative">
                    <input
                      id="profile-email-input"
                      type="email"
                      readOnly
                      value={currentUser.email}
                      className="w-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed pr-20 font-mono"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Managed by your authentication provider.
                  </p>
                </div>

                {/* Bio / Status Headline */}
                <div>
                  <label htmlFor="profile-bio-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Professional Headline / Bio
                  </label>
                  <input
                    id="profile-bio-input"
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. Leading web product initiatives"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Unsaved profile changes
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSavingProfile || isNameEmpty}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Profile &amp; Role</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: General Workspace */}
      {activeTab === 'workspace' && (
        <form onSubmit={handleSaveGeneral} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Details</h3>

            <div>
              <label htmlFor="workspace-name-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Workspace Name
              </label>
              <input
                id="workspace-name-input"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full max-w-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="workspace-slug-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Workspace Slug / URL
              </label>
              <div className="flex items-center max-w-md">
                <span className="bg-slate-100 dark:bg-slate-800 border border-r-0 border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-500 dark:text-slate-400 rounded-l-lg">
                  app.projectio.com/
                </span>
                <input
                  id="workspace-slug-input"
                  type="text"
                  readOnly
                  value="acme-corp"
                  className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 rounded-r-lg font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>

            {savedSuccess && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in">
                Settings saved successfully
              </span>
            )}
          </div>
        </form>
      )}

      {/* Tab: Members */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Invite Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Invite New Team Member</h3>
            <form onSubmit={handleInviteSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none rounded-lg text-xs text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
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
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 animate-in fade-in">
                Invitation dispatched successfully!
              </p>
            )}
          </div>

          {/* Members Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Members</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{members.length} members</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {members.map(member => (
                <div key={member.id} className="px-6 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={member.name}
                      username={member.username}
                      email={member.email}
                      avatar={member.avatar}
                      size="md"
                      className="ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{member.name}</h4>
                        {member.username && (
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                            @{member.username}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{member.role} • {member.email}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${member.id === currentUser.id
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Authentication &amp; Access</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure Single Sign-On (SSO) and session lifetimes.</p>
          </div>

          <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
            <div className="pt-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Require all workspace members to use 2FA.</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                Enforced
              </span>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white">SAML / Okta Single Sign-On</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Allow enterprise identity providers.</p>
              </div>
              <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer">
                Configure SSO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1:1 Profile Picture Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        fileName={cropFileName}
        onClose={handleCloseCropModal}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};
