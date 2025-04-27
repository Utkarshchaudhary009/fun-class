"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className='flex justify-center py-8'>Loading user data...</div>;
  }

  return (
    <div className='max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden'>
      <div className='p-8'>
        <div className='flex flex-col md:flex-row items-center gap-8'>
          {user?.imageUrl && (
            <div className='relative w-32 h-32 rounded-full overflow-hidden'>
              <Image
                src={user.imageUrl}
                alt={user.fullName || "User"}
                fill
                className='object-cover'
              />
            </div>
          )}
          <div>
            <h1 className='text-2xl font-bold'>
              {user?.fullName || "Anonymous User"}
            </h1>
            <p className='text-gray-600'>
              {user?.primaryEmailAddress?.emailAddress}
            </p>
            <p className='mt-2 text-sm text-gray-500'>User ID: {user?.id}</p>
          </div>
        </div>

        <div className='mt-8 border-t pt-6'>
          <h2 className='text-xl font-semibold mb-4'>Account Information</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>
                Email Addresses
              </h3>
              <ul className='mt-1'>
                {user?.emailAddresses?.map((email) => (
                  <li
                    key={email.id}
                    className='text-gray-800'
                  >
                    {email.emailAddress}
                    {email.id === user.primaryEmailAddressId && (
                      <span className='ml-2 text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded'>
                        Primary
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>Created</h3>
              <p className='mt-1 text-gray-800'>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
