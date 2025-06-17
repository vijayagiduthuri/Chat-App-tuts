// import React from 'react'
// import { useAuthStore } from '../store/useAuthStore.js'
// import { useState } from 'react'
// import { Camera, Mail, User, } from 'lucide-react'

// const ProfilePage = () => {
//   const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();

//   // State to manage the selected image for profile picture upload
//   const [selectedImg, setSelectedImg] = useState(null);

//   // Function to handle image upload
//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Check if the file is an image
//     const reader = new FileReader();

//     // Read the file as a data URL
//     reader.readAsDataURL(file);

//     // When the file is loaded, set the selected image and update the profile
//     reader.onload = async () => {
//       const base64Image = reader.result;
//       setSelectedImg(base64Image);
//       await updateProfile({ profilePic: base64Image });
//     };
//   };

//   return (
//     <div className="h-screen pt-20">
//       <div className="max-w-2xl mx-auto p-4 py-8">
//         <div className="bg-base-300 rounded-xl p-6 space-y-8">
//           <div className="text-center">
//             <h1 className="text-2xl font-semibold ">Profile</h1>
//             <p className="mt-2">Your profile information</p>
//           </div>

//           {/* profile upload section */}

//           <div className="flex flex-col items-center gap-4">
//             <div className="relative">
//               <img
//                 src={selectedImg || authUser.profilePic || "/avatar.png"}
//                 alt="Profile"
//                 className="size-32 rounded-full object-cover border-4 "
//               />
//               <label
//                 htmlFor="avatar-upload"
//                 className={`
//                   absolute bottom-0 right-0 
//                   bg-base-content hover:scale-105
//                   p-2 rounded-full cursor-pointer 
//                   transition-all duration-200
//                   ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
//                 `}
//               >
//                 <Camera className="w-5 h-5 text-base-200" />
//                 <input
//                   type="file"
//                   id="avatar-upload"
//                   className="hidden"
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   disabled={isUpdatingProfile}
//                 />
//               </label>
//             </div>
//             <p className="text-sm text-zinc-400">
//               {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
//             </p>
//           </div>
//           {/* profile information section */}
//           <div className="space-y-6">
//             <div className="space-y-1.5">
//               <div className="text-sm text-zinc-400 flex items-center gap-2">
//                 <User className="w-4 h-4" />
//                 Full Name
//               </div>
//               <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
//             </div>

//             <div className="space-y-1.5">
//               <div className="text-sm text-zinc-400 flex items-center gap-2">
//                 <Mail className="w-4 h-4" />
//                 Email Address
//               </div>
//               <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
//             </div>
//           </div>
//           {/* account information section */}
//           <div className="mt-6 bg-base-300 rounded-xl p-6">
//             <h2 className="text-lg font-medium  mb-4">Account Information</h2>
//             <div className="space-y-3 text-sm">
//               <div className="flex items-center justify-between py-2 border-b border-zinc-700">
//                 <span>Member Since</span>
//                 <span>{authUser.createdAt?.split("T")[0]}</span>
//               </div>
//               <div className="flex items-center justify-between py-2">
//                 <span>Account Status</span>
//                 <span className="text-green-500">Active</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;



import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import {
  Camera,
  Mail,
  User,
  Calendar,
  CheckCircle,
  Loader2,
  Globe
} from 'lucide-react';

const ProfilePage = () => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();

  const [selectedImg, setSelectedImg] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      setImagePreview(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-6xl mx-auto p-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400">View and manage your profile information</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Left Section */}
          <div className="lg:w-1/3 flex flex-col h-full">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex-1">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4 w-40 h-40 mx-auto">
                  {selectedImg || authUser?.profilePic ? (
                    <img
                      src={imagePreview || selectedImg || authUser.profilePic}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                      <span className="text-white text-4xl font-bold">
                        {getInitials(authUser?.fullName)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <label
                  htmlFor="avatar-upload"
                  className={`flex items-center justify-center gap-2 w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 mb-6
                    ${isUpdatingProfile ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"}
                    transition-colors duration-200`}
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-5 h-5 text-gray-600 dark:text-gray-400 animate-spin" />
                      <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">Change Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdatingProfile}
                  />
                </label>
              </div>

              {/* User Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-2">
                  {authUser?.fullName || 'User Name'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                  {authUser?.email || 'user@example.com'}
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 mb-8">
                  <CheckCircle className="w-4 h-4" />
                  <span>Verified Account</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Member Since</span>
                    <span className="text-gray-800 dark:text-white font-medium">
                      {formatDate(authUser?.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Last Updated</span>
                    <span className="text-gray-800 dark:text-white font-medium">
                      {formatDate(authUser?.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="lg:w-2/3 flex flex-col justify-between h-full gap-6">
            {/* Personal Details */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Personal Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Full Name</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-800 dark:text-white">{authUser?.fullName || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Email Address</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-800 dark:text-white break-all">{authUser?.email || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* App Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">App Preferences</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Dark Mode</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-800 dark:text-white">System Default</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Language</label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-800 dark:text-white">English</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
