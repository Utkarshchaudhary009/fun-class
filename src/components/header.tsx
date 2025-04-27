"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header className="flex items-center justify-between py-4 px-6 bg-white shadow-sm">
      <Link href="/" className="font-bold text-xl">
        FunClass
      </Link>
      
      <nav className="flex items-center gap-4">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        {isSignedIn && (
          <Link href="/profile" className="hover:text-blue-600">
            Profile
          </Link>
        )}
      </nav>

      <div className="flex items-center gap-4">
        {!isSignedIn ? (
          <>
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Sign Up
              </button>
            </SignUpButton>
          </>
        ) : (
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: "w-10 h-10",
              },
            }}
          />
        )}
      </div>
    </header>
  );
} 